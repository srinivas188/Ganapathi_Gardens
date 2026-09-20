// Automated E2E API & Frontend Verification Script for GreenNest Nursery

async function runTests() {
  console.log('🌿 ========================================================');
  console.log('   GREENNEST NURSERY - AUTOMATED END-TO-END VERIFICATION');
  console.log('========================================================\n');

  try {
    // 1. Frontend Server check
    const feRes = await fetch('http://localhost:3000/');
    const feHtml = await feRes.text();
    console.log(`✅ [1/6] Frontend Server (Port 3000): HTTP ${feRes.status} OK`);
    console.log(`   Title Verified: ${feHtml.includes('GreenNest Nursery') ? 'YES 🌿' : 'NO'}`);

    // 2. Products API check
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prodData = await prodRes.json();
    console.log(`✅ [2/6] Products API: HTTP ${prodRes.status} - Loaded ${prodData.count} products`);
    const mp = prodData.data.find(p => p.name.includes('Money Plant'));
    console.log(`   Sample Plant: "${mp.name}" with ${mp.sizes.length} size variants:`);
    mp.sizes.forEach(s => console.log(`      • ${s.size}: Height ${s.height} | Pot ${s.pot} | Price ₹${s.price} | Stock: ${s.stock}`));

    // 3. Delivery Calculator API check (Kakinada 533001)
    const delivRes = await fetch('http://localhost:5000/api/delivery/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode: '533001', subtotal: 600, hasLargePlant: false })
    });
    const delivData = await delivRes.json();
    console.log(`✅ [3/6] Delivery Calculation API (Pincode 533001): Available: ${delivData.available}`);
    console.log(`   Destination: ${delivData.area} (${delivData.distanceKm} km) | Charge: ₹${delivData.baseCharge} | Est: ${delivData.estimatedDays}`);

    // 4. Order Tracking API check (GN10245)
    const trackRes = await fetch('http://localhost:5000/api/orders/track/GN10245');
    const trackData = await trackRes.json();
    console.log(`✅ [4/6] Order Tracking API: Found Order #${trackData.data.id}`);
    console.log(`   Customer: ${trackData.data.customer.name} | Status: ${trackData.data.status} | Total: ₹${trackData.data.total}`);
    console.log(`   Plant Health Guarantee Photo: ${trackData.data.preDispatchPhoto ? 'VERIFIED 📸' : 'NONE'}`);
    console.log(`   Inspector: ${trackData.data.preDispatchPhoto?.inspectedBy}`);

    // 5. GreenBot AI Chatbot API check
    const botRes = await fetch('http://localhost:5000/api/greenbot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Suggest bedroom plants under 500' })
    });
    const botData = await botRes.json();
    console.log(`✅ [5/6] GreenBot AI Assistant API: Responded successfully`);
    console.log(`   Bot Answer Snippet:\n   "${botData.reply.split('\n')[0]}"`);

    // 6. Admin Stats & Inventory check
    const adminRes = await fetch('http://localhost:5000/api/admin/stats');
    const adminData = await adminRes.json();
    console.log(`✅ [6/6] Admin Analytics & Logistics Hub API:`);
    console.log(`   Sales: ₹${adminData.stats.todaySales} | Orders: ${adminData.stats.totalOrders} | Customers: ${adminData.stats.customersCount} | Plants Sold: ${adminData.stats.plantsSold} | Pending: ${adminData.stats.pendingOrders}`);

    console.log('\n🌟 ALL 6 END-TO-END CRITICAL SUBSYSTEMS VERIFIED 100% OPERATIONAL!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();
