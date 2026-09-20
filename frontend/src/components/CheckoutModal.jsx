import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Lock, 
  Truck, 
  ArrowRight, 
  User, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { placeOrder } from '../api';
import FakePaymentGateway from './FakePaymentGateway';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  customer,
  onRequireAuth,
  selectedArea = 'Kakinada City',
  onSelectArea,
  deliveryAreas = [],
  coupon, 
  onOrderSuccess 
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    area: selectedArea || 'Kakinada City',
    city: customer?.city || 'Kakinada',
    state: customer?.state || 'Andhra Pradesh',
    pincode: customer?.pincode || '533006'
  });

  const [paymentMethod, setPaymentMethod] = useState('Online Payment');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || prev.name,
        phone: customer.phone || prev.phone,
        email: customer.email || prev.email,
        address: customer.address || prev.address,
        city: customer.city || prev.city,
        state: customer.state || prev.state,
        pincode: customer.pincode || prev.pincode
      }));
    }
  }, [customer]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
  const productDiscount = Math.max(0, totalOriginal - subtotal);
  const couponDiscount = coupon?.discount || 0;
  const totalDiscount = productDiscount + couponDiscount;

  const areaTier = deliveryAreas.find(a => a.name === formData.area) || { name: 'Kakinada City', charge: 50 };
  const transportCharge = areaTier.charge !== undefined ? areaTier.charge : 50;
  const finalTotal = Math.max(0, subtotal + transportCharge - couponDiscount);

  const handleAreaChange = (areaName) => {
    setFormData(prev => ({ ...prev, area: areaName }));
    if (onSelectArea) onSelectArea(areaName);
  };

  // Main order submission logic
  const finalizeOrderSubmission = async (paymentOverrides = {}) => {
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        customerId: customer.id || customer._id,
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        products: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          size: item.size,
          height: item.height || '',
          potSize: item.potSize || item.pot || '',
          price: item.price,
          originalPrice: item.originalPrice || item.price,
          discount: item.discount || 0,
          finalPrice: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        discount: totalDiscount,
        couponCode: coupon?.code || '',
        transportCharge,
        totalAmount: finalTotal,
        paymentMethod: paymentOverrides.paymentMethod || paymentMethod,
        paymentStatus: paymentOverrides.paymentStatus || 'Pending',
        transactionId: paymentOverrides.transactionId || ''
      };

      const res = await placeOrder(orderPayload);
      if (res.success && res.order) {
        // Direct Client-Side Web3Forms Email Dispatch to Admin
        try {
          const plantsList = (orderPayload.products || []).map((p, idx) => 
            `${idx + 1}. ${p.name} (${p.size || 'Medium'}, ${p.potSize || 'Pot'}) x ${p.quantity} = ₹${p.price * p.quantity}`
          ).join('\n');

          const isOnlinePaid = orderPayload.paymentStatus === 'Paid';
          const web3Payload = {
            access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'e076f4a2-cd61-46db-a3bb-33a5893527af',
            subject: `🌱 New Order Alert: #${res.order.orderNumber} (₹${res.order.totalAmount}) - ${formData.name} [${isOnlinePaid ? 'PAID ONLINE' : 'CASH ON DELIVERY'}]`,
            from_name: 'Ganapathi Gardens Nursery',
            name: formData.name,
            email: formData.email || 'orders@ganapathigardens.com',
            phone: formData.phone,
            'Order Number': `#${res.order.orderNumber}`,
            'Customer Name': formData.name,
            'Customer Mobile': formData.phone,
            'Customer Email': formData.email || 'N/A',
            'Delivery Address': `${formData.address}, ${formData.area || 'Kakinada City'}, ${formData.city} - ${formData.pincode}`,
            'Ordered Plants': plantsList,
            'Payment Method': orderPayload.paymentMethod,
            'Payment Status': orderPayload.paymentStatus,
            'Transaction ID': orderPayload.transactionId || 'N/A (Cash on Delivery)',
            'Subtotal': `₹${subtotal}`,
            'Transport Charge': `₹${transportCharge}`,
            'Grand Total': `₹${finalTotal}`,
            message: `New plant order received on Ganapathi Gardens!\n\nOrder ID: #${res.order.orderNumber}\nPayment: ${orderPayload.paymentMethod} (${orderPayload.paymentStatus})\nTransaction ID: ${orderPayload.transactionId || 'COD'}\nCustomer: ${formData.name} (Phone: ${formData.phone})\nTotal: ₹${finalTotal}\nAddress: ${formData.address}, ${formData.area || 'Kakinada'}, ${formData.city} - ${formData.pincode}\n\nOrdered Plants:\n${plantsList}\n\nManage in Admin Portal: http://localhost:3000/#admin`
          };

          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(web3Payload)
          })
          .then(r => r.json())
          .then(wData => console.log('📧 [Web3Forms Email Result]:', wData))
          .catch(wErr => console.warn('Web3Forms dispatch warning:', wErr));
        } catch (mailErr) {
          console.warn('Mail dispatch error:', mailErr);
        }

        // Confetti celebration
        try {
          confetti({
            particleCount: 140,
            spread: 85,
            origin: { y: 0.6 }
          });
        } catch (cErr) {}

        setIsGatewayOpen(false);
        onOrderSuccess(res.order);
      } else {
        setError(res.message || 'Could not place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Server communication error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Called when user clicks Place Order in checkout form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer) {
      onRequireAuth('Please log in or create an account to finalize your nursery order.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      setError('Please fill in your name, contact phone, complete address, and pincode.');
      return;
    }

    setError('');

    // If customer selected online payment, launch the fake/demo payment gateway!
    if (paymentMethod === 'Online Payment') {
      setIsGatewayOpen(true);
      return;
    }

    // Cash on Delivery: submit directly
    await finalizeOrderSubmission({
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      transactionId: ''
    });
  };

  // Handler for successful payment from FakePaymentGateway
  const handleOnlinePaymentSuccess = async (paymentDetails) => {
    await finalizeOrderSubmission({
      paymentMethod: `Online Payment (${paymentDetails.channel || 'Prepaid UPI/Card'})`,
      paymentStatus: 'Paid',
      transactionId: paymentDetails.transactionId
    });
  };

  return (
    <>
      <div className="modal-overlay" id="checkout-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
        <div 
          className="modal-content-card" 
          id="checkout-modal" 
          style={{ maxWidth: '860px', width: '94%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px', padding: '28px' }} 
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose} id="close-checkout-modal" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #166534)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', margin: 0, color: '#166534', fontWeight: 800 }}>
                Ganapathi Gardens Safe Checkout
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Direct nursery dispatch from Cheediga, Kakinada • 100% Healthy Plant Guarantee
              </p>
            </div>
          </div>

          {/* Authentication Notice if not logged in */}
          {!customer && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#854d0e', fontSize: '0.86rem' }}>
                <AlertCircle size={18} />
                <span><strong>Login Required:</strong> Only authenticated customers can place orders.</span>
              </div>
              <button
                type="button"
                onClick={() => onRequireAuth('Please log in or sign up to finalize your plant order.')}
                style={{ background: '#166534', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In / Register
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Left Column: Delivery & Payment Details */}
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 700 }}>
                  <Truck size={17} color="#166534" />
                  <span>1. Delivery Destination</span>
                </h3>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email (For Order Updates)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. you@gmail.com"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Delivery Address (Street, House No, Landmark) *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Provide full door address for accurate nursery van dispatch"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Delivery Area / Zone (Kakinada & Surroundings) *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#f8fafc' }}
                  >
                    {(deliveryAreas.length > 0 ? deliveryAreas : [
                      { name: 'Kakinada City', charge: 50 },
                      { name: 'Nearby Area', charge: 80 },
                      { name: 'Other Area', charge: 120 }
                    ]).map(tier => (
                      <option key={tier.name} value={tier.name}>
                        {tier.name} — Transport: ₹{tier.charge}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <h3 style={{ fontSize: '1.05rem', margin: '18px 0 10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 700 }}>
                  <CreditCard size={17} color="#166534" />
                  <span>2. Payment Option</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { 
                      id: 'Online Payment', 
                      label: 'Online Payment', 
                      subtitle: 'UPI, GPay, PhonePe, Cards, NetBanking',
                      badge: 'Demo Sandbox Gateway',
                      icon: <CreditCard size={20} /> 
                    },
                    { 
                      id: 'Cash on Delivery', 
                      label: 'Cash on Delivery', 
                      subtitle: 'Pay when plants arrive at doorstep',
                      badge: '',
                      icon: <Banknote size={20} /> 
                    }
                  ].map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        border: paymentMethod === pm.id ? '2px solid #166534' : '1.5px solid #cbd5e1',
                        background: paymentMethod === pm.id ? '#f0fdf4' : '#ffffff',
                        color: paymentMethod === pm.id ? '#166534' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pm.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '8px',
                          background: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Sparkles size={10} />
                          <span>{pm.badge}</span>
                        </span>
                      )}
                      <div style={{ marginBottom: '4px', color: paymentMethod === pm.id ? '#166534' : '#64748b' }}>
                        {pm.icon}
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{pm.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{pm.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 12px 0', color: '#166534', fontWeight: 700 }}>
                  Order Summary
                </h3>

                {/* Items list */}
                <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                  {cartItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                      <div>
                        <strong>{item.quantity} × {item.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b' }}>
                          {item.size} • {item.potSize || item.pot || 'Nursery Pot'}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#166534' }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Calculation Breakdown */}
                <div style={{ fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Product Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                      <span>Discount:</span>
                      <span>-₹{totalDiscount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Transport / Delivery Charge ({formData.area}):</span>
                    <span>₹{transportCharge}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1.5px solid #cbd5e1',
                    paddingTop: '10px',
                    marginTop: '4px',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#166534'
                  }}>
                    <span>Final Total:</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                {/* Plant Health Assurance */}
                <div style={{
                  marginTop: '16px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  gap: '8px',
                  fontSize: '0.76rem',
                  color: '#14532d'
                }}>
                  <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Nursery Fresh Guarantee:</strong> Healthy, pest-free plants nurtured with love at Ganapathi Gardens.
                  </span>
                </div>

                <button
                  type="submit"
                  id="place-order-submit-btn"
                  className="btn btn-primary"
                  style={{
                    marginTop: '18px',
                    width: '100%',
                    padding: '13px',
                    background: '#166534',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  disabled={loading}
                >
                  <span>
                    {loading 
                      ? 'Submitting Order to Nursery...' 
                      : paymentMethod === 'Online Payment'
                      ? `Proceed to Online Payment • ₹${finalTotal}`
                      : `Place Order (COD) • ₹${finalTotal}`
                    }
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Fake / Sandbox Payment Gateway */}
      <FakePaymentGateway
        isOpen={isGatewayOpen}
        amount={finalTotal}
        orderInfo={{
          customerName: formData.name,
          phone: formData.phone,
          itemsCount: cartItems.length
        }}
        onSuccess={handleOnlinePaymentSuccess}
        onCancel={() => setIsGatewayOpen(false)}
      />
    </>
  );
}
