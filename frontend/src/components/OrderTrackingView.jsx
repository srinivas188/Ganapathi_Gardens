import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  Camera, 
  Calendar 
} from 'lucide-react';
import { trackOrder } from '../api';

export default function OrderTrackingView({ initialOrderId }) {
  const [orderInput, setOrderInput] = useState(initialOrderId || 'GN10245');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrderDetails = async (idToTrack) => {
    const id = (idToTrack || orderInput).trim().replace('#', '');
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const res = await trackOrder(id);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message || `Could not find Order #${id}`);
        setOrder(null);
      }
    } catch (err) {
      setError('Unable to fetch order tracking status. Please check your connection.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderInput(initialOrderId);
      fetchOrderDetails(initialOrderId);
    } else {
      fetchOrderDetails('GN10245'); // seed demo order
    }
  }, [initialOrderId]);

  const stages = ['Order Placed', 'Confirmed', 'Preparing Plant', 'Packed', 'Out for Delivery', 'Delivered'];

  const getStageIndex = (status) => {
    const idx = stages.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div className="container tracking-wrapper" id="order-tracking-view">
      {/* Title & Search Bar */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-green" style={{ marginBottom: '8px' }}>Live Nursery Tracking</span>
        <h2 style={{ fontSize: '2.2rem', color: '#0C2C20' }}>Track Your Plant Order 📦</h2>
        <p style={{ fontSize: '0.92rem', color: '#71847A', maxWidth: '540px', margin: '4px auto 20px' }}>
          Follow your plant's journey from nursery beds and root conditioning to doorstep delivery.
        </p>

        <form 
          onSubmit={(e) => { e.preventDefault(); fetchOrderDetails(); }}
          style={{ display: 'flex', maxWidth: '440px', margin: '0 auto', gap: '8px' }}
        >
          <input
            type="text"
            id="track-order-input"
            className="form-input"
            placeholder="Enter Order ID (e.g. GN10245)"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
          />
          <button 
            type="submit" 
            id="track-order-btn"
            className="btn btn-primary"
            disabled={loading}
          >
            <Search size={16} />
            <span>{loading ? 'Searching...' : 'Track'}</span>
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '14px', color: '#D93025', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {order && (
        <>
          {/* Main Order Overview Card */}
          <div className="tracking-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFF3F0', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Identifier:
                </span>
                <h3 style={{ fontSize: '1.4rem', color: '#0C2C20' }}>#{order.id}</h3>
                <span style={{ fontSize: '0.8rem', color: '#71847A' }}>
                  Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  Current Status: {order.status}
                </span>
                <span style={{ display: 'block', fontSize: '0.82rem', color: '#71847A', marginTop: '4px' }}>
                  Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus || 'Verified'})
                </span>
              </div>
            </div>

            {/* Visual Animated Timeline */}
            <div className="stepper-timeline" style={{ margin: '40px 0 30px' }}>
              {stages.map((st, i) => {
                const currentIdx = getStageIndex(order.status);
                const isDone = i <= currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <div 
                    key={st} 
                    className={`step-node ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
                    style={{ flex: 1 }}
                  >
                    <div className="step-icon-circle">
                      {isDone ? <CheckCircle size={18} /> : (i + 1)}
                    </div>
                    <span className="step-title">{st}</span>
                    <span className="step-time">
                      {isCurrent ? 'Current' : (isDone ? 'Done' : 'Upcoming')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Customer & Delivery Information Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              padding: '18px',
              background: '#F8FAF8',
              borderRadius: '16px',
              border: '1px solid #DDE7E1',
              marginTop: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>Customer</span>
                <strong style={{ display: 'block', color: '#0C2C20', fontSize: '0.94rem' }}>{order.customer?.name}</strong>
                <span style={{ fontSize: '0.82rem', color: '#475850' }}>{order.customer?.phone}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>Delivery Location</span>
                <strong style={{ display: 'block', color: '#0C2C20', fontSize: '0.94rem' }}>{order.customer?.city} ({order.customer?.pincode})</strong>
                <span style={{ fontSize: '0.82rem', color: '#475850' }}>{order.customer?.address}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>Total Order Value</span>
                <strong style={{ display: 'block', color: '#0C2C20', fontSize: '1.2rem' }}>₹{order.total}</strong>
                <span style={{ fontSize: '0.78rem', color: '#1E8E3E', fontWeight: 600 }}>
                  🚚 Transportation: ₹{order.transportation}
                </span>
              </div>
            </div>
          </div>

          {/* 32. PLANT HEALTH GUARANTEE TRUST SHOWCASE */}
          {order.preDispatchPhoto && (
            <div className="health-guarantee-box" id="plant-health-guarantee-card">
              <div className="health-guarantee-grid">
                <div>
                  <img 
                    src={order.preDispatchPhoto.url} 
                    alt="Pre-dispatch actual plant" 
                    className="dispatch-actual-photo"
                  />
                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                      📸 Actual Plant Photo
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck size={26} color="#56D692" />
                    <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: 0 }}>
                      Your Plant Before Shipping 🌿
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#D6E4DB', lineHeight: 1.5, marginBottom: '14px' }}>
                    Unlike ordinary websites, GreenNest Nursery physically inspects and photographs your actual potted plants prior to dispatch.
                  </p>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.84rem'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Health Check Report:</strong> {order.preDispatchPhoto.healthCheck}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#A0B9AB', display: 'flex', gap: '16px' }}>
                      <span>Verified by: <strong>{order.preDispatchPhoto.inspectedBy}</strong></span>
                      <span>Date: <strong>{new Date(order.preDispatchPhoto.inspectedAt).toLocaleDateString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ordered Plants Breakdown */}
          <div className="tracking-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Plants in this Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px',
                    background: '#F8FAF8',
                    borderRadius: '12px',
                    border: '1px solid #DDE7E1'
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '68px', height: '68px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#1B523A', fontWeight: 600 }}>
                      Plant Size: <strong>{item.size}</strong> ({item.height}) • {item.pot}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#71847A' }}>
                      Quantity: {item.quantity} unit(s)
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: '#0C2C20' }}>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
