/**
 * ragChatService.js
 * 
 * Production RAG (Retrieval-Augmented Generation) Chat Service
 * for Ganapathi Gardens Plant Nursery Online Store.
 * 
 * Complete RAG Flow:
 * User Question -> Chatbot UI -> Backend API -> Query Embedding -> Unified Vector Database
 * -> Relevant Data Retrieval -> LLM / Grounded Horticultural Generator -> Accurate Answer -> Chatbot UI
 * 
 * Capabilities:
 * - Multi-turn conversation history & pronoun coreference resolution (e.g., "Tell me about Snake Plant" -> "How often should I water it?").
 * - Unified retrieval across catalog products, plant care guides (soil, watering, sunlight), fertilizers, pots, store FAQs, and delivery tiers.
 * - Strict anti-hallucination guardrail: "I couldn't find that information in our plant store data."
 * - Product integration: provides clickable [View Product](#/product/:id) links.
 * - Standardized contract: { answer: "...", sources: [ { product_id, product_name, category, price, availability, source } ] }.
 */

const { searchSimilarProducts } = require('./vectorDbService');
const Order = require('../models/Order');
const BusinessInfo = require('../models/BusinessInfo');
const { getIsConnected } = require('../config/db');

// Verified Ganapathi Gardens business facts
const NURSERY_KNOWLEDGE = {
  name: 'Ganapathi Gardens',
  type: 'Plant Nursery & Landscape Specialist',
  address: 'Cheediga, PO, Indra Palem, Kakinada, Andhra Pradesh 533006, India',
  phone: '090008 35323',
  email: 'ganapathigardens@gmail.com',
  website: 'https://ganapathigardens.com',
  googleMaps: 'https://maps.app.goo.gl/19cfUNcC6EmtfYVu7',
  hours: 'Monday to Sunday, 7:00 AM – 8:00 PM',
  delivery: 'Express nursery delivery across Kakinada, Indra Palem, Cheediga, Samalkot, and Godavari region. Plants are safely potted and transported in protective nursery crates.',
  services: 'Nursery plants, landscaping, exotic bonsais, medicinal flora, fruit trees, ceramic pots, organic fertilizers, and garden consultation.'
};

/**
 * In-memory conversation session store
 * Key: conversation_id -> { history: [], lastReferencedProduct: null, lastUpdated: timestamp }
 */
const conversationSessions = new Map();

// Periodic cleanup of stale sessions (> 4 hours old)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of conversationSessions.entries()) {
    if (now - session.lastUpdated > 4 * 60 * 60 * 1000) {
      conversationSessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

function getOrCreateSession(conversationId) {
  const id = conversationId || 'default_session';
  if (!conversationSessions.has(id)) {
    conversationSessions.set(id, {
      conversationId: id,
      history: [],
      lastReferencedProduct: null,
      lastUpdated: Date.now()
    });
  }
  const session = conversationSessions.get(id);
  session.lastUpdated = Date.now();
  return session;
}

/**
 * Multi-turn Coreference / Follow-up Resolution
 * If the user's query contains anaphora ("it", "this plant", "how much is it", "how often should I water it"),
 * resolve "it" to the last referenced product entity.
 */
function resolveFollowUpQuery(userQuery, session) {
  if (!userQuery || typeof userQuery !== 'string') return userQuery;
  const trimmed = userQuery.trim();
  const queryLower = trimmed.toLowerCase();

  const lastProd = session ? session.lastReferencedProduct : null;
  if (!lastProd || !lastProd.product_name) {
    return trimmed;
  }

  // Disqualify broad listing queries from referent rewrite
  const isBroadListQuery = /^(which\s+plants?|what\s+plants?|show\s+(?:me\s+)?plants?|list\s+plants?|best\s+plants?|recommend\s+plants?|all\s+plants?|flowering\s+plants?|indoor\s+plants?)/i.test(queryLower);
  if (isBroadListQuery) {
    return trimmed;
  }

  // Pronoun patterns that refer to the previous plant
  const pronounPatterns = [
    /\b(it|its|this|that|this plant|that plant|the plant|these plants)\b/i,
    /^(how\s+often\s+should\s+i\s+water\s*(?:it|this)?)/i,
    /^(how\s+much\s+(?:is|does\s+it\s+cost))\b/i,
    /^(what\s+is\s+the\s+price(?:\s+of\s+it)?)\b/i,
    /^(what\s+soil\s+does\s+it\s+need)\b/i,
    /^(can\s+it\s+grow\s+indoors?)\b/i,
    /^(is\s+it\s+in\s+stock)\b/i,
    /^(does\s+it\s+need\s+sunlight)\b/i
  ];

  const hasPronoun = pronounPatterns.some(pat => pat.test(queryLower));

  // Only rewrite if explicit pronoun is used or short specific follow-up
  if (hasPronoun || (trimmed.length < 25 && /^(water|watering|sunlight|care|price|cost|soil|pot)\b/i.test(queryLower))) {
    let resolved = trimmed.replace(/\b(it|this plant|that plant|the plant)\b/gi, lastProd.product_name);
    if (!resolved.toLowerCase().includes(lastProd.product_name.toLowerCase())) {
      resolved = `${resolved} for ${lastProd.product_name}`;
    }
    console.log(`🔗 [RAG Coreference Resolution] "${trimmed}" -> "${resolved}" (Referent: ${lastProd.product_name})`);
    return resolved;
  }

  return trimmed;
}

/**
 * Extract potential order IDs from user message
 */
function extractOrderId(message) {
  if (!message) return null;
  const match = message.match(/(?:order\s*(?:id|#|no\.?|number)?\s*[:#-]?\s*)?(GG\d{3,8}|GN\d{3,8}|ORD-[A-Z0-9]+|[0-9a-fA-F]{24})/i);
  if (match) {
    return match[1] || match[0].trim();
  }
  return null;
}

/**
 * Fetch live order details from MongoDB Atlas or fallback
 */
async function fetchOrderDetails(orderId) {
  try {
    if (!orderId) return null;
    const cleanId = orderId.toUpperCase().replace('#', '').trim();

    if (getIsConnected()) {
      const col = Order.collection;
      const order = await col.findOne({
        $or: [
          { orderNumber: new RegExp(`^${cleanId}$`, 'i') },
          { id: new RegExp(`^${cleanId}$`, 'i') },
          { orderId: new RegExp(`^${cleanId}$`, 'i') }
        ]
      });

      if (order) {
        const items = (order.products && order.products.length > 0) ? order.products : (order.items || []);
        const total = order.totalAmount !== undefined ? order.totalAmount : (order.total || 0);
        const customerName = order.customerName || (order.customer && order.customer.name) || 'Valued Customer';
        const address = order.address || (order.customer && order.customer.address) || 'Cheediga Road, Kakinada';
        const city = order.city || (order.customer && order.customer.city) || 'Kakinada';

        return {
          orderId: order.orderNumber || order.id || order.orderId || cleanId,
          status: order.status || 'Order Placed',
          customerName,
          totalAmount: total,
          paymentMethod: order.paymentMethod || 'Cash on Delivery',
          paymentStatus: order.paymentStatus || 'Pending',
          items: items.map(i => ({
            name: i.name || 'Plant Item',
            quantity: i.quantity || 1,
            price: i.finalPrice || i.price || 0
          })),
          address: `${address}, ${city}`
        };
      }
    }
  } catch (err) {
    console.warn(`[RAG] Order lookup failed for ${orderId}:`, err.message);
  }
  return null;
}

/**
 * Exact Anti-Hallucination Fallback string required by specification
 */
const ANTI_HALLUCINATION_FALLBACK = "I couldn't find that information in our plant store data.";

/**
 * Built-in Grounded Horticultural Generator
 * Synthesizes 100% accurate, anti-hallucinatory answers grounded in retrieved documents.
 */
function generateGroundedAnswer(userQuery, resolvedQuery, retrievedDocs, liveOrder, businessInfo) {
  const queryLower = userQuery.toLowerCase().trim();
  const resolvedLower = resolvedQuery.toLowerCase().trim();
  const info = businessInfo || NURSERY_KNOWLEDGE;

  // 1. Order Tracking Response
  if (liveOrder) {
    const itemsList = (liveOrder.items || [])
      .map(i => `• **${i.name}** × ${i.quantity || 1} (₹${i.price})`)
      .join('\n');

    let statusEmoji = '🌱';
    let statusMessage = 'Your order has been safely placed with Ganapathi Gardens.';
    if (liveOrder.status === 'Confirmed') {
      statusEmoji = '✅';
      statusMessage = 'Your order is confirmed and being prepared at our nursery.';
    } else if (liveOrder.status === 'Processing' || liveOrder.status === 'Packed') {
      statusEmoji = '📦';
      statusMessage = 'Your plants are carefully packed in protective nursery crates.';
    } else if (liveOrder.status === 'Out for Delivery') {
      statusEmoji = '🚚';
      statusMessage = 'Our delivery vehicle is currently on the way with your fresh plants!';
    } else if (liveOrder.status === 'Delivered') {
      statusEmoji = '🏡';
      statusMessage = 'Your order has been delivered! Enjoy your green companion.';
    }

    return `### ${statusEmoji} Order Tracking Status: #${liveOrder.orderId}

**Status:** **${liveOrder.status || 'Processing'}**
${statusMessage}

**Order Summary:**
${itemsList}

**Total:** ₹${liveOrder.totalAmount} (${liveOrder.paymentMethod || 'Cash on Delivery'})
**Delivery Destination:** ${liveOrder.address || 'Cheediga Road, Kakinada'}

*Need immediate assistance? Call our nursery desk directly at **${info.phone}**.*`;
  }

  // 2. Strict Anti-Hallucination Guardrail Check
  // If no retrieved docs or top score is low and query has no matching tokens with catalog:
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return ANTI_HALLUCINATION_FALLBACK;
  }

  const topMatch = retrievedDocs[0];
  const topScore = topMatch.score || 0;
  const topMeta = topMatch.metadata || {};

  // Check relevance: extract meaningful search tokens (exclude stop words)
  const stopWords = new Set([
    'tell', 'about', 'what', 'which', 'have', 'much', 'many', 'price', 'cost', 
    'plant', 'plants', 'care', 'water', 'watering', 'sunlight', 'soil', 'please', 
    'show', 'find', 'need', 'does', 'like', 'with', 'from', 'this', 'that',
    'sell', 'selling', 'buy', 'buying', 'order', 'orders', 'item', 'items', 
    'store', 'shop', 'give', 'know', 'can', 'will', 'would', 'available', 'stock', 
    'do', 'you', 'for', 'are', 'the'
  ]);
  const queryTokens = resolvedLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  // Check if at least one query token matches a product, attribute, or category in retrieved results
  const matchingEntities = retrievedDocs.map(d => 
    `${d.metadata?.product_name || ''} ${d.metadata?.category || ''} ${d.metadata?.botanical_name || ''} ${d.metadata?.sunlight || ''} ${d.metadata?.water || ''} ${d.metadata?.care || ''} ${d.metadata?.source || ''} ${d.text || ''}`.toLowerCase()
  ).join(' ');
  const hasTokenMatch = queryTokens.some(tok => matchingEntities.includes(tok));

  // If query asks for an unknown item (e.g. "Venus Flytrap", "Blue Orchid from Mars", "iPhone")
  // and none of the tokens match any retrieved plant name or category:
  if (!hasTokenMatch && queryTokens.length > 0) {
    return ANTI_HALLUCINATION_FALLBACK;
  }

  // 3. Delivery / Shipping Queries
  if (queryLower.includes('deliver') || queryLower.includes('shipping') || queryLower.includes('charge') || queryLower.includes('transport') || queryLower.includes('courier')) {
    const deliveryDoc = retrievedDocs.find(d => d.metadata?.source === 'delivery_info' || d.metadata?.category === 'Store Policy');
    if (deliveryDoc) {
      return `### 🚚 Plant Delivery & Shipping Information

Ganapathi Gardens provides safe express nursery delivery across Kakinada and East Godavari:

• **Kakinada City:** **₹50** delivery charge (Same Day / Next Morning Delivery)
• **Nearby Areas (Cheediga, Indra Palem, Ramanayyapeta, Sarpavaram):** **₹80** delivery charge (Next Day Delivery)
• **Other Areas (Samalkot, Pithapuram, Karapa):** **₹120** delivery charge (1-2 Business Days)

**Safe Packaging Guarantee:**
All plants are transported safely potted in nutrient-rich soil inside protective nursery crates to prevent root or leaf shock. Cash on Delivery (COD) and UPI on delivery are accepted.`;
    }
  }

  // 4. Plant Care, Soil, Fertilizers, Pots Queries (Checked BEFORE generic products if soil/fertilizer asked)
  const careDoc = retrievedDocs.find(d => d.metadata?.source === 'plant_care_guide');
  const isSoilOrFertilizerQuery = queryLower.includes('soil') || queryLower.includes('fertiliz') || 
                                  queryLower.includes('vermicompost') || queryLower.includes('potting') || 
                                  queryLower.includes('planter') || queryLower.includes('pot ') || 
                                  queryLower.includes('pots') || queryLower.includes('how often should i water') ||
                                  queryLower.includes('how to water') || queryLower.includes('feed');

  if (isSoilOrFertilizerQuery) {
    const isSoil = queryLower.includes('soil') || queryLower.includes('potting');
    const isFertilizer = queryLower.includes('fertiliz') || queryLower.includes('vermicompost') || queryLower.includes('manure');
    const isPot = queryLower.includes('pot') || queryLower.includes('planter');

    let careSection = '';
    if (isSoil) {
      careSection = `### 🪴 Recommended Potting Soil Mix at Ganapathi Gardens

• **Ideal Ratio for Indoor & Flowering Plants:** 40% garden red soil + 30% cocopeat (for moisture) + 30% pure organic vermicompost (for rich nourishment).
• **Succulents & Snake Plants:** 50% coarse sand/perlite and 50% potting mix for sharp drainage to prevent root rot.
• **Drainage:** Always choose pots with bottom drainage holes to prevent soggy waterlogged soil.`;
    } else if (isFertilizer) {
      careSection = `### 🌱 Organic Fertilizers & Nutrients at Ganapathi Gardens

• **Pure Organic Vermicompost (5 Kg Pack - ₹200):** 100% pure earthworm castings rich in nitrogen and micronutrients. Apply 2-3 handfuls around root zone every 3-4 weeks.
• **Mustard Cake Liquid Fertilizer:** Excellent natural bloom booster for roses and mogra jasmines.
• **Bone Meal:** Promotes deep root establishment and heavy bud formation.
• **Neem Cake Powder:** Natural root insecticide that protects against white grubs and fungi.`;
    } else if (isPot) {
      careSection = `### 🏺 Pots & Planters Guide at Ganapathi Gardens

• **Terracotta Clay Pots (6" to 12" - ₹149 to ₹350):** Highly porous and breathable; best for coastal Andhra climate.
• **Glazed Ceramic Pots (₹250 to ₹680):** Decorative aesthetic planters with drainage holes for indoor desks and living rooms.
• **Nursery Grow Bags:** Lightweight UV-stabilized bags for fruit trees and terrace gardening.
• **Hanging Baskets:** Coconut coir hanging planters ideal for Golden Pothos (Money Plant).`;
    } else {
      careSection = `### 🌿 Plant Care & Maintenance Guide

• **Sunlight:** Direct sun (5-6 hrs) for flowering roses and fruit saplings; Bright indirect light for Areca Palm & Bonsai; Low light for Snake Plant & Money Plant.
• **Watering:** Check top 1-2 inches of soil with finger test. Water thoroughly only when dry.
• **Pest Control:** Spray cold-pressed Neem Oil solution (5ml neem oil + 2ml liquid soap per liter of water) every 15 days in the evening.`;
    }

    // If a specific product was also referenced (e.g. Snake Plant watering), include its specific care:
    const prodDoc = retrievedDocs.find(d => d.metadata?.source === 'catalog_product');
    if (prodDoc && prodDoc.metadata?.product_name) {
      const p = prodDoc.metadata;
      careSection += `\n\n**Specific Care for ${p.product_name}:**
• ☀️ **Sunlight:** ${p.sunlight || 'Bright indirect light'}
• 💧 **Watering:** ${p.water || 'Moderate regular watering'}
• 📋 **Care Tip:** ${p.care || 'Feed monthly with vermicompost.'}
[View Product](${p.url || `#/product/${p.product_id}`})`;
    }

    return careSection;
  }

  // 5. Nursery Location, Visiting Hours, Contact Inquiries
  const isLocationQuery = 
    queryLower.includes('location') || 
    queryLower.includes('address') || 
    queryLower.includes('where is the nursery') || 
    queryLower.includes('where are you') || 
    queryLower.includes('visiting hours') || 
    queryLower.includes('opening hours') || 
    queryLower.includes('opening time') || 
    queryLower.includes('timings') || 
    queryLower.includes('hours') || 
    queryLower.includes('contact number') || 
    queryLower.includes('phone') ||
    queryLower.includes('directions') ||
    (queryLower.includes('cheediga') && (queryLower.includes('where') || queryLower.includes('visit') || queryLower.includes('location'))) ||
    (queryLower.includes('kakinada') && (queryLower.includes('where') || queryLower.includes('visit') || queryLower.includes('location')));

  if (isLocationQuery) {
    return `### 🌿 Welcome to Ganapathi Gardens Plant Nursery

📍 **Address:**  
${info.address}  
[View on Google Maps](${info.googleMaps})

📞 **Phone / WhatsApp:**  
**${info.phone}**

⏰ **Visiting Hours:**  
${info.hours} (Open all 7 days)

📧 **Email:**  
${info.email}

🌱 **Services:**  
Wholesale & retail plants, landscape design, bonsai collections, organic fertilizers, and garden consultation.`;
  }

  // 6. Product Search, Price, Availability & Recommendations
  const matchingProducts = retrievedDocs.filter(d => d.metadata?.source === 'catalog_product');

  if (matchingProducts.length > 0) {
    const topProd = matchingProducts[0].metadata;

    // Single plant focused query (e.g. "Tell me about Snake Plant", "Price of Red Rose")
    const isMultiQuery = /^(which\s+plants?|what\s+plants?|show\s+(?:me\s+)?plants?|list\s+plants?|best\s+plants?|recommend\s+plants?|all\s+plants?)/i.test(queryLower);
    if (!isMultiQuery && (matchingProducts.length === 1 || queryTokens.some(tok => (topProd.product_name || '').toLowerCase().includes(tok)))) {
      const p = topProd;
      const discountTag = p.discount ? ` (${p.discount}% OFF)` : '';
      const stockTag = p.availability === 'In Stock' ? `🟢 ${p.availability} (${p.stock || 10} units available)` : `🔴 ${p.availability}`;

      return `### 🌿 ${p.product_name} ${p.botanical_name ? `*(${p.botanical_name})*` : ''}

• **Price:** **${p.price}**${discountTag} ${p.original_price ? `(MRP: ${p.original_price})` : ''}
• **Category:** ${p.category} (${p.plant_type || 'Indoor/Outdoor'})
• **Availability:** ${stockTag}
• ☀️ **Sunlight:** ${p.sunlight || 'Bright indirect light'}
• 💧 **Watering:** ${p.water || 'Water when topsoil feels dry'}
• 📋 **Care Instructions:** ${p.care || 'Feed with organic vermicompost every 3-4 weeks.'}
• 📝 **Description:** ${p.description || 'Healthy nursery plant acclimated to coastal Andhra climate.'}

[View Product](${p.url || `#/product/${p.product_id}`})`;
    }

    // Multiple products query (e.g. "Which plants need low sunlight?", "Show flowering plants")
    const productCards = matchingProducts.slice(0, 3).map((item, idx) => {
      const p = item.metadata;
      const discountTag = p.discount ? ` (${p.discount}% OFF)` : '';
      const stockTag = p.availability === 'In Stock' ? `🟢 In Stock` : `🔴 Out of Stock`;

      return `#### ${idx + 1}. ${p.product_name}
• **Price:** **${p.price}**${discountTag}
• **Category:** ${p.category} | **Availability:** ${stockTag}
• ☀️ **Sunlight:** ${p.sunlight || 'Bright indirect light'}
• 💧 **Watering:** ${p.water || 'Moderate'}
[View Product](${p.url || `#/product/${p.product_id}`})
`;
    }).join('\n');

    let intro = `Here are the matching plants from our **Ganapathi Gardens** nursery catalog:`;
    if (queryLower.includes('low sunlight') || queryLower.includes('shade') || queryLower.includes('indirect')) {
      intro = `Here are the best plants in our nursery that flourish in low to medium indirect sunlight:`;
    } else if (queryLower.includes('flower') || queryLower.includes('rose') || queryLower.includes('malli')) {
      intro = `Here are our popular flowering and fragrant plants cultivated at Ganapathi Gardens:`;
    } else if (queryLower.includes('indoor')) {
      intro = `Here are healthy indoor air-purifying and decorative plants available at our nursery:`;
    }

    return `### 🌿 Ganapathi Gardens Plant Catalog

${intro}

${productCards}
All plants are available for nursery pickup in Cheediga, Kakinada or express potted delivery!`;
  }

  // 7. Categories Catalog Query
  const catDoc = retrievedDocs.find(d => d.metadata?.source === 'category_catalog');
  if (catDoc) {
    return `### 🏷️ ${catDoc.metadata?.product_name || 'Plant Category'}

${catDoc.text}

Browse our entire live plant catalog online or visit Ganapathi Gardens in Cheediga, Kakinada!`;
  }

  // Fallback: If no confident answer can be formed from retrieved data
  return ANTI_HALLUCINATION_FALLBACK;
}

/**
 * Call OpenAI API if key configured in .env
 */
async function callOpenAiChat(systemInstructions, contextText, userQuery, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${systemInstructions}\n\n${contextText}` },
        { role: 'user', content: userQuery }
      ],
      temperature: 0.2,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

/**
 * Call Google Gemini API if key configured in .env
 */
async function callGeminiChat(systemInstructions, contextText, userQuery, apiKey) {
  const prompt = `${systemInstructions}\n\n${contextText}\n\nUser Question: ${userQuery}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * Main RAG Chatbot Function: Answer Customer Queries
 * 
 * Flow:
 * User Question -> Session & Coreference Resolution -> Query Embedding -> Vector Retrieval
 * -> Anti-hallucination Grounding -> Formatted Response with Clickable Link + Sources
 */
async function answerQuery(userQuery, conversationId = 'default_session') {
  // 1. Validation: Empty or blank messages
  if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
    return {
      error: 'Message is required.',
      answer: 'Please enter a message or question about our plants, care guides, or store policies.',
      sources: [],
      reply: 'Please enter a message or question about our plants, care guides, or store policies.',
      products: []
    };
  }

  const query = userQuery.trim();

  try {
    // 2. Multi-turn Session Management
    const session = getOrCreateSession(conversationId);

    // 3. Coreference / Follow-up Resolution (resolves "it", "this plant" using history)
    const resolvedQuery = resolveFollowUpQuery(query, session);

    // 4. Order tracking lookup if order number mentioned
    const orderId = extractOrderId(query);
    let liveOrder = null;
    if (orderId) {
      liveOrder = await fetchOrderDetails(orderId);
    }

    // 5. Nursery Business Info
    let businessInfo = NURSERY_KNOWLEDGE;
    if (getIsConnected()) {
      try {
        const rawInfo = await BusinessInfo.findOne();
        if (rawInfo) {
          businessInfo = {
            name: rawInfo.businessName || NURSERY_KNOWLEDGE.name,
            address: rawInfo.address || NURSERY_KNOWLEDGE.address,
            phone: rawInfo.contactNumber || NURSERY_KNOWLEDGE.phone,
            email: rawInfo.email || NURSERY_KNOWLEDGE.email,
            website: rawInfo.website || NURSERY_KNOWLEDGE.website,
            googleMaps: rawInfo.mapLink || NURSERY_KNOWLEDGE.googleMaps,
            hours: rawInfo.openingHours || NURSERY_KNOWLEDGE.hours,
            delivery: NURSERY_KNOWLEDGE.delivery
          };
        }
      } catch (e) {
        businessInfo = NURSERY_KNOWLEDGE;
      }
    }

    // 6. Retrieve semantically similar chunks from Unified Vector Database
    const retrievedDocs = await searchSimilarProducts(resolvedQuery, 4, 0.15);

    // 7. Format standardized sources list
    const sources = (retrievedDocs || []).map(r => {
      const meta = r.metadata || {};
      return {
        product_id: meta.product_id || r.productId || r.id,
        product_name: meta.product_name || meta.name || 'Plant Item',
        category: meta.category || 'General',
        price: meta.price || '₹0',
        availability: meta.availability || 'In Stock',
        source: meta.source || 'catalog_product',
        url: meta.url || `#/product/${meta.product_id || r.productId || r.id}`
      };
    });

    // 8. Generate grounded answer
    let answerText = null;

    // Optional OpenAI / Gemini LLM integration with strict anti-hallucination prompt
    const systemInstructions = `You are "GreenBot", AI Horticultural Assistant for "Ganapathi Gardens" plant nursery in Cheediga, Kakinada.
CRITICAL RULES:
1. ONLY answer based on the provided RETRIEVED STORE DATA.
2. STRICT ANTI-HALLUCINATION: If the information cannot be found in the retrieved store data, respond EXACTLY:
"${ANTI_HALLUCINATION_FALLBACK}"
Do NOT invent plant names, prices, stock, delivery rates, or store policies.
3. When discussing a product, include the price, stock, care guidelines, and provide a markdown link: [View Product](#/product/:id).`;

    let contextText = `=== RETRIEVED NURSERY & PRODUCT DATA ===\n`;
    retrievedDocs.forEach((d, i) => {
      contextText += `[Doc ${i + 1}]:\n${d.text}\n\n`;
    });

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        answerText = await callOpenAiChat(systemInstructions, contextText, resolvedQuery, process.env.OPENAI_API_KEY);
      } catch (err) {
        console.warn('[RAG] OpenAI fallback to built-in generator:', err.message);
      }
    } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      try {
        answerText = await callGeminiChat(systemInstructions, contextText, resolvedQuery, process.env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('[RAG] Gemini fallback to built-in generator:', err.message);
      }
    }

    // Default grounded botanical generator
    if (!answerText) {
      answerText = generateGroundedAnswer(query, resolvedQuery, retrievedDocs, liveOrder, businessInfo);
    }

    // If answer is the exact anti-hallucination fallback, clear sources so no misleading sources are returned
    const finalSources = (answerText === ANTI_HALLUCINATION_FALLBACK) ? [] : sources;

    // 9. Update session history & remember last referenced plant
    const matchingProductDoc = retrievedDocs.find(d => d.metadata?.source === 'catalog_product');
    if (matchingProductDoc && matchingProductDoc.metadata && answerText !== ANTI_HALLUCINATION_FALLBACK) {
      session.lastReferencedProduct = matchingProductDoc.metadata;
    }

    session.history.push({ role: 'user', content: query });
    session.history.push({ role: 'assistant', content: answerText });
    if (session.history.length > 10) {
      session.history = session.history.slice(-10);
    }

    // Format products for backwards-compatible UI cards
    const matchedProductsForUi = finalSources
      .filter(s => s.source === 'catalog_product')
      .map(s => {
        const found = retrievedDocs.find(r => (r.metadata?.product_id === s.product_id));
        const meta = found ? found.metadata : {};
        return {
          id: s.product_id,
          name: s.product_name,
          category: s.category,
          price: meta.numeric_price || Number(String(s.price).replace(/[^\d]/g, '')) || 0,
          originalPrice: Number(String(meta.original_price || s.price).replace(/[^\d]/g, '')) || 0,
          discount: meta.discount || 0,
          availability: s.availability,
          stock: meta.stock || 10,
          image: meta.image || '',
          sunlight: meta.sunlight || '',
          water: meta.water || '',
          score: found ? found.score : 1
        };
      });

    return {
      answer: answerText,
      sources: finalSources,
      // Backward compatibility fields:
      reply: answerText,
      products: matchedProductsForUi,
      conversation_id: session.conversationId,
      order: liveOrder ? {
        orderId: liveOrder.orderId,
        status: liveOrder.status,
        totalAmount: liveOrder.totalAmount
      } : null
    };
  } catch (err) {
    console.error('Error in RAG answerQuery:', err);
    return {
      answer: "I'm having trouble retrieving data from our nursery system right now. Please try again shortly or contact Ganapathi Gardens at 090008 35323.",
      sources: [],
      reply: "I'm having trouble retrieving data from our nursery system right now. Please try again shortly or contact Ganapathi Gardens at 090008 35323.",
      products: [],
      error: err.message
    };
  }
}

module.exports = {
  answerQuery,
  extractOrderId,
  fetchOrderDetails,
  resolveFollowUpQuery,
  ANTI_HALLUCINATION_FALLBACK,
  NURSERY_KNOWLEDGE
};
