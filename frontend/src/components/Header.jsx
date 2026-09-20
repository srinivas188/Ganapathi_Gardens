import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Package, 
  User,
  Menu,
  X,
  Tag,
  Info,
  Mail,
  Grid,
  LogOut
} from 'lucide-react';

export default function Header({ 
  customer,
  onOpenAuth,
  onCustomerLogout,
  searchQuery, 
  onSearchChange,
  wishlistCount, 
  cartCount, 
  onOpenCart, 
  onOpenWishlist,
  onOpenMyOrders,
  activeTab, 
  onSelectTab,
  businessInfo
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navLinks = [
    { id: 'Home', label: 'Home' },
    { id: 'Plants', label: 'Plants 🌱' },
    { id: 'Categories', label: 'Categories 🌿' },
    { id: 'Offers', label: 'Offers 🏷️', highlight: true },
    { id: 'About', label: 'About Us' },
    { id: 'Contact', label: 'Contact' },
    { id: 'My Orders', label: 'My Orders 📦' }
  ];

  const handleNavClick = (tabId) => {
    if (tabId === 'My Orders') {
      onOpenMyOrders();
    } else {
      onSelectTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="main-header" id="main-header">
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-notice">
            <Sparkles size={14} color="#86efac" />
            <span>
              <strong>Ganapathi Gardens Nursery</strong> — Freshly potted plants delivered across Kakinada & East Godavari!
            </span>
          </div>
          <div className="top-bar-links">
            <a 
              href="https://maps.app.goo.gl/19cfUNcC6EmtfYVu7" 
              target="_blank" 
              rel="noreferrer"
              className="top-bar-link"
              title="Visit Nursery in Cheediga, Kakinada"
            >
              <MapPin size={13} />
              <span>Cheediga, Kakinada (Directions)</span>
            </a>
            <a href="tel:+919440123456" className="top-bar-link">
              <Phone size={13} />
              <span>+91 94401 23456</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="container header-inner">
        {/* Mobile Menu Hamburger */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#166534',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Ganapathi Gardens Brand Logo */}
        <div className="brand-logo" id="brand-logo" onClick={() => handleNavClick('Home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', fontSize: '22px' }}>
            🌿
          </div>
          <div className="brand-text">
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#166534', letterSpacing: '-0.5px' }}>
              GANAPATHI GARDENS
            </h1>
            <span className="brand-tagline" style={{ fontSize: '0.72rem', color: '#4b7a60', fontWeight: 500 }}>
              Plant Nursery • Cheediga, Kakinada
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <Search size={17} className="search-icon-inside" />
          <input
            type="text"
            id="header-search-input"
            className="search-input"
            placeholder="Search roses, indoor greens, mango saplings, pots..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* My Orders Button */}
          <button 
            id="nav-my-orders-btn"
            className="btn btn-outline-green btn-sm"
            onClick={onOpenMyOrders}
            style={{ borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={16} />
            <span className="hide-mobile">My Orders</span>
          </button>

          {/* Customer Auth / Profile Button */}
          {customer ? (
            <div className="customer-profile-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
              <User size={16} color="#16a34a" />
              <span 
                onClick={onOpenAuth} 
                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', cursor: 'pointer' }}
                title="View/Edit Profile"
              >
                {customer.name?.split(' ')[0] || 'My Profile'}
              </span>
              <button 
                onClick={onCustomerLogout}
                title="Log Out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              id="customer-login-btn"
              className="btn btn-sm"
              onClick={onOpenAuth}
              style={{
                background: '#166534',
                color: '#fff',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={15} />
              <span>Login / Signup</span>
            </button>
          )}

          {/* Wishlist */}
          <button 
            id="wishlist-btn"
            className="action-btn" 
            onClick={onOpenWishlist}
            title="Your Saved Wishlist"
          >
            <Heart size={20} color={wishlistCount > 0 ? '#e11d48' : 'currentColor'} fill={wishlistCount > 0 ? '#e11d48' : 'none'} />
            {wishlistCount > 0 && <span className="badge-count" id="wishlist-badge">{wishlistCount}</span>}
          </button>

          {/* Cart */}
          <button 
            id="cart-btn"
            className="action-btn" 
            onClick={onOpenCart}
            style={{ background: '#dcfce7', color: '#166534' }}
            title="Shopping Cart"
          >
            <ShoppingBag size={20} color="#166534" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cart</span>
            {cartCount > 0 && <span className="badge-count" id="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="container">
        <nav className="nav-categories" id="nav-categories">
          {navLinks.map(tab => (
            <span
              key={tab.id}
              id={`nav-link-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''} ${tab.highlight ? 'highlight' : ''}`}
              onClick={() => handleNavClick(tab.id)}
            >
              {tab.label}
            </span>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🌿</span>
                <strong style={{ color: '#166534' }}>Ganapathi Gardens</strong>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-links">
              {navLinks.map(link => (
                <div 
                  key={link.id} 
                  className={`mobile-nav-item ${activeTab === link.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.id)}
                >
                  {link.label}
                </div>
              ))}
              <hr style={{ margin: '15px 0', borderColor: '#e2e8f0' }} />
              <div 
                className="mobile-nav-item"
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              >
                <User size={16} />
                <span>{customer ? `Logged in: ${customer.name}` : 'Customer Login / Signup'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
