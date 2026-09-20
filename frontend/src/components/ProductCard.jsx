import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  Sun, 
  Droplet, 
  Star, 
  Zap,
  Check, 
  AlertTriangle 
} from 'lucide-react';

export default function ProductCard({ 
  product, 
  onQuickView, 
  onAddToCart, 
  onBuyNow,
  isWishlisted, 
  onToggleWishlist 
}) {
  // Support variants or top-level product pricing
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : null;
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

  const activeVariant = sizes ? sizes[selectedSizeIdx] : null;
  const originalPrice = activeVariant?.originalPrice || product.originalPrice || product.price || 300;
  const finalPrice = activeVariant?.finalPrice || activeVariant?.price || product.finalPrice || product.price || 270;
  const discount = activeVariant?.discount || product.discount || (originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
  const savings = originalPrice - finalPrice;

  const currentSize = activeVariant?.size || product.size || 'Medium';
  const currentHeight = activeVariant?.height || product.height || '2 Feet';
  const currentPot = activeVariant?.pot || product.potSize || '8 Inches Nursery Pot';
  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : (product.stock !== undefined ? product.stock : 15);
  const isOutOfStock = currentStock <= 0 || product.availability === 'Out of Stock';

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart({
      productId: product.id || product._id,
      name: product.name,
      category: product.category,
      image: product.mainImage || product.images?.[0],
      size: currentSize,
      height: currentHeight,
      potSize: currentPot,
      originalPrice,
      price: finalPrice,
      finalPrice,
      discount,
      quantity: 1
    });
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onBuyNow) {
      onBuyNow({
        productId: product.id || product._id,
        name: product.name,
        category: product.category,
        image: product.mainImage || product.images?.[0],
        size: currentSize,
        height: currentHeight,
        potSize: currentPot,
        originalPrice,
        price: finalPrice,
        finalPrice,
        discount,
        quantity: 1
      });
    } else {
      handleAddToCartClick(e);
    }
  };

  return (
    <div className="product-card" id={`product-card-${product.id || product._id}`}>
      {/* Thumbnail Box & Badges */}
      <div className="product-thumb-box" onClick={() => onQuickView(product)} style={{ cursor: 'pointer', position: 'relative' }}>
        <img 
          src={product.mainImage || product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'} 
          alt={product.name} 
          className="product-img"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
            <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.3px', boxShadow: '0 2px 6px rgba(220,38,38,0.3)' }}>
              {discount}% OFF
            </span>
            {savings > 0 && (
              <span style={{ background: '#15803d', color: '#ffffff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                SAVE ₹{savings}
              </span>
            )}
          </div>
        )}

        {/* Plant Type / Bestseller Badge */}
        {(product.plantType || product.badge) && (
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 2 }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#86efac', fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '9999px' }}>
              {product.badge || product.plantType}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn-float ${isWishlisted ? 'active' : ''}`}
          id={`wishlist-btn-${product.id || product._id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={17} fill={isWishlisted ? '#dc2626' : 'none'} color={isWishlisted ? '#dc2626' : 'currentColor'} />
        </button>
      </div>

      {/* Product Content */}
      <div className="product-content">
        <div className="product-category-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d97706', fontSize: '0.78rem', fontWeight: 700 }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating || '4.9'}</span>
          </div>
        </div>

        <h3 className="product-title" onClick={() => onQuickView(product)} style={{ cursor: 'pointer', margin: '6px 0 4px 0', fontSize: '1.05rem', color: '#0f172a' }}>
          {product.name}
        </h3>

        {/* Description snippet */}
        {product.description && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        {/* Plant Specs (Size, Height, Pot Size) */}
        <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', fontSize: '0.76rem', color: '#334155', margin: '6px 0 10px 0', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Size: <strong>{currentSize}</strong></span>
            <span>Height: <strong>{currentHeight}</strong></span>
          </div>
          <div style={{ color: '#64748b' }}>
            Pot: <strong>{currentPot}</strong>
          </div>
        </div>

        {/* Multiple Size selector pills (if available) */}
        {sizes && sizes.length > 1 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {sizes.map((s, idx) => (
              <button
                key={s.size}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedSizeIdx(idx); }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: selectedSizeIdx === idx ? 700 : 500,
                  background: selectedSizeIdx === idx ? '#166534' : '#f1f5f9',
                  color: selectedSizeIdx === idx ? '#ffffff' : '#334155',
                  border: selectedSizeIdx === idx ? '1px solid #166534' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}

        {/* Care Quick Badges */}
        <div className="care-specs-strip" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <span className="care-mini-pill" title={`Sunlight: ${product.sunlight || 'Direct/Indirect'}`}>
            <Sun size={11} color="#ea580c" />
            <span>{product.sunlight?.split(' ')[0] || 'Sunlight'}</span>
          </span>
          <span className="care-mini-pill" title={`Water: ${product.waterRequirement || product.water || 'Regular'}`}>
            <Droplet size={11} color="#0284c7" />
            <span>{product.waterRequirement?.split(' ')[0] || 'Water'}</span>
          </span>
          <span className="care-mini-pill" style={{ color: currentStock > 0 ? '#16a34a' : '#dc2626', background: currentStock > 0 ? '#f0fdf4' : '#fef2f2' }}>
            {currentStock > 0 ? `Stock: ${currentStock}` : 'Out of Stock'}
          </span>
        </div>

        {/* Pricing Box */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.28rem', fontWeight: 800, color: '#166534' }}>
            ₹{finalPrice}
          </span>
          {originalPrice > finalPrice && (
            <span style={{ fontSize: '0.88rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Buttons: ADD TO CART & BUY NOW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            id={`add-cart-btn-${product.id || product._id}`}
            className="btn btn-sm"
            disabled={isOutOfStock}
            onClick={handleAddToCartClick}
            style={{
              background: isOutOfStock ? '#cbd5e1' : '#f0fdf4',
              color: isOutOfStock ? '#64748b' : '#166534',
              border: isOutOfStock ? '1px solid #cbd5e1' : '1px solid #86efac',
              borderRadius: '8px',
              padding: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'Sold Out' : 'ADD TO CART'}</span>
          </button>

          <button
            id={`buy-now-btn-${product.id || product._id}`}
            className="btn btn-sm"
            disabled={isOutOfStock}
            onClick={handleBuyNowClick}
            style={{
              background: isOutOfStock ? '#cbd5e1' : '#166534',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            <Zap size={14} />
            <span>BUY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
}
