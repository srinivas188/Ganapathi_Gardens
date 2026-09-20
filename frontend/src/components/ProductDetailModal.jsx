import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Sun, 
  Droplet, 
  ShieldCheck, 
  Star, 
  Truck, 
  Zap,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  isWishlisted, 
  onToggleWishlist 
}) {
  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.mainImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'];

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : null;
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImgIdx(0);
    setSelectedSizeIdx(0);
    setQuantity(1);
  }, [product]);

  const activeVariant = sizes ? sizes[selectedSizeIdx] : null;
  const originalPrice = activeVariant?.originalPrice || product.originalPrice || product.price || 300;
  const finalPrice = activeVariant?.finalPrice || activeVariant?.price || product.finalPrice || product.price || 270;
  const discount = activeVariant?.discount || product.discount || (originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
  const savings = (originalPrice - finalPrice) * quantity;

  const currentSize = activeVariant?.size || product.size || 'Medium';
  const currentHeight = activeVariant?.height || product.height || '2 Feet';
  const currentPot = activeVariant?.pot || product.potSize || '8 Inches Nursery Pot';
  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : (product.stock !== undefined ? product.stock : 15);
  const isOutOfStock = currentStock <= 0 || product.availability === 'Out of Stock';

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart({
      productId: product.id || product._id,
      name: product.name,
      category: product.category,
      image: images[activeImgIdx] || images[0],
      size: currentSize,
      height: currentHeight,
      potSize: currentPot,
      originalPrice,
      price: finalPrice,
      finalPrice,
      discount,
      quantity
    });
  };

  const handleBuy = () => {
    if (isOutOfStock) return;
    onBuyNow({
      productId: product.id || product._id,
      name: product.name,
      category: product.category,
      image: images[activeImgIdx] || images[0],
      size: currentSize,
      height: currentHeight,
      potSize: currentPot,
      originalPrice,
      price: finalPrice,
      finalPrice,
      discount,
      quantity
    });
  };

  return (
    <div className="modal-overlay" id="product-detail-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content-card" 
        id="product-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '92%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px' }}
      >
        <button className="modal-close-btn" onClick={onClose} id="close-product-detail" style={{ zIndex: 10 }}>
          <X size={20} />
        </button>

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '28px' }}>
          {/* Left: Gallery */}
          <div className="detail-gallery">
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <img 
                src={images[activeImgIdx] || images[0]} 
                alt={product.name} 
                className="main-detail-img"
                style={{ width: '100%', height: '360px', objectFit: 'cover' }}
              />

              {discount > 0 && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                    {discount}% OFF
                  </span>
                  {savings > 0 && (
                    <span style={{ background: '#166534', color: '#fff', fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      SAVE ₹{savings}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activeImgIdx === idx ? '2px solid #166534' : '1px solid #cbd5e1',
                      opacity: activeImgIdx === idx ? 1 : 0.75
                    }}
                    onClick={() => setActiveImgIdx(idx)}
                  />
                ))}
              </div>
            )}

            {/* Ganapathi Gardens Nursery Assurance */}
            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginTop: '16px'
            }}>
              <ShieldCheck size={26} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: '#14532d' }}>
                <strong>Ganapathi Gardens Assurance 🌿</strong>
                <p style={{ margin: '2px 0 0 0', color: '#166534' }}>
                  Potted in organic nutrient-rich soil mix at our Cheediga nursery. Safe local delivery across Kakinada.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Specs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-green">{product.category}</span>
                  {product.plantType && (
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px' }}>
                      {product.plantType}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                  {product.name}
                </h2>
                {product.botanicalName && (
                  <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.88rem', margin: '0 0 10px 0' }}>
                    {product.botanicalName}
                  </p>
                )}
              </div>

              <button
                className="action-btn"
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '50%' }}
                onClick={() => onToggleWishlist(product)}
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? '#dc2626' : 'none'} color={isWishlisted ? '#dc2626' : 'currentColor'} />
              </button>
            </div>

            {/* Pricing Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '12px 0 16px 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>
                ₹{finalPrice * quantity}
              </span>
              {originalPrice > finalPrice && (
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{originalPrice * quantity}
                </span>
              )}
              {discount > 0 && (
                <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px' }}>
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              {product.description}
            </p>

            {/* Plant Dimension Specifications Card */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#1e293b', fontWeight: 700 }}>
                📏 Plant & Pot Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Size</span>
                  <strong>{currentSize}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Height</span>
                  <strong>{currentHeight}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Pot Size</span>
                  <strong>{currentPot}</strong>
                </div>
              </div>
            </div>

            {/* Multi-Size Variant Selector (if defined) */}
            {sizes && sizes.length > 1 && (
              <div style={{ marginBottom: '18px' }}>
                <strong style={{ fontSize: '0.86rem', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Choose Size Variant:
                </strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sizes.map((s, idx) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSizeIdx(idx)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: selectedSizeIdx === idx ? '2px solid #166534' : '1px solid #cbd5e1',
                        background: selectedSizeIdx === idx ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#166534' }}>{s.size}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{s.finalPrice || s.price} • {s.height}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability */}
            <div style={{ fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isOutOfStock ? (
                <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={15} /> Out of Stock ({currentSize})
                </span>
              ) : (
                <span style={{ color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> In Stock ({currentStock} available in Cheediga nursery)
                </span>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="cart-qty-counter" style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="cart-qty-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 6px' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                <button 
                  className="cart-qty-btn" 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 6px' }}
                >
                  +
                </button>
              </div>

              <button
                id="modal-add-to-cart-btn"
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', background: '#166534', color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                disabled={isOutOfStock}
                onClick={handleAdd}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Sold Out' : 'ADD TO CART'}</span>
              </button>

              <button
                id="modal-buy-now-btn"
                className="btn"
                style={{ flex: 1, padding: '12px', background: '#ea580c', color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                disabled={isOutOfStock}
                onClick={handleBuy}
              >
                <Zap size={18} />
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Care Instructions & Requirements */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#166534', fontWeight: 700 }}>
                🌿 Plant Care & Sunlight Requirements
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#fefce8', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ca8a04', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <Sun size={15} />
                    <span>Sunlight Requirement</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#854d0e' }}>
                    {product.sunlight || 'Bright Indirect Sunlight'}
                  </p>
                </div>

                <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <Droplet size={15} />
                    <span>Water Requirement</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#075985' }}>
                    {product.waterRequirement || product.water || 'Water when top 1-2 inches dry'}
                  </p>
                </div>
              </div>

              {product.careInstructions && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                  <strong>Care Instructions:</strong> {product.careInstructions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
