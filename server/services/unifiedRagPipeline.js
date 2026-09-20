/**
 * unifiedRagPipeline.js
 * 
 * Unified Data Ingestion, Normalization, Chunking & Retrieval Pipeline
 * for Ganapathi Gardens Plant Nursery Online Store.
 * 
 * Connects ALL plant and product data paths:
 * Data Source 1 (Catalog Products) + Data Source 2 (Plant Care & Guides) 
 * + Data Source 3 (Pots & Fertilizers) + Data Source 4 (Store Policies & Delivery) 
 * + Data Source 5 (Categories & Offers)
 * 
 * Flow:
 * Multiple Data Sources -> Data Normalization -> Chunking -> Embeddings -> One Vector Store -> Retriever
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { generateEmbedding } = require('./embeddingService');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Read fallback JSON if database collections are offline
function readDbFallback() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { products: [], categories: [], deliveryAreas: [], businessInfo: {}, offers: [] };
  }
}

/**
 * Verified Horticultural & Plant Store Knowledge Sources
 */
const PLANT_CARE_KNOWLEDGE_DOCS = [
  {
    id: 'care-soil-requirements',
    title: 'Nursery Soil Requirements & Potting Mix Guide',
    category: 'Plant Care',
    source: 'plant_care_guide',
    price: '₹200 (for 5kg mix/compost)',
    availability: 'In Stock',
    text: `Topic: Soil Requirements for Indoor, Outdoor & Flowering Plants at Ganapathi Gardens
Ideal Potting Mix Recipe:
1. Standard Indoor & Flowering Plants: 40% garden red soil, 30% cocopeat for moisture retention, and 30% pure organic vermicompost for root nourishment and micro-nutrients.
2. Succulents & Snake Plants: Well-draining gritty soil mix with 50% coarse sand/perlite and 50% potting mix to prevent water stagnation and root rot.
3. Fruit Plants & Saplings: Loamy rich soil blended with organic cow dung manure and neem cake powder for fungal protection.
Soil Aeration: Loosen topsoil once a month to ensure oxygen flow to root zones.
Pot Drainage: Always use pots with proper drainage holes to prevent soggy waterlogged soil.`
  },
  {
    id: 'care-organic-fertilizers',
    title: 'Organic Fertilizers & Nutrient Guide',
    category: 'Gardening Products',
    source: 'plant_care_guide',
    price: '₹200 (5 Kg Pack)',
    availability: 'In Stock',
    text: `Topic: Organic Fertilizers & Plant Nutrients Available at Ganapathi Gardens
1. Pure Organic Vermicompost (5 Kg Pack - ₹200): 100% pure earthworm castings loaded with nitrogen, phosphorus, potassium, and beneficial soil microbes. Apply 2-3 handfuls around root zone every 3-4 weeks.
2. Mustard Cake (Sarson Khali) Liquid Fertilizer: Excellent organic bloom booster for roses, jasmines (Mogra), and hibiscus. Soak in water for 4 days, dilute 1:10, and water plants weekly during blooming season.
3. Bone Meal & Steamed Horn Meal: Rich in organic phosphorus and calcium for strong stem and root development.
4. Neem Cake Powder (Neem Khali): Dual-action organic fertilizer and root insect deterrent. Protects against nematodes, white grubs, and soil fungi.`
  },
  {
    id: 'care-pots-planters',
    title: 'Pots, Planters & Drainage Guide',
    category: 'Gardening Products',
    source: 'plant_care_guide',
    price: '₹149 - ₹680',
    availability: 'In Stock',
    text: `Topic: Pots and Planters at Ganapathi Gardens
1. Terracotta Clay Pots (6", 8", 10", 12"): Porous and breathable clay material. Highly recommended for coastal Andhra Pradesh climate to allow roots to breathe and evaporate excess moisture.
2. Ceramic Decorative Planters: Premium glazed indoor pots in white, emerald green, and pastel finishes. Comes with bottom drainage holes and matching drip trays for living rooms and office desks.
3. Nursery Grow Bags (10", 12", 14"): Durable UV-stabilized HDPE grow bags. Lightweight and ideal for terrace gardening, grafted mangoes, and guava saplings.
4. Hanging Baskets: Coconut coir hanging planters with metal chains, ideal for trailing Golden Pothos (Money Plant) and Spider Plants.
Pot Size Recommendations:
- Small table plants (Bonsai, Mini Succulents): 4.5" to 6" pots.
- Medium indoor plants (Snake Plant, Aglaonema): 7" to 8" pots.
- Large floor specimens (Areca Palm, Ficus): 10" to 14" pots.`
  },
  {
    id: 'care-watering-sunlight',
    title: 'Watering & Sunlight Instructions',
    category: 'Plant Care',
    source: 'plant_care_guide',
    price: 'Complimentary Care Guide',
    availability: 'In Stock',
    text: `Topic: Sunlight & Watering Requirements Guide
Sunlight Requirements:
- Direct Full Sunlight (5-6 hours): Roses, Madurai Malli (Jasmine), Krishna Tulsi, Mango sapling, Guava sapling, Bougainvillea.
- Bright Indirect Sunlight (Filtered light near windows or balconies): Areca Palm, Ficus Ginseng Bonsai, Anthurium.
- Low to Medium Light: Snake Plant (Sansevieria), Money Plant (Golden Pothos), ZZ Plant. Tolerates dim indoor corners.
Watering Best Practices:
- The Finger Test: Stick your finger 1-2 inches into topsoil. Water thoroughly only when dry.
- Water early morning or late evening to minimize evaporation.
- Snake Plant: Water once every 10-14 days. Extremely drought-tolerant.
- Money Plant: Water 1-2 times a week. Mist moss pole weekly.
- Flowering Roses & Mogra: Water daily during summer; alternate days during winter.
Pest Prevention: Spray cold-pressed Neem Oil solution (5ml neem oil + 2ml liquid soap per liter of water) every 15 days in the evening.`
  }
];

const STORE_POLICIES_AND_FAQS = [
  {
    id: 'policy-delivery-shipping',
    title: 'Plant Delivery Information & Shipping Rates',
    category: 'Store Policy',
    source: 'delivery_info',
    price: '₹50 - ₹120',
    availability: 'Active',
    text: `Topic: Delivery Information, Areas & Charges for Ganapathi Gardens
Delivery Tiers across East Godavari & Kakinada Region:
1. Kakinada City: Delivery charge ₹50. Areas: Main City, Bhanugudi, Jagannaickpur, Main Road, Collectorate, Surya Rao Peta. Timeline: Same Day or Next Morning Delivery.
2. Nearby Areas: Delivery charge ₹80. Areas: Cheediga, Indra Palem, Ramanayyapeta, Sarpavaram, Madhavapatnam, Atchampeta. Timeline: Next Day Delivery.
3. Other Outlying Areas: Delivery charge ₹120. Areas: Samalkota, Pithapuram, Karapa, Peddapuram outskirts. Timeline: 1 - 2 Business Days.
Safe Plant Packaging Guarantee:
- Plants are transported safely potted in nutrient-rich nursery soil.
- Heavy corrugated nursery crates and protective wraps are used to prevent leaf or stem damage during transit.
- Cash on Delivery (COD) and UPI on delivery available for all locations.`
  },
  {
    id: 'policy-nursery-info-hours',
    title: 'Ganapathi Gardens Nursery Information, Hours & Location',
    category: 'Store Policy',
    source: 'store_policy',
    price: 'Free Visit',
    availability: 'Open 7 Days',
    text: `Topic: Ganapathi Gardens Nursery Visiting Hours, Address & Contact
Nursery Name: Ganapathi Gardens – Plant Nursery & Landscape Specialist
Address: Cheediga, PO, Indra Palem, Kakinada, Andhra Pradesh 533006, India.
Contact Phone / WhatsApp: 090008 35323 (Also: +91 94401 23456)
Email: ganapathigardens@gmail.com
Website: https://ganapathigardens.com
Visiting Hours: Monday to Sunday, 7:00 AM – 8:00 PM (Open all 7 days including public holidays).
Services Offered:
- Wholesale and retail plant supply.
- Landscape architecture and garden lawn development.
- Exotic grafted fruit trees and sacred devotional plants.
- Rental plant arrangements for weddings and corporate events.
- Soil testing and horticultural consultation.`
  },
  {
    id: 'policy-return-exchange',
    title: 'Store Guarantee & Plant Replacement Policy',
    category: 'Store Policy',
    source: 'store_policy',
    price: '100% Guarantee',
    availability: 'Active',
    text: `Topic: Return, Refund & Live Plant Replacement Policy
Live Plant Transit Guarantee:
- We guarantee 100% healthy delivery of every nursery plant.
- If a plant arrives with broken stems, root damage, or severe transit distress, customers can report it within 48 hours of delivery via WhatsApp or phone at 090008 35323.
- We provide a free replacement plant or full refund upon inspection of the delivered plant photo.
- Organic fertilizers, pots, and gardening tools can be replaced or returned if defective or damaged upon delivery.`
  },
  {
    id: 'policy-active-offers',
    title: 'Current Promotional Discounts & Offers',
    category: 'Offers',
    source: 'offers',
    price: 'Up to 20% OFF',
    availability: 'Active',
    text: `Topic: Active Coupon Codes & Store Offers at Ganapathi Gardens
1. Code: MONSOON20 - 20% discount up to ₹300 on orders above ₹499. Applicable to all flowering shrubs and garden plants.
2. Code: GREENHOME10 - 10% instant discount on indoor air-purifying plant collections.
3. Free Vermicompost Sample: Complimentary 500g vermicompost pack on all plant orders exceeding ₹999.`
  }
];

/**
 * Normalize a single catalog product into a rich text chunk with metadata
 */
function normalizeProductToChunk(product) {
  const productId = String(product.id || product._id || '');
  const name = product.name || 'Unnamed Plant';
  const botanicalName = product.botanicalName ? ` (${product.botanicalName})` : '';
  const category = product.category || 'General Plants';
  const plantType = product.plantType || 'Indoor/Outdoor';
  const price = product.finalPrice || product.price || product.originalPrice || 0;
  const originalPrice = product.originalPrice || price;
  const discount = product.discount ? `${product.discount}% OFF` : '0% discount';
  const stock = Number(product.stock !== undefined ? product.stock : 10);
  const availability = product.availability || (stock > 0 ? 'In Stock' : 'Out of Stock');
  const size = product.size || 'Medium';
  const height = product.height || '1.5 - 2 Feet';
  const potSize = product.potSize || '8 Inch Nursery Pot';
  const sunlight = product.sunlight || 'Bright Indirect Sunlight';
  const water = product.waterRequirement || 'Water when top 1-2 inches soil is dry';
  const care = product.careInstructions || 'Nourish with organic vermicompost every 3-4 weeks.';
  const description = product.description || '';
  const tags = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');

  // Size variations if present
  let sizeVariantsText = '';
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    sizeVariantsText = '\nAvailable Sizes: ' + product.sizes.map(s => 
      `${s.size} (${s.height || ''}, ${s.pot || ''}): ₹${s.finalPrice || s.price}`
    ).join(' | ');
  }

  const chunkText = `
Product Name: ${name}${botanicalName}
Product ID: ${productId}
Category: ${category}
Plant Type: ${plantType} (Indoor/Outdoor classification)
Selling Price: ₹${price} (MRP: ₹${originalPrice}, Discount: ${discount})
Availability: ${availability} (${stock} units in stock)
Size and Dimensions: Size ${size}, Height ${height}, Pot Size ${potSize}
Sunlight Requirements: ${sunlight}
Watering Requirements: ${water}
Plant Care Instructions: ${care}
Description: ${description}${sizeVariantsText}
Tags: ${tags}
Nursery Source: Ganapathi Gardens, Cheediga, Kakinada
`.trim();

  return {
    id: `chunk-prod-${productId}`,
    text: chunkText,
    metadata: {
      product_id: productId,
      product_name: name,
      botanical_name: product.botanicalName || '',
      category,
      plant_type: plantType,
      price: `₹${price}`,
      numeric_price: Number(price),
      original_price: `₹${originalPrice}`,
      discount: product.discount || 0,
      availability,
      stock,
      sunlight,
      water,
      care,
      source: 'catalog_product',
      url: `#/product/${productId}`,
      image: product.mainImage || (product.images && product.images[0]) || ''
    }
  };
}

/**
 * Normalize categories into searchable chunks
 */
function normalizeCategoryToChunk(category) {
  const catId = String(category.id || category._id || category.name.toLowerCase().replace(/\s+/g, '-'));
  const name = category.name || 'Category';
  const desc = category.description || 'Collection of healthy nursery plants';
  const count = category.itemCount || 10;

  const chunkText = `
Category Name: ${name}
Category Description: ${desc}
Available Varieties: Around ${count} varieties cultivated at Ganapathi Gardens nursery in Cheediga.
Includes indoor foliage, flowering shrubs, fruit saplings, bonsais, and organic gardening supplies.
`.trim();

  return {
    id: `chunk-cat-${catId}`,
    text: chunkText,
    metadata: {
      product_id: catId,
      product_name: name,
      category: name,
      price: 'Varies by plant',
      availability: 'In Stock',
      source: 'category_catalog',
      url: `#/plants?category=${encodeURIComponent(name)}`
    }
  };
}

/**
 * Ingest, normalize, chunk, and embed ALL plant-store data sources
 * Returns complete array of vector records ready for insertion into the vector store.
 */
async function buildUnifiedVectorRecords() {
  console.log('🔄 [Unified RAG Pipeline] Ingesting all plant store data sources...');
  const chunks = [];

  // 1. Data Source 1: Catalog Products from MongoDB and db.json
  let products = [];
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      products = await mongoose.connection.collection('products').find().toArray();
    } catch (e) {
      console.warn('Could not read products from MongoDB:', e.message);
    }
  }

  // Also include products from db.json so Snake Plant, Red Rose, etc. are always in unified catalog
  const fallback = readDbFallback();
  const dbJsonProducts = fallback.products || [];
  
  const existingNames = new Set(products.map(p => (p.name || '').toLowerCase().trim()));
  const existingIds = new Set(products.map(p => String(p.id || p._id || '').toLowerCase()));

  for (const dbProd of dbJsonProducts) {
    const id = String(dbProd.id || dbProd._id || '').toLowerCase();
    const name = (dbProd.name || '').toLowerCase().trim();
    if (!existingIds.has(id) && !existingNames.has(name)) {
      products.push(dbProd);
      existingIds.add(id);
      existingNames.add(name);

      // Persist to MongoDB Atlas if connected
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.collection('products').insertOne({
            ...dbProd,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`🌿 [Unified Catalog Sync] Persisted ${dbProd.name} to MongoDB Atlas.`);
        } catch (insertErr) {
          // ignore duplicate key if any
        }
      }
    }
  }

  console.log(`📦 [Unified RAG Pipeline] Loaded ${products.length} catalog products.`);
  for (const prod of products) {
    chunks.push(normalizeProductToChunk(prod));
  }

  // 2. Data Source 2: Categories from MongoDB or db.json
  let categories = [];
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      categories = await mongoose.connection.collection('categories').find().toArray();
    } catch (e) {
      console.warn('Could not read categories from MongoDB:', e.message);
    }
  }

  if (!categories || categories.length === 0) {
    const fallback = readDbFallback();
    categories = fallback.categories || [];
  }

  console.log(`🏷️ [Unified RAG Pipeline] Loaded ${categories.length} plant categories.`);
  for (const cat of categories) {
    chunks.push(normalizeCategoryToChunk(cat));
  }

  // 3. Data Source 3: Plant Care, Soil, Fertilizers, Pots Guides
  console.log(`📚 [Unified RAG Pipeline] Loading ${PLANT_CARE_KNOWLEDGE_DOCS.length} plant care & potting knowledge docs.`);
  for (const doc of PLANT_CARE_KNOWLEDGE_DOCS) {
    chunks.push({
      id: `chunk-care-${doc.id}`,
      text: doc.text,
      metadata: {
        product_id: doc.id,
        product_name: doc.title,
        category: doc.category,
        price: doc.price,
        availability: doc.availability,
        source: doc.source,
        url: '#/care'
      }
    });
  }

  // 4. Data Source 4: Store Policies, Nursery FAQs, Delivery Tiers & Hours
  console.log(`📋 [Unified RAG Pipeline] Loading ${STORE_POLICIES_AND_FAQS.length} store policies & delivery docs.`);
  for (const doc of STORE_POLICIES_AND_FAQS) {
    chunks.push({
      id: `chunk-policy-${doc.id}`,
      text: doc.text,
      metadata: {
        product_id: doc.id,
        product_name: doc.title,
        category: doc.category,
        price: doc.price,
        availability: doc.availability,
        source: doc.source,
        url: '#/about'
      }
    });
  }

  console.log(`⚡ [Unified RAG Pipeline] Generating embeddings for ${chunks.length} unified chunks...`);

  // Generate embeddings for each chunk
  const vectorRecords = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = await generateEmbedding(chunk.text);
    vectorRecords.push({
      id: chunk.id,
      productId: chunk.metadata.product_id,
      text: chunk.text,
      vector,
      dimensions: vector.length,
      metadata: chunk.metadata,
      updatedAt: new Date()
    });
  }

  console.log(`✅ [Unified RAG Pipeline] Embeddings generated for ${vectorRecords.length} records.`);
  return vectorRecords;
}

module.exports = {
  buildUnifiedVectorRecords,
  normalizeProductToChunk,
  normalizeCategoryToChunk,
  PLANT_CARE_KNOWLEDGE_DOCS,
  STORE_POLICIES_AND_FAQS
};
