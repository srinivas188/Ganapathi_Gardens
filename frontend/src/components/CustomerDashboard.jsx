import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  MapPin, 
  Phone, 
  Clock, 
  SlidersHorizontal, 
  Sparkles, 
  Package, 
  Leaf, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Truck,
  Layers,
  Building2,
  Calendar,
  MessageSquareHeart,
  Bot
} from 'lucide-react';

export default function CustomerDashboard({
  customer,
  onLogout,
  products = [],
  cartItems = [],
  wishlist = [],
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenProfile,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onOpenChatbot
}) {
  // Navigation & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'popular'
  const [priceMax, setPriceMax] = useState(1500);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Categories list
  const categories = [
    { id: 'All', label: 'All Plants', icon: '🌿' },
    { id: 'Flowering Plants', label: 'Flowering Plants', icon: '🌸' },
    { id: 'Indoor Plants', label: 'Indoor Houseplants', icon: '🪴' },
    { id: 'Bonsai Plants', label: 'Bonsai Trees', icon: '🌳' },
    { id: 'Air-Purifying Plants', label: 'Air-Purifying', icon: '🍃' },
    { id: 'Fruit Plants', label: 'Fruit Trees', icon: '🥭' },
    { id: 'Outdoor Plants', label: 'Outdoor Garden', icon: '🌴' },
    { id: 'Gardening Products', label: 'Pots & Fertilizers', icon: '🌱' }
  ];

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(p => 
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (p.plantType && p.plantType.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())))
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.botanicalName && p.botanicalName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Price Max
    if (priceMax) {
      list = list.filter(p => (p.finalPrice || p.price) <= priceMax);
    }

    // In Stock Only
    if (onlyInStock) {
      list = list.filter(p => p.stock > 0 && p.availability !== 'Out of Stock');
    }

    // Sort
    if (selectedSort === 'price_asc') {
      list.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
    } else if (selectedSort === 'popular') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, priceMax, onlyInStock, selectedSort]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="customer-dashboard-shell">
      {/* ----------------------------------------------------
          1. STICKY TOP NAVIGATION BAR (WITH OFFICIAL LOGO)
          ---------------------------------------------------- */}
      <header className="dashboard-nav-header">
        <div className="dashboard-nav-inner">
          {/* Brand Logo (First Image) */}
          <div className="dashboard-logo-wrap" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/assets/ganapathi_logo.jpg" 
              alt="Ganapathi Gardens Official Logo" 
              className="dashboard-logo-img"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.3px' }}>
                  GANAPATHI GARDENS
                </span>
                <span style={{ fontSize: '0.65rem', background: '#E8F5E9', color: '#2D6A4F', padding: '1px 6px', borderRadius: '6px', fontWeight: 700, border: '1px solid #C8E6C9' }}>
                  ® STORE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#52796F', fontWeight: 500 }}>
                Plant Nursery • Landscape Designing • Plant Rental
              </p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div style={{ flex: 1, maxWidth: '440px', position: 'relative', margin: '0 10px' }} className="hide-mobile">
            <Search 
              size={17} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52796F' }} 
            />
            <input 
              type="text"
              placeholder="Search plants, bonsais, flowering shrubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '9999px',
                border: '1.5px solid #D8F3DC',
                background: '#FFFFFF',
                fontSize: '0.86rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2D6A4F'}
              onBlur={(e) => e.target.style.borderColor = '#D8F3DC'}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Customer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Nursery Address / Delivery Badge */}
            <div 
              className="hide-mobile"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#F0FDF4', 
                border: '1px solid #DCFCE7', 
                padding: '6px 12px', 
                borderRadius: '9999px',
                fontSize: '0.78rem',
                color: '#166534',
                fontWeight: 600
              }}
            >
              <MapPin size={14} color="#166534" />
              <span>{customer?.city || 'Kakinada'} (Cheediga)</span>
            </div>

            {/* Wishlist Button */}
            <button 
              onClick={onOpenWishlist}
              title="Saved Wishlist"
              style={{ 
                position: 'relative', 
                background: '#F4F7F5', 
                border: '1px solid #D5E8DC', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                color: wishlist.length > 0 ? '#E11D48' : '#2D6A4F',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={18} fill={wishlist.length > 0 ? '#E11D48' : 'none'} />
              {wishlist.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#E11D48', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, width: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              title="Cart"
              style={{ 
                position: 'relative', 
                background: '#1B4332', 
                border: 'none', 
                color: '#FFFFFF', 
                padding: '8px 16px', 
                borderRadius: '9999px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.86rem',
                boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <ShoppingBag size={17} />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span style={{ background: '#52B788', color: '#FFFFFF', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Customer Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #D8F3DC',
                  padding: '5px 12px 5px 6px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2D6A4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                  {customer?.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1B4332', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customer?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#52796F' }}>
                    Member
                  </div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '240px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    border: '1px solid #E5E7EB',
                    padding: '12px',
                    zIndex: 1000,
                    animation: 'slideUpFade 0.2s ease-out'
                  }}
                >
                  <div style={{ padding: '8px 10px 12px 10px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1B4332' }}>
                      {customer?.name || 'Valued Customer'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                      {customer?.email || customer?.phone}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} color="#166534" />
                      <span>Verified Ganapathi Gardens Member</span>
                    </div>
                  </div>

                  <div style={{ padding: '6px 0' }}>
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); onOpenOrders(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', border: 'none', background: 'none', color: '#374151', fontSize: '0.84rem', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <Package size={16} color="#2D6A4F" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      onClick={() => { setIsProfileMenuOpen(false); onOpenProfile(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', border: 'none', background: 'none', color: '#374151', fontSize: '0.84rem', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <User size={16} color="#2D6A4F" />
                      <span>Delivery Address & Profile</span>
                    </button>

                    <button
                      onClick={() => { setIsProfileMenuOpen(false); onOpenWishlist(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', border: 'none', background: 'none', color: '#374151', fontSize: '0.84rem', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <Heart size={16} color="#E11D48" />
                      <span>Saved Wishlist ({wishlist.length})</span>
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '6px' }}>
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); onLogout(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', border: 'none', background: 'none', color: '#DC2626', fontSize: '0.84rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={16} color="#DC2626" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
          2. MAIN DASHBOARD CONTENT
          ---------------------------------------------------- */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 24px', flex: 1, width: '100%' }}>
        
        {/* HERO SHOWCASE BANNER (FEATURING SECOND IMAGE: NURSERY FLOWER DISPLAY & BILLBOARD) */}
        <div className="dashboard-hero-banner">
          <div 
            className="dashboard-hero-bg" 
            style={{ backgroundImage: `url('/assets/nursery_flower_display.jpg')` }}
          />
          <div className="dashboard-hero-overlay">
            <div style={{ maxWidth: '780px' }}>
              {/* Green Verified Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, color: '#D8F3DC', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <Sparkles size={14} color="#86EFAC" />
                <span>GANAPATHI GARDENS CUSTOMER PORTAL</span>
              </div>

              {/* Personalized Customer Greeting */}
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.18, letterSpacing: '-0.6px' }}>
                Welcome to your Garden Sanctuary, <span style={{ color: '#86EFAC' }}>{customer?.name || 'Friend'}</span>! 🌿
              </h1>

              {/* Billboard Tagline Highlights */}
              <p style={{ fontSize: 'clamp(0.92rem, 1.6vw, 1.1rem)', color: '#D8F3DC', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '680px' }}>
                Discover live nursery-grown plants, exotic bonsais, and flowering beds straight from our <strong>Cheediga, Kakinada</strong> nursery beds. All orders are packed in protective nursery crates with organic potting soil.
              </p>

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-shop-anchor');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    background: '#52B788',
                    color: '#081C15',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Leaf size={17} />
                  <span>Shop Live Plants</span>
                </button>

                <button
                  onClick={onOpenOrders}
                  style={{
                    background: 'rgba(255, 255, 255, 0.16)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    padding: '12px 22px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.26)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
                >
                  <Package size={17} />
                  <span>Track My Orders</span>
                </button>

                {onOpenChatbot && (
                  <button
                    onClick={onOpenChatbot}
                    style={{
                      background: 'rgba(27, 67, 50, 0.75)',
                      backdropFilter: 'blur(10px)',
                      color: '#86EFAC',
                      border: '1.5px solid #52B788',
                      padding: '12px 22px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1B4332'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(27, 67, 50, 0.75)'}
                  >
                    <Bot size={17} />
                    <span>Ask GreenBot AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            3. CUSTOMER DASHBOARD KPI STAT CARDS
            ---------------------------------------------------- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '36px' }}>
          
          {/* Card 1: My Orders & Tracking */}
          <div className="dashboard-stat-card" onClick={onOpenOrders}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
              <Truck size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.76rem', color: '#52796F', fontWeight: 600, textTransform: 'uppercase' }}>
                Delivery Status
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B4332' }}>
                Track Live Orders
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2D6A4F', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View status & invoices</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2: Saved Plant Wishlist */}
          <div className="dashboard-stat-card" onClick={onOpenWishlist}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
              <Heart size={24} fill="#E11D48" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.76rem', color: '#52796F', fontWeight: 600, textTransform: 'uppercase' }}>
                Favorites
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B4332' }}>
                {wishlist.length} Plants Saved
              </div>
              <div style={{ fontSize: '0.74rem', color: '#E11D48', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Manage wishlist</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3: Nursery Location & Hours */}
          <div 
            className="dashboard-stat-card" 
            onClick={() => window.open('https://maps.app.goo.gl/apLx3Us3cWC1PKz87', '_blank')}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Clock size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.76rem', color: '#52796F', fontWeight: 600, textTransform: 'uppercase' }}>
                Visiting Hours
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B4332' }}>
                7:00 AM – 7:30 PM
              </div>
              <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '2px' }}>
                Cheediga, Kakinada (All 7 Days)
              </div>
            </div>
          </div>

          {/* Card 4: AI Horticulturist Support */}
          <div 
            className="dashboard-stat-card" 
            onClick={onOpenChatbot || (() => {})}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
              <Bot size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.76rem', color: '#52796F', fontWeight: 600, textTransform: 'uppercase' }}>
                GreenBot Assistant
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B4332' }}>
                RAG AI Horticulturist
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0369A1', marginTop: '2px' }}>
                Instant plant care & catalog answers
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            4. PLANT CATALOG SHOP SECTION
            ---------------------------------------------------- */}
        <div id="catalog-shop-anchor" style={{ marginBottom: '40px' }}>
          
          {/* Section Heading & Category Filter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  🍃 DIRECT FROM CHEEDIGA NURSERY
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1B4332', margin: '4px 0 0 0', letterSpacing: '-0.4px' }}>
                  Explore Nursery Plants Catalog
                </h2>
              </div>

              {/* Count & Sorting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.86rem', color: '#52796F', fontWeight: 600 }}>
                  Showing <strong>{filteredProducts.length}</strong> varieties
                </span>

                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #D8F3DC',
                    background: '#FFFFFF',
                    color: '#1B4332',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="newest">Newest Fresh Stock</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`dashboard-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Active Filters Summary & In Stock Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#FFFFFF', padding: '12px 18px', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#1B4332', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#1B4332', cursor: 'pointer' }}
                  />
                  <span>Show In-Stock Plants Only</span>
                </label>

                {/* Price Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#52796F' }}>
                  <span>Max Price: <strong>₹{priceMax}</strong></span>
                  <input
                    type="range"
                    min="100"
                    max="2500"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    style={{ width: '120px', accentColor: '#2D6A4F' }}
                  />
                </div>
              </div>

              {(searchQuery || selectedCategory !== 'All' || onlyInStock || priceMax < 1500) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setOnlyInStock(false);
                    setPriceMax(1500);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#1B4332', fontSize: '1.2rem' }}>
                No plants matching your selected filters
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
                Try adjusting the price slider or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setOnlyInStock(false);
                  setPriceMax(1500);
                }}
                style={{
                  background: '#1B4332',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                Show All Plants
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={wishlist.some(w => (w.id || w._id) === (product.id || product._id))}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------
            5. NURSERY SERVICES SHOWCASE (FROM BILLBOARD IN IMAGE 2)
            ---------------------------------------------------- */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              OUR SPECIALIZED SERVICES
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1B4332', margin: '4px 0 8px 0', letterSpacing: '-0.4px' }}>
              Ganapathi Gardens Nursery & Landscaping
            </h2>
            <p style={{ color: '#52796F', fontSize: '0.94rem', maxWidth: '600px', margin: '0 auto' }}>
              We bring over two decades of horticultural expertise to Kakinada, Cheediga, and the Godavari region.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Service 1: Plant Nursery */}
            <div className="service-feature-card">
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', padding: '24px', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '2.4rem' }}>🌿</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>Plant Nursery</h3>
                </div>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0', flex: 1 }}>
                  Thousands of varieties including rare exotic bonsais, air-purifying indoor plants, flowering bougainvilleas, hibiscus, grafted fruit trees, and organic vermicompost.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} />
                  <span>Potted in Organic Nutrient Soil</span>
                </div>
              </div>
            </div>

            {/* Service 2: Landscape Designing */}
            <div className="service-feature-card">
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', padding: '24px', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '2.4rem' }}>🏡</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>Landscape Designing</h3>
                </div>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0', flex: 1 }}>
                  Transform your residential villa, rooftop terrace, or commercial grounds into lush green sanctuaries. We handle soil grading, lawn turfing, irrigation, and stone pathways.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} />
                  <span>Call 090008 35323 for Consultation</span>
                </div>
              </div>
            </div>

            {/* Service 3: Plant Rental Service */}
            <div className="service-feature-card">
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #40916C 0%, #52B788 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', padding: '24px', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '2.4rem' }}>🪴</span>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>Plant Rental Service</h3>
                </div>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0', flex: 1 }}>
                  Keep your corporate office, hotel lobby, or wedding venue fresh with our premium plant rental subscription. Includes routine pruning, watering, and periodic plant rotation.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} />
                  <span>Corporate & Event Subscriptions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            6. NURSERY VISIT & DIRECT CONTACT BANNER
            ---------------------------------------------------- */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #D8F3DC',
          padding: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#166534', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
              <MapPin size={14} />
              <span>VISIT OUR NURSERY GROUNDS</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B4332', margin: '0 0 10px 0' }}>
              Experience the Nursery in Person
            </h3>
            <p style={{ color: '#52796F', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              Walk through our vibrant flower rows and choose your plants directly. Our master horticulturists are on hand to guide you on sunlight, repotting, and soil mixes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="#2D6A4F" />
                <span>Cheediga, PO, Indra Palem, Kakinada, Andhra Pradesh 533006</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="#2D6A4F" />
                <span><strong>090008 35323</strong> (Direct Nursery Phone)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="#2D6A4F" />
                <span>Open 7 Days a Week: 7:00 AM – 7:30 PM</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
            <a
              href="https://maps.app.goo.gl/apLx3Us3cWC1PKz87"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                padding: '14px 24px',
                background: '#1B4332',
                color: '#FFFFFF',
                borderRadius: '14px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 6px 20px rgba(27, 67, 50, 0.25)'
              }}
            >
              <MapPin size={18} />
              <span>Get Directions on Google Maps</span>
            </a>

            <a
              href="tel:09000835323"
              style={{
                width: '100%',
                padding: '14px 24px',
                background: '#F0FDF4',
                color: '#166534',
                border: '1.5px solid #BBF7D0',
                borderRadius: '14px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <Phone size={18} />
              <span>Call Nursery Team (090008 35323)</span>
            </a>
          </div>
        </div>
      </main>

      {/* ----------------------------------------------------
          7. DASHBOARD FOOTER
          ---------------------------------------------------- */}
      <footer style={{ background: '#081C15', color: '#FFFFFF', padding: '36px 24px 24px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/assets/ganapathi_logo.jpg" 
              alt="Logo" 
              style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'contain', background: '#FFFFFF', padding: '2px' }} 
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#D8F3DC' }}>GANAPATHI GARDENS</div>
              <div style={{ fontSize: '0.74rem', color: '#74C69D' }}>Cheediga, Kakinada, Andhra Pradesh</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#74C69D' }}>
            Logged in as <strong>{customer?.name || 'Customer'}</strong> ({customer?.phone || customer?.email}) • <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Sign Out</button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#52796F' }}>
            © {new Date().getFullYear()} Ganapathi Gardens. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
