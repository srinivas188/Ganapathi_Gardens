const jwt = require('jsonwebtoken');

const JWT_ADMIN_SECRET = 'ganapathi_gardens_admin_jwt_secret_key_2026_secure';
const adminToken = jwt.sign({ id: 'test_admin', email: 'admin@ganapathigardens.com', role: 'admin' }, JWT_ADMIN_SECRET, { expiresIn: '1h' });

async function testSync() {
  console.log('Testing Automatic MongoDB -> Vector Database Synchronization...\n');

  // 1. Add Product
  const newPlant = {
    name: 'RAG Sync Exotic Jasmine',
    botanicalName: 'Jasminum sambac',
    category: 'Flowering Plants',
    plantType: 'Outdoor',
    description: 'Fragrant white flowers, sacred garden plant blooming profusely in sunny climates.',
    originalPrice: 350,
    discount: 20,
    price: 280,
    stock: 25,
    size: 'Medium',
    height: '2.5 Feet',
    potSize: '9 Inch Pot',
    sunlight: 'Full Sun to Partial Shade',
    waterRequirement: 'Daily watering during summer',
    careInstructions: 'Prune after flowering and enrich with bone meal or vermicompost.',
    tags: ['Jasmine', 'Flowering', 'Fragrant']
  };

  console.log('1. Adding new plant via POST /api/products...');
  const addRes = await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(newPlant)
  });
  const addData = await addRes.json();
  console.log('   Add Response:', addData.success ? `Success! ID: ${addData.product?.id || addData.product?._id}` : addData.message);

  const productId = addData.product?.id || addData.product?._id;

  // 2. Query Chatbot for the newly added plant
  console.log('\n2. Querying RAG Chatbot for the newly added plant...');
  const chatRes1 = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Do you have Jasmine plant and how much is it?' })
  });
  const chatData1 = await chatRes1.json();
  console.log('   Chatbot Answer:\n', chatData1.reply);
  console.log('   Matched Products:', chatData1.products?.map(p => `${p.name} (₹${p.price})`));

  // 3. Update Product Price & Specs
  console.log('\n3. Updating plant price via PUT /api/products/' + productId + '...');
  const updateRes = await fetch(`http://localhost:5000/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      price: 220,
      originalPrice: 300,
      discount: 25,
      careInstructions: 'Updated care: water twice a week with drip irrigation.'
    })
  });
  const updateData = await updateRes.json();
  console.log('   Update Response:', updateData.success ? 'Success!' : updateData.message);

  // 4. Query Chatbot again to verify updated vector
  console.log('\n4. Querying RAG Chatbot to verify updated vector details...');
  const chatRes2 = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'How do I care for Jasmine plant and what is the new price?' })
  });
  const chatData2 = await chatRes2.json();
  console.log('   Chatbot Answer:\n', chatData2.reply);

  // 5. Delete the test product
  console.log('\n5. Deleting test plant via DELETE /api/products/' + productId + '...');
  const delRes = await fetch(`http://localhost:5000/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const delData = await delRes.json();
  console.log('   Delete Response:', delData.success ? 'Success! Vector removed.' : delData.message);
}

testSync();
