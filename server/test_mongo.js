const { connectDB, getIsConnected } = require('./config/db');
const Product = require('./models/Product');

async function test() {
  await connectDB();
  console.log('Connected:', getIsConnected());

  const data = {
    name: 'Money Plant Golden',
    category: 'Indoor Plants',
    plantType: 'Indoor',
    description: 'Beautiful money plant',
    mainImage: '/uploads/plant_1789759321462_lpxm6.jpg',
    images: ['/uploads/plant_1789759321462_lpxm6.jpg'],
    size: 'Medium',
    height: '2 Feet',
    potSize: '8 Inch Pot',
    originalPrice: 300,
    price: 270,
    discount: 10,
    finalPrice: 270,
    stock: 20,
    availability: 'In Stock',
    sunlight: 'Bright Indirect Sunlight',
    waterRequirement: 'Water when top 1-2 inches dry',
    careInstructions: 'Apply organic vermicompost every 3-4 weeks.'
  };

  const discount = Number(data.discount) || 0;
  const originalPrice = Number(data.originalPrice);
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : (Number(data.price) || originalPrice);
  const id = 'prod-gg-' + Date.now();

  const newProductData = {
    id,
    name: data.name.trim(),
    botanicalName: data.botanicalName || '',
    category: data.category,
    plantType: data.plantType || 'Indoor',
    description: data.description || '',
    mainImage: data.mainImage || (data.images && data.images[0]) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    images: data.images && data.images.length > 0 ? data.images : [data.mainImage],
    size: data.size || 'Medium',
    height: data.height || '2 Feet',
    potSize: data.potSize || '8 Inch Pot',
    originalPrice,
    price: finalPrice,
    discount,
    finalPrice,
    stock: Number(data.stock) || 10,
    availability: Number(data.stock) > 0 ? 'In Stock' : 'Out of Stock',
    sunlight: data.sunlight || 'Bright Indirect Sunlight',
    waterRequirement: data.waterRequirement || 'Water when top soil is dry',
    careInstructions: data.careInstructions || 'Nourish with organic compost monthly.',
    rating: 4.9,
    reviewCount: 1,
    badge: data.badge || (discount >= 15 ? `${discount}% OFF` : 'Nursery Fresh'),
    isFeatured: Boolean(data.isFeatured),
    isPopular: Boolean(data.isPopular),
    isNewArrival: true,
    sizes: data.sizes && data.sizes.length > 0 ? data.sizes : [
      { size: data.size || 'Medium', height: data.height || '2 Feet', pot: data.potSize || '8 Inch Pot', price: finalPrice, originalPrice, discount, finalPrice, stock: Number(data.stock) || 10 }
    ],
    tags: data.tags || ['Ganapathi Gardens', data.category]
  };

  try {
    const created = await Product.create(newProductData);
    console.log('Successfully created product:', created._id, created.name);
    // clean up
    await Product.deleteOne({ _id: created._id });
    console.log('Cleaned up test product.');
  } catch (err) {
    console.error('Mongoose error during Product.create:', err);
  }
  process.exit(0);
}

test();
