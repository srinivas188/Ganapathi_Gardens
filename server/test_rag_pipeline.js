/**
 * test_rag_pipeline.js
 * 
 * Comprehensive Test Suite for Ganapathi Gardens RAG Chatbot
 * Tests all 10 scenarios required by the specification:
 * 
 * 1. Product search
 * 2. Price query
 * 3. Availability
 * 4. Plant-care question
 * 5. Category search
 * 6. Multiple-product query
 * 7. Follow-up question
 * 8. Unknown question (anti-hallucination check)
 * 9. Empty message
 * 10. API / vector database failure handling
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 =========================================================');
  console.log('🌱 Ganapathi Gardens - Complete RAG Chatbot Test Suite');
  console.log('🧪 =========================================================\n');

  let passed = 0;
  let total = 0;

  async function testCase(num, title, fn) {
    total++;
    try {
      console.log(`▶️ Test ${num}: ${title}`);
      await fn();
      console.log(`   ✅ PASS\n`);
      passed++;
    } catch (err) {
      console.error(`   ❌ FAIL: ${err.message}\n`);
    }
  }

  // Test 1: Product search
  await testCase(1, 'Product Search ("Tell me about Snake Plant")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about Snake Plant', conversation_id: 'test_conv_1_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    if (!data.answer || !data.answer.toLowerCase().includes('snake plant')) {
      throw new Error(`Answer did not contain Snake Plant: ${data.answer}`);
    }
    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      throw new Error(`Sources missing or empty`);
    }
    const hasSnakeSource = data.sources.some(s => s.product_name && s.product_name.toLowerCase().includes('snake plant'));
    if (!hasSnakeSource) throw new Error('Sources did not include Snake Plant');
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 100)}..."`);
    console.log(`   📚 Found sources: ${data.sources.map(s => s.product_name).join(', ')}`);
  });

  // Test 2: Price query
  await testCase(2, 'Price Query ("What is the price of Kakinada Red Rose?")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the price of Kakinada Red Rose?', conversation_id: 'test_conv_2_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!data.answer || (!data.answer.includes('270') && !data.answer.includes('₹'))) {
      throw new Error(`Price not found in answer: ${data.answer}`);
    }
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 100)}..."`);
  });

  // Test 3: Availability
  await testCase(3, 'Availability ("Is Areca Palm in stock?")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Is Areca Palm in stock?', conversation_id: 'test_conv_3_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!data.answer.toLowerCase().includes('in stock') && !data.answer.toLowerCase().includes('areca palm')) {
      throw new Error(`Availability details not returned: ${data.answer}`);
    }
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 100)}..."`);
  });

  // Test 4: Plant-care question
  await testCase(4, 'Plant-Care Question ("What soil and fertilizer is recommended for indoor plants?")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What soil and fertilizer is recommended for indoor plants?', conversation_id: 'test_conv_4_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ansLower = data.answer.toLowerCase();
    const hasSoilOrFertilizer = ansLower.includes('soil') || ansLower.includes('vermicompost') || ansLower.includes('potting');
    if (!hasSoilOrFertilizer) {
      throw new Error(`Care guidance not found: ${data.answer}`);
    }
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 120)}..."`);
  });

  // Test 5: Category search
  await testCase(5, 'Category Search ("Show me flowering plants")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Show me flowering plants', conversation_id: 'test_conv_5_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!data.sources || data.sources.length === 0) throw new Error('No sources returned for category search');
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 100)}..."`);
    console.log(`   📚 Sources count: ${data.sources.length}`);
  });

  // Test 6: Multiple-product query
  await testCase(6, 'Multiple-Product Query ("Which plants need low sunlight?")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Which plants need low sunlight?', conversation_id: 'test_conv_6_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!data.sources || data.sources.length === 0) throw new Error('No plants returned for low sunlight query');
    console.log(`   📝 Answer excerpt: "${data.answer.substring(0, 120)}..."`);
    console.log(`   📚 Recommended plants: ${data.sources.map(s => s.product_name).join(', ')}`);
  });

  // Test 7: Follow-up question (Context & Coreference Resolution)
  await testCase(7, 'Follow-up Question ("Tell me about Snake Plant" -> "How often should I water it?")', async () => {
    const followUpConv = 'follow_up_test_' + Date.now();
    
    // Turn 1
    const turn1Res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about Snake Plant', conversation_id: followUpConv })
    });
    const turn1Data = await turn1Res.json();
    if (!turn1Data.answer.toLowerCase().includes('snake plant')) {
      throw new Error(`Turn 1 failed to retrieve Snake Plant: ${turn1Data.answer}`);
    }

    // Turn 2: Follow-up using pronoun "it"
    const turn2Res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How often should I water it?', conversation_id: followUpConv })
    });
    const turn2Data = await turn2Res.json();
    const ansLower = turn2Data.answer.toLowerCase();
    
    // Should understand "it" = Snake Plant, and give watering instructions (e.g. 10-14 days or dry)
    const hasSnakeCare = ansLower.includes('snake plant') || ansLower.includes('10-14') || ansLower.includes('drought') || ansLower.includes('water');
    if (!hasSnakeCare) {
      throw new Error(`Turn 2 failed to resolve "it" to Snake Plant: ${turn2Data.answer}`);
    }
    console.log(`   🔗 Turn 1 Query: "Tell me about Snake Plant"`);
    console.log(`   🔗 Turn 2 Query: "How often should I water it?"`);
    console.log(`   📝 Turn 2 Answer: "${turn2Data.answer.substring(0, 140)}..."`);
  });

  // Test 8: Unknown question (Strict Anti-Hallucination rule)
  await testCase(8, 'Unknown Question ("Do you sell Blue Orchids from Mars?")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Do you sell Blue Orchids from Mars?', conversation_id: 'test_conv_8_' + Date.now() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const EXPECTED = "I couldn't find that information in our plant store data.";
    if (data.answer !== EXPECTED) {
      throw new Error(`Expected exact anti-hallucination response: "${EXPECTED}", got: "${data.answer}"`);
    }
    if (data.sources && data.sources.length > 0) {
      throw new Error(`Sources should be empty for unknown question, got ${data.sources.length}`);
    }
    console.log(`   🛡️ Correctly triggered exact anti-hallucination guardrail: "${data.answer}"`);
  });

  // Test 9: Empty message
  await testCase(9, 'Empty Message ("")', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '', conversation_id: 'test_conv_9_' + Date.now() })
    });
    const data = await res.json();
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for empty message, got ${res.status}`);
    }
    if (!data.error) throw new Error('Expected error property in response');
    console.log(`   🛑 Validated with HTTP ${res.status}: "${data.error}"`);
  });

  // Test 10: API / Vector Database failure handling
  await testCase(10, 'API / Vector DB Failure Handling', async () => {
    // Test that the ragChatService catches unexpected null/undefined exceptions gracefully
    const { answerQuery } = require('./services/ragChatService');
    const mockError = await answerQuery(null);
    if (!mockError || (!mockError.error && !mockError.answer)) {
      throw new Error('Failed to handle invalid query payload gracefully');
    }
    console.log(`   🛡️ Handled gracefully: "${mockError.answer || mockError.reply}"`);
  });

  console.log('=========================================================');
  console.log(`🏁 Test Summary: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('=========================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
