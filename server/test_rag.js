const testQueries = [
  'What bonsai plants do you have and how much do they cost?',
  'How do I care for Golden pothos? Does it need sunlight?',
  'Where is Ganapathi Gardens located and what are your visiting hours?',
  'Can I track my order GN10730?',
  'Can I track order GG1009?',
  'Do you sell carnivorous Venus Flytrap or blue orchids?' // Anti-hallucination test
];

async function runTests() {
  console.log('Testing RAG Chatbot Endpoint on http://localhost:5000/api/chat...\n');

  for (const q of testQueries) {
    console.log(`=======================================================`);
    console.log(`💬 User Query: "${q}"`);
    console.log(`-------------------------------------------------------`);
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      const data = await res.json();
      console.log(`🤖 Reply:\n${data.reply}\n`);
      if (data.products && data.products.length > 0) {
        console.log(`📦 Matched Plants (${data.products.length}):`, data.products.map(p => `${p.name} (₹${p.price})`).join(', '));
      }
      if (data.order) {
        console.log(`📋 Order Retrieved: #${data.order.orderId} - Status: ${data.order.status} - Total: ₹${data.order.totalAmount}`);
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

runTests();
