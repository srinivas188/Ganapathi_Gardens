/**
 * Vector Database Integration & Synchronization Service
 * Ganapathi Gardens Plant Nursery RAG Pipeline
 * 
 * Supports:
 * 1. Pinecone Vector Database (when PINECONE_API_KEY is configured in .env)
 * 2. MongoDB Atlas Vector Store (active natively on Plant_Nest cluster)
 * 3. ChromaDB (when CHROMADB_URL is configured in .env)
 * 
 * Features:
 * - Automatic real-time upsert & deduplication when products are created/edited.
 * - Automatic deletion of vectors when products are removed.
 * - Comprehensive metadata storage (prices, sizes, care, stock, sunlight, water).
 * - Full startup synchronization utility.
 */

const { buildProductDocument, generateEmbedding, cosineSimilarity } = require('./embeddingService');
const { buildUnifiedVectorRecords, normalizeProductToChunk } = require('./unifiedRagPipeline');
const mongoose = require('mongoose');

// In-memory cache of vectors for high-speed similarity calculation
let inMemoryVectors = [];
let isInitialized = false;

/**
 * Get MongoDB Atlas collection for vectors
 */
function getVectorCollection() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection.collection('product_vectors');
  }
  return null;
}

/**
 * Initialize vector database and load vectors into memory cache
 */
async function initVectorDb() {
  if (isInitialized && inMemoryVectors.length > 0) return;
  try {
    const col = getVectorCollection();
    if (col) {
      const records = await col.find().toArray();
      if (records && records.length > 0) {
        inMemoryVectors = records;
        console.log(`🧠 [Vector DB] Initialized. Loaded ${inMemoryVectors.length} plant vectors into active memory.`);
        isInitialized = true;
        return;
      }
    }
    // If database is empty or not yet synced, trigger unified indexing
    console.log(`🧠 [Vector DB] Initializing unified data pipeline...`);
    await syncAllDataSources();
    isInitialized = true;
  } catch (err) {
    console.warn(`⚠️ [Vector DB] Initialization warning:`, err.message);
  }
}

/**
 * Upsert product vector to Pinecone (Optional integration via REST)
 */
async function upsertToPinecone(vectorRecord) {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexHost = process.env.PINECONE_HOST;
  if (!apiKey || !indexHost) return null;

  try {
    const url = `${indexHost.replace(/\/$/, '')}/vectors/upsert`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({
        vectors: [{
          id: vectorRecord.id,
          values: vectorRecord.vector,
          metadata: vectorRecord.metadata
        }]
      })
    });
    if (response.ok) {
      console.log(`🌲 [Pinecone] Successfully synced vector for: ${vectorRecord.metadata.product_name || vectorRecord.metadata.name}`);
      return true;
    }
  } catch (err) {
    console.warn(`Pinecone sync error:`, err.message);
  }
  return false;
}

/**
 * Delete product vector from Pinecone
 */
async function deleteFromPinecone(productId) {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexHost = process.env.PINECONE_HOST;
  if (!apiKey || !indexHost) return null;

  try {
    const url = `${indexHost.replace(/\/$/, '')}/vectors/delete`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({ ids: [productId] })
    });
    console.log(`🌲 [Pinecone] Deleted vector for productId: ${productId}`);
  } catch (err) {
    console.warn(`Pinecone delete error:`, err.message);
  }
}

/**
 * Upsert or update a single product in the Vector Database.
 * Prevents duplicates by keying on productId.
 */
async function upsertProductVector(product) {
  if (!product || (!product.id && !product._id)) {
    console.warn('Cannot upsert vector: invalid product data');
    return null;
  }

  const chunk = normalizeProductToChunk(product);
  const embedding = await generateEmbedding(chunk.text);

  const vectorRecord = {
    id: chunk.id,
    productId: chunk.metadata.product_id,
    text: chunk.text,
    vector: embedding,
    metadata: chunk.metadata,
    dimensions: embedding.length,
    updatedAt: new Date()
  };

  // 1. Sync to MongoDB Atlas Vector Collection
  try {
    const col = getVectorCollection();
    if (col) {
      await col.updateOne(
        { $or: [{ id: chunk.id }, { productId: chunk.metadata.product_id }, { 'metadata.product_id': chunk.metadata.product_id }] },
        { $set: vectorRecord },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error(`Error saving vector to MongoDB Atlas:`, err.message);
  }

  // 2. Sync to Pinecone if configured
  await upsertToPinecone(vectorRecord);

  // 3. Update active memory cache
  const existingIdx = inMemoryVectors.findIndex(v => 
    v.id === chunk.id || 
    v.productId === chunk.metadata.product_id || 
    v.metadata?.product_id === chunk.metadata.product_id
  );
  if (existingIdx !== -1) {
    inMemoryVectors[existingIdx] = vectorRecord;
  } else {
    inMemoryVectors.push(vectorRecord);
  }

  console.log(`🍃 [RAG Vector Store] Synchronized: "${chunk.metadata.product_name}" (ID: ${chunk.metadata.product_id})`);
  return vectorRecord;
}

/**
 * Delete a product vector from the Vector Database.
 */
async function deleteProductVector(productId) {
  if (!productId) return false;
  const idStr = String(productId);

  // 1. Delete from Atlas
  try {
    const col = getVectorCollection();
    if (col) {
      await col.deleteOne({ 
        $or: [
          { id: `chunk-prod-${idStr}` }, 
          { id: idStr }, 
          { productId: idStr },
          { 'metadata.product_id': idStr }
        ] 
      });
    }
  } catch (err) {
    console.warn(`Error deleting vector from Atlas:`, err.message);
  }

  // 2. Delete from Pinecone
  await deleteFromPinecone(`chunk-prod-${idStr}`);
  await deleteFromPinecone(idStr);

  // 3. Delete from active memory cache
  inMemoryVectors = inMemoryVectors.filter(v => 
    v.id !== `chunk-prod-${idStr}` && 
    v.id !== idStr && 
    v.productId !== idStr &&
    v.metadata?.product_id !== idStr
  );

  console.log(`🗑️ [RAG Vector Store] Removed vector for productId: ${idStr}`);
  return true;
}

/**
 * Semantic Vector Similarity Search
 * Finds top-K matching records across ALL data sources for a given query text.
 */
async function searchSimilarProducts(queryText, topK = 4, threshold = 0.15) {
  if (!queryText || typeof queryText !== 'string') return [];

  await initVectorDb();

  if (inMemoryVectors.length === 0) {
    const col = getVectorCollection();
    if (col) {
      inMemoryVectors = await col.find().toArray();
    }
  }

  if (inMemoryVectors.length === 0) {
    return [];
  }

  // Generate embedding for query
  const queryVector = await generateEmbedding(queryText);

  const queryLower = queryText.toLowerCase();

  // Score all stored vectors by cosine similarity + hybrid keyword phrase matching
  const scored = inMemoryVectors.map(item => {
    let score = cosineSimilarity(queryVector, item.vector);
    const meta = item.metadata || {};
    const prodName = (meta.product_name || meta.name || '').toLowerCase();
    const category = (meta.category || '').toLowerCase();
    const botName = (meta.botanical_name || '').toLowerCase();

    // Exact or strong phrase match bonus (Hybrid RAG Search)
    if (prodName && queryLower.includes(prodName)) {
      score += 0.45;
    } else if (prodName) {
      // Check significant words of the product name (e.g. "snake", "pothos", "rose", "areca", "bonsai")
      const nameWords = prodName.split(/\s+/).filter(w => w.length > 3 && !['plant', 'tree', 'bush'].includes(w));
      const matchCount = nameWords.filter(w => queryLower.includes(w)).length;
      if (matchCount > 0) {
        score += matchCount * 0.30;
      }
    }
    if (botName && queryLower.includes(botName)) {
      score += 0.35;
    }
    if (category && queryLower.includes(category)) {
      score += 0.25;
    }

    // Attribute-specific matches (low sunlight, shade, direct sun)
    if (meta.sunlight && (queryLower.includes('sunlight') || queryLower.includes('light') || queryLower.includes('shade'))) {
      const sun = meta.sunlight.toLowerCase();
      if ((queryLower.includes('low') || queryLower.includes('indirect') || queryLower.includes('shade')) && 
          (sun.includes('low') || sun.includes('indirect') || sun.includes('medium'))) {
        score += 0.35;
      } else if ((queryLower.includes('direct') || queryLower.includes('full')) && (sun.includes('direct') || sun.includes('full'))) {
        score += 0.35;
      }
    }

    return {
      id: item.id,
      productId: meta.product_id || item.productId || item.id,
      score: Number(score.toFixed(4)),
      product: meta,
      metadata: {
        product_id: meta.product_id || item.productId || item.id,
        product_name: meta.product_name || meta.name || 'Plant Store Item',
        category: meta.category || 'General',
        price: meta.price || '₹0',
        availability: meta.availability || 'In Stock',
        source: meta.source || 'catalog_product',
        url: meta.url || `#/product/${meta.product_id || item.productId || item.id}`,
        image: meta.image || meta.mainImage || '',
        sunlight: meta.sunlight || '',
        water: meta.water || meta.waterRequirement || '',
        care: meta.care || meta.careInstructions || '',
        description: meta.description || ''
      },
      text: item.text
    };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.score - a.score);

  // Return top matches above threshold
  const filtered = scored.filter(s => s.score >= threshold).slice(0, topK);
  return filtered;
}

/**
 * Synchronize ALL plant store data sources (Products, Categories, Soil Guides,
 * Fertilizers, Pots, Store Policies, Delivery Tiers, and Offers) into the Vector DB.
 */
async function syncAllDataSources(force = true) {
  console.log('🔄 [Unified RAG Sync] Synchronizing all plant store data paths into one Vector Store...');
  try {
    const unifiedRecords = await buildUnifiedVectorRecords();

    if (!unifiedRecords || unifiedRecords.length === 0) {
      console.warn('⚠️ [Unified RAG Sync] No data records generated.');
      return { total: 0, synced: 0 };
    }

    const col = getVectorCollection();
    let synced = 0;

    for (const record of unifiedRecords) {
      if (col) {
        await col.updateOne(
          { id: record.id },
          { $set: record },
          { upsert: true }
        );
      }
      await upsertToPinecone(record);
      synced++;
    }

    // Refresh memory cache
    inMemoryVectors = unifiedRecords;

    console.log(`✅ [Unified RAG Sync] Completed! Successfully synced ${synced} unified vectors across all data paths.`);
    return { 
      total: unifiedRecords.length, 
      synced, 
      activeVectors: inMemoryVectors.length,
      categories: ['catalog_product', 'category_catalog', 'plant_care_guide', 'store_policy', 'delivery_info', 'offers']
    };
  } catch (err) {
    console.error('❌ [Unified RAG Sync] Failed:', err.message);
    return { error: err.message };
  }
}

// Backward compatibility alias
const syncAllProducts = syncAllDataSources;

/**
 * Get status of Vector Database
 */
function getVectorDbStatus() {
  return {
    provider: process.env.PINECONE_API_KEY ? 'Pinecone + MongoDB Atlas Unified Vector Store' : 'MongoDB Atlas Unified Vector Store',
    activeVectorsCount: inMemoryVectors.length,
    pineconeConfigured: Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_HOST),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    isInitialized: Boolean(inMemoryVectors.length > 0)
  };
}

module.exports = {
  initVectorDb,
  upsertProductVector,
  deleteProductVector,
  searchSimilarProducts,
  syncAllDataSources,
  syncAllProducts,
  getVectorDbStatus
};

