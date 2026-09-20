import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import MyOrdersModal from './components/MyOrdersModal';
import CustomerAuthModal from './components/CustomerAuthModal';
import OffersSection from './components/OffersSection';
import AboutLocationSection from './components/AboutLocationSection';
import AdminPortal from './components/AdminPortal';
import PlantCareHub from './components/PlantCareHub';
import PlantSizeVisualizer from './components/PlantSizeVisualizer';
import LandingFrontPage from './components/LandingFrontPage';
import GreenBotChat from './components/GreenBotChat';
import { fetchProducts, fetchBusinessInfo, fetchOffers } from './api';
import { 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Heart, 
  Leaf, 
  Sun, 
  SlidersHorizontal,
  CheckCircle2,
  Phone,
  MapPin,
  Tag
} from 'lucide-react';

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState('Home'); // 'Home' | 'Plants' | 'Categories' | 'Offers' | 'About' | 'Contact' | 'My Orders'
  const [hasEnteredStore, setHasEnteredStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dedicated Admin Route Detection (/admin, #admin, ?admin)
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.startsWith('/admin') ||
      hash.startsWith('#admin') ||
      search.includes('admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Customer Authentication State
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('ganapathi_customer_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authMessage, setAuthMessage] = useState('');

  // Business Info & Delivery Rates State
  const [businessInfo, setBusinessInfo] = useState(null);
  const [selectedArea, setSelectedArea] = useState('Kakinada City');
  const [deliveryAreas, setDeliveryAreas] = useState([
    { name: 'Kakinada City', charge: 50 },
    { name: 'Nearby Area', charge: 80 },
    { name: 'Other Area', charge: 120 }
  ]);

  // Catalog & Offers Data
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlantType, setSelectedPlantType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'popular'
  const [priceMax, setPriceMax] = useState(1000);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ganapathi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ganapathi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Save Cart & Wishlist
  useEffect(() => {
    try {
      localStorage.setItem('ganapathi_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('ganapathi_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Load Catalog, Business Info & Offers from MongoDB API
  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [prodsRes, infoRes, offersRes] = await Promise.all([
        fetchProducts({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          plantType: selectedPlantType !== 'All' ? selectedPlantType : undefined,
          search: searchQuery || undefined,
          sort: selectedSort
        }),
        fetchBusinessInfo(),
        fetchOffers()
      ]);

      if (prodsRes.success) {
        setProducts(prodsRes.products || []);
      }
      if (infoRes.success && infoRes.businessInfo) {
        setBusinessInfo(infoRes.businessInfo);
        if (infoRes.businessInfo.deliveryAreas && infoRes.businessInfo.deliveryAreas.length > 0) {
          setDeliveryAreas(infoRes.businessInfo.deliveryAreas);
        }
      }
      if (offersRes.success) {
        setOffers(offersRes.offers || []);
      }
    } catch (err) {
      console.error('Error fetching data from nursery backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [selectedCategory, selectedPlantType, selectedSort, searchQuery]);

  // Customer Auth Handlers
  const handleOpenAuth = (mode = 'login', msg = '') => {
    setAuthMode(customer ? 'profile' : mode);
    setAuthMessage(msg);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setCustomer(userData);
    triggerToast(`Welcome, ${userData.name}! Logged in successfully.`);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('ganapathi_customer_token');
    localStorage.removeItem('ganapathi_customer_data');
    setCustomer(null);
    setIsAuthModalOpen(false);
    setHasEnteredStore(false);
    triggerToast('Logged out. Returned to Ganapathi Gardens front page.');
  };

  // Cart Operations
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId && i.size === item.size);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity || 1;
        return updated;
      }
      return [...prev, item];
    });
    triggerToast(`Added "${item.name}" to cart! 🌿`);
  };

  const handleBuyNow = (item) => {
    handleAddToCart(item);
    setIsDetailOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }
    setCartItems(prev => prev.map(i => {
      if (i.productId === productId && i.size === size) {
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const handleRemoveItem = (productId, size) => {
    setCartItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const handleToggleWishlist = (prod) => {
    const id = prod.id || prod._id;
    setWishlist(prev => {
      const exists = prev.some(item => (item.id || item._id) === id);
      if (exists) {
        triggerToast(`Removed "${prod.name}" from wishlist.`);
        return prev.filter(item => (item.id || item._id) !== id);
      } else {
        triggerToast(`Saved "${prod.name}" to your wishlist! ❤️`);
        return [...prev, prod];
      }
    });
  };

  // Quick View Modal
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    if (priceMax && (p.finalPrice || p.price) > priceMax) return false;
    if (availabilityFilter === 'In Stock' && (p.stock <= 0 || p.availability === 'Out of Stock')) return false;
    if (availabilityFilter === 'Out of Stock' && p.stock > 0 && p.availability !== 'Out of Stock') return false;
    return true;
  });

  // Dynamic sections for Home
  const featuredPlants = products.filter(p => p.isFeatured || p.badge?.includes('Bestseller')).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const indoorPlants = products.filter(p => p.category === 'Indoor Plants' || p.plantType === 'Indoor').slice(0, 4);
  const floweringPlants = products.filter(p => p.category === 'Flowering Plants' || p.plantType === 'Flowering').slice(0, 4);
  const fruitPlants = products.filter(p => p.category === 'Fruit Plants' || p.plantType === 'Fruit').slice(0, 4);
  const airPurifyingPlants = products.filter(p => p.category === 'Air-Purifying Plants' || p.plantType === 'Air-Purifying').slice(0, 4);
  const gardeningProducts = products.filter(p => p.category === 'Gardening Products' || p.plantType === 'Gardening Products').slice(0, 4);

  // If user navigated to dedicated Admin Portal route (/admin or #admin)
  if (isAdminRoute) {
    return (
      <AdminPortal 
        onExitAdmin={() => {
          window.location.hash = '';
          if (window.location.pathname.startsWith('/admin')) {
            window.location.pathname = '/';
          } else {
            setIsAdminRoute(false);
          }
        }}
        onProductUpdated={loadStoreData}
      />
    );
  }

  return (
    <div className="app-layout" id="ganapathi-gardens-root">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#166534',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 10000,
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Front Page / Landing Page or Main Website */}
      {!hasEnteredStore ? (
        <LandingFrontPage
          savedCustomer={customer}
          onCustomerAuthSuccess={(userData) => {
            setCustomer(userData);
            setHasEnteredStore(true);
            triggerToast(`Welcome to Ganapathi Gardens, ${userData.name || 'valued customer'}!`);
          }}
          onAdminLoginSuccess={(adminData) => {
            window.location.hash = '#admin';
            setIsAdminRoute(true);
            triggerToast('Welcome to Ganapathi Gardens Admin Portal!');
          }}
          onProceedAsGuest={() => {
            setHasEnteredStore(true);
            triggerToast('Entering Ganapathi Gardens store...');
          }}
        />
      ) : (
        <>
          {/* Main Navigation Header */}
          <Header
            customer={customer}
            onOpenAuth={() => handleOpenAuth('login')}
            onCustomerLogout={handleCustomerLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            wishlistCount={wishlist.length}
            cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenWishlist={() => {
              setSelectedCategory('All');
              setActiveTab('Plants');
              triggerToast('Showing all plants. Filter by wishlist!');
            }}
            onOpenMyOrders={() => setIsMyOrdersOpen(true)}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            businessInfo={businessInfo}
          />

          {/* MAIN PAGE ROUTING / TABS */}

          {/* 1. HOME TAB */}
          {activeTab === 'Home' && (
            <main>
              {/* Hero Banner */}
              <Hero 
                onShopPlants={() => {
                  setActiveTab('Plants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewOffers={() => {
                  setActiveTab('Offers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                businessInfo={businessInfo}
              />

              {/* Dynamic Featured Plants Section */}
              <section className="section-padding" style={{ padding: '50px 0', background: '#ffffff' }}>
                <div className="container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="badge badge-green" style={{ marginBottom: '6px' }}>NURSERY FAVORITES</span>
                      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#166534', margin: '4px 0 0 0' }}>
                        Featured Plants 🌱
                      </h2>
                    </div>
                    <button
                      onClick={() => { setActiveTab('Plants'); setSelectedCategory('All'); }}
                      style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>View Entire Catalog</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px' }}>
                    {(featuredPlants.length > 0 ? featuredPlants : products.slice(0, 4)).map(product => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isWishlisted={wishlist.some(w => (w.id || w._id) === (product.id || product._id))}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Dynamic Categories Grid */}
              <section className="section-padding" style={{ padding: '50px 0', background: '#f8fafc' }}>
                <div className="container">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span className="badge badge-green">EXPLORE BY CATEGORY</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#166534', margin: '6px 0 0 0' }}>
                      Browse Plant Collections
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    {[
                      { name: 'Flowering Plants', icon: '🌹', desc: 'Roses, Mogra & Hibiscus' },
                      { name: 'Indoor Plants', icon: '🪴', desc: 'Money plants, Bonsais' },
                      { name: 'Outdoor Plants', icon: '🌴', desc: 'Palms, Crotons & Hedges' },
                      { name: 'Fruit Plants', icon: '🥭', desc: 'Mango, Guava, Sapota' },
                      { name: 'Air-Purifying Plants', icon: '🍃', desc: 'Snake plants, Pothos' },
                      { name: 'Gardening Products', icon: '🌱', desc: 'Vermicompost, Planters' }
                    ].map(cat => (
                      <div
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setActiveTab('Plants');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{cat.icon}</div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{cat.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Flowering & Fruit Highlights Row */}
              <section className="section-padding" style={{ padding: '50px 0', background: '#ffffff' }}>
                <div className="container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div>
                      <span className="badge badge-gold">FRAGRANT & BEAUTIFUL</span>
                      <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#166534', margin: '4px 0 0 0' }}>
                        Flowering & Fruit Varieties 🌹
                      </h2>
                    </div>
                  </div>

                  <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '22px' }}>
                    {(floweringPlants.concat(fruitPlants).slice(0, 4)).map(product => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isWishlisted={wishlist.some(w => (w.id || w._id) === (product.id || product._id))}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Plant Care & Visualizer Strip */}
              <PlantCareHub />

              {/* Location & Google Map & Contact Form */}
              <AboutLocationSection businessInfo={businessInfo} />
            </main>
          )}

          {/* 2. PLANTS TAB (Full Catalog with Search, Filters & Sorting) */}
          {activeTab === 'Plants' && (
            <main className="container" style={{ padding: '40px 0' }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#166534', margin: '0 0 6px 0' }}>
                  Ganapathi Gardens Plant Catalog 🌱
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                  Browse our healthy nursery collection acclimated to Andhra Pradesh climate.
                </p>
              </div>

              {/* Filter Controls Strip */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
                  {/* Category Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Category:
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Indoor Plants">Indoor Plants</option>
                      <option value="Outdoor Plants">Outdoor Plants</option>
                      <option value="Flowering Plants">Flowering Plants</option>
                      <option value="Fruit Plants">Fruit Plants</option>
                      <option value="Air-Purifying Plants">Air-Purifying Plants</option>
                      <option value="Gardening Products">Gardening Products</option>
                    </select>
                  </div>

                  {/* Plant Type Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Plant Type:
                    </label>
                    <select
                      value={selectedPlantType}
                      onChange={(e) => setSelectedPlantType(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="All">All Plant Types</option>
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Fruit">Fruit</option>
                      <option value="Air-Purifying">Air-Purifying</option>
                      <option value="Gardening Products">Gardening Products</option>
                    </select>
                  </div>

                  {/* Price Max Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <span>Max Price:</span>
                      <strong style={{ color: '#166534' }}>₹{priceMax}</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="50"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#166534' }}
                    />
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Availability:
                    </label>
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="All">All Plants</option>
                      <option value="In Stock">In Stock Only</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Sort By:
                    </label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Results */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌱</div>
                  <p>Loading plants from Ganapathi Gardens nursery database...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>No plants match your criteria</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Try clearing your search query or adjusting the price slider.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedPlantType('All');
                      setPriceMax(1500);
                      setSearchQuery('');
                    }}
                    style={{ marginTop: '12px', background: '#166534', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                      onQuickView={handleQuickView}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      isWishlisted={wishlist.some(w => (w.id || w._id) === (product.id || product._id))}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </main>
          )}

          {/* 3. CATEGORIES TAB */}
          {activeTab === 'Categories' && (
            <main className="container" style={{ padding: '40px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>
                  Explore Nursery Categories 🌿
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                  Click any category to filter plants directly from MongoDB.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[
                  { name: 'Flowering Plants', icon: '🌹', desc: 'Fragrant roses, jasmines, hibiscus, and seasonal blooms.' },
                  { name: 'Indoor Plants', icon: '🪴', desc: 'Low light varieties, golden pothos, bonsais, and aglaonemas.' },
                  { name: 'Outdoor Plants', icon: '🌴', desc: 'Hardy palms, crotons, hedges, and garden ornamentals.' },
                  { name: 'Fruit Plants', icon: '🥭', desc: 'Certified grafted mangoes, guavas, pomegranates, and lemons.' },
                  { name: 'Air-Purifying Plants', icon: '🍃', desc: 'NASA-approved oxygen powerhouses for cleaner indoor home air.' },
                  { name: 'Gardening Products', icon: '🌱', desc: 'Pure organic vermicompost, terracotta planters, and potting tools.' }
                ].map(cat => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveTab('Plants');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '28px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{cat.icon}</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#166534', fontWeight: 800 }}>{cat.name}</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{cat.desc}</p>
                    <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>View Plants</span>
                      <ArrowRight size={15} />
                    </span>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* 4. OFFERS TAB */}
          {activeTab === 'Offers' && (
            <main>
              <OffersSection 
                offers={offers}
                onShopNow={() => {
                  setActiveTab('Plants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCopyCoupon={(code) => triggerToast(`Coupon code "${code}" copied to clipboard!`)}
              />
            </main>
          )}

          {/* 5. ABOUT US TAB */}
          {activeTab === 'About' && (
            <main>
              <AboutLocationSection businessInfo={businessInfo} />
            </main>
          )}

          {/* 6. CONTACT TAB */}
          {activeTab === 'Contact' && (
            <main style={{ padding: '20px 0' }}>
              <AboutLocationSection businessInfo={businessInfo} />
            </main>
          )}

          {/* FOOTER */}
          <footer style={{ background: '#0f291e', color: '#ffffff', padding: '50px 0 24px 0', marginTop: '60px' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '36px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🌿</span>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#86efac', fontWeight: 800 }}>Ganapathi Gardens</h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  Cheediga, Kakinada's trusted plant nursery. Healthy indoor foliage, blooming roses, certified fruit saplings, and gardening supplies.
                </p>
                <div style={{ fontSize: '0.84rem', color: '#86efac' }}>
                  📞 +91 94401 23456 • 💬 WhatsApp Available
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', fontWeight: 700 }}>Quick Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#cbd5e1' }}>
                  <span onClick={() => setActiveTab('Plants')} style={{ cursor: 'pointer' }}>All Plants</span>
                  <span onClick={() => setActiveTab('Offers')} style={{ cursor: 'pointer' }}>Special Offers & Discounts</span>
                  <span onClick={() => setIsMyOrdersOpen(true)} style={{ cursor: 'pointer' }}>Track & My Orders</span>
                  <span onClick={() => setActiveTab('About')} style={{ cursor: 'pointer' }}>Nursery Location & Directions</span>
                  <span onClick={() => handleOpenAuth('login')} style={{ cursor: 'pointer' }}>Customer Sign In</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '14px', fontWeight: 700 }}>Nursery Address</h4>
                <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                  Cheediga, PO, Indra Palem, Kakinada, Andhra Pradesh 533006, India
                </p>
                <a
                  href="https://maps.app.goo.gl/19cfUNcC6EmtfYVu7"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#86efac', fontSize: '0.84rem', textDecoration: 'underline' }}
                >
                  View on Google Maps →
                </a>
              </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '18px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              © {new Date().getFullYear()} Ganapathi Gardens Plant Nursery. All rights reserved. Cheediga, Kakinada, Andhra Pradesh.
            </div>
          </footer>
        </>
      )}

      {/* Global Modals (Accessible in both Dashboard & Store) */}
      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={selectedProduct ? wishlist.some(w => (w.id || w._id) === (selectedProduct.id || selectedProduct._id)) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        deliveryAreas={deliveryAreas}
        coupon={coupon}
        onApplyCoupon={setCoupon}
        onRemoveCoupon={() => setCoupon(null)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3. Checkout Modal (Auth Enforced) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customer={customer}
        onRequireAuth={(msg) => handleOpenAuth('login', msg)}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        deliveryAreas={deliveryAreas}
        coupon={coupon}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setCartItems([]);
          setCoupon(null);
          triggerToast(`Order #${order.orderNumber || order.id} placed successfully!`);
          setIsMyOrdersOpen(true);
        }}
      />

      {/* 4. My Orders Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        customer={customer}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* 5. Customer Login / Signup / Profile Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        customer={customer}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleCustomerLogout}
        initialMode={authMode}
        customMessage={authMessage}
      />

      {/* Floating RAG AI Horticulturist Launcher ("down round icon" in bottom right) */}
      <GreenBotChat 
        onSelectProduct={(prod) => {
          if (!hasEnteredStore) setHasEnteredStore(true);
          handleQuickView(prod);
        }} 
        onOpenTrackOrder={() => {
          if (!hasEnteredStore) setHasEnteredStore(true);
          setIsMyOrdersOpen(true);
        }} 
      />
    </div>
  );
}
