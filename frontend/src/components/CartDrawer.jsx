import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Sparkles, 
  Plus,
  Minus
} from 'lucide-react';
import { applyCoupon } from '../api';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onProceedToCheckout,
  selectedArea,
  onSelectArea,
  deliveryAreas = [],
  coupon,
  onApplyCoupon,
  onRemoveCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  // Compute Subtotal & Savings
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const productDiscount = Math.max(0, totalOriginal - subtotal);

  // Delivery / Transport charge calculation from dynamic admin rates
  const currentAreaTier = deliveryAreas.find(a => a.name === selectedArea) || deliveryAreas[0] || { name: 'Kakinada City', charge: 50 };
  const transportCharge = currentAreaTier.charge !== undefined ? currentAreaTier.charge : 50;

  // Coupon discount
  let extraDiscount = 0;
  if (coupon) {
    extraDiscount = coupon.discount || 0;
  }
  const totalDiscount = productDiscount + extraDiscount;
  const finalTotal = Math.max(0, subtotal + transportCharge - extraDiscount);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const code = couponInput.trim().toUpperCase();
    if (code === 'MONSOON20' || code === 'GREENHOME') {
      const disc = code === 'MONSOON20' ? Math.round(subtotal * 0.2) : Math.round(subtotal * 0.1);
      onApplyCoupon({ code, discount: disc });
      setCouponSuccess(`Coupon ${code} applied successfully! Saved ₹${disc}`);
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try MONSOON20 or GREENHOME');
      setCouponSuccess('');
    }
  };

  return (
    <div className="cart-drawer-overlay" id="cart-drawer-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="cart-drawer" 
        id="cart-drawer" 
        onClick={(e) => e.stopPropagation()}
        style={{ width: '440px', maxWidth: '92%' }}
      >
        {/* Header */}
        <div className="cart-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="#166534" />
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#166534', fontWeight: 800 }}>
              Ganapathi Gardens Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="close-cart-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Nursery Guarantee Strip */}
        <div style={{ background: '#f0fdf4', padding: '10px 18px', borderBottom: '1px solid #bbf7d0', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={15} color="#16a34a" />
          <span>Carefully packed at Cheediga nursery for shock-free transit!</span>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🪴</div>
              <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 6px 0' }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Explore fresh roses, indoor greens, fruiting saplings, and gardening essentials.
              </p>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '18px', background: '#166534', color: '#fff', padding: '8px 18px', borderRadius: '8px' }}
                onClick={onClose}
              >
                Browse Plants
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item-row" key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'} 
                  alt={item.name} 
                  className="cart-item-img"
                  style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div className="cart-item-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="cart-item-title" style={{ margin: 0, fontSize: '0.96rem', color: '#0f172a', fontWeight: 700 }}>
                      {item.name}
                    </h4>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                      onClick={() => onRemoveItem(item.productId, item.size)}
                      title="Remove from Cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    Size: <strong>{item.size}</strong> {item.height ? `(${item.height})` : ''} • {item.potSize || 'Nursery Pot'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity - 1)}
                        style={{ border: 'none', background: '#f8fafc', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ padding: '2px 10px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity + 1)}
                        style={{ border: 'none', background: '#f8fafc', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#166534', fontSize: '1.05rem', display: 'block' }}>
                        ₹{item.price * item.quantity}
                      </strong>
                      {item.originalPrice > item.price && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          ₹{item.originalPrice * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Calculations */}
        {cartItems.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
            {/* Configurable Transport Charges Selection */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                <Truck size={16} />
                <span>Delivery Location (Transport Charge):</span>
              </div>
              <select
                value={selectedArea}
                onChange={(e) => onSelectArea(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}
              >
                {(deliveryAreas.length > 0 ? deliveryAreas : [
                  { name: 'Kakinada City', charge: 50 },
                  { name: 'Nearby Area', charge: 80 },
                  { name: 'Other Area', charge: 120 }
                ]).map(area => (
                  <option key={area.name} value={area.name}>
                    {area.name} → ₹{area.charge}
                  </option>
                ))}
              </select>
            </div>

            {/* Coupon Code Input */}
            <div style={{ marginBottom: '14px' }}>
              {coupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px dashed #86efac', padding: '7px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 600 }}>
                    <Tag size={14} />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-₹{coupon.discount})</span>
                  </div>
                  <button
                    onClick={onRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="coupon-input"
                    className="form-input"
                    style={{ padding: '7px 10px', fontSize: '0.82rem', flex: 1, borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    placeholder="Coupon (e.g. MONSOON20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <button 
                    type="submit" 
                    id="apply-coupon-btn"
                    className="btn btn-sm"
                    style={{ background: '#166534', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{couponError}</span>}
              {couponSuccess && <span style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{couponSuccess}</span>}
            </div>

            {/* Price Breakdown */}
            <div style={{ fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Product Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {totalDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>Total Discount:</span>
                  <span>-₹{totalDiscount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transport/Delivery Charge:</span>
                <span>₹{transportCharge}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#166534'
              }}>
                <span>Final Total:</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <button
              id="checkout-proceed-btn"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', background: '#166534', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              onClick={onProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
