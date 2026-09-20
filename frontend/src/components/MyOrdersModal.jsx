import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight,
  Eye,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { fetchMyOrders, cancelOrder } from '../api';

export default function MyOrdersModal({ 
  isOpen, 
  onClose, 
  customer, 
  onOpenAuth 
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For Order Details modal

  // Cancellation state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (customer) {
        if (customer.id || customer._id) params.customerId = customer.id || customer._id;
        if (customer.phone) params.phone = customer.phone;
        if (customer.email) params.email = customer.email;
      }
      const res = await fetchMyOrders(params);
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setError(res.message || 'Failed to load order history.');
      }
    } catch (err) {
      setError('Error connecting to nursery server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const isEligibleForCancellation = (status) => {
    return ['Order Placed', 'Confirmed', 'Processing'].includes(status);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!orderToCancel) return;

    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    if (!finalReason.trim()) {
      setCancelError('Please select or specify a reason for cancellation.');
      return;
    }

    setCancelling(true);
    setCancelError('');

    try {
      const id = orderToCancel.orderNumber || orderToCancel._id || orderToCancel.id;
      const res = await cancelOrder(id, finalReason);
      if (res.success) {
        // Update state locally
        setOrders(prev => prev.map(o => {
          if ((o.orderNumber || o._id) === id) {
            return {
              ...o,
              status: 'Cancelled',
              cancellationReason: finalReason,
              cancellationDate: new Date().toISOString()
            };
          }
          return o;
        }));

        if (selectedOrder && (selectedOrder.orderNumber || selectedOrder._id) === id) {
          setSelectedOrder(prev => ({
            ...prev,
            status: 'Cancelled',
            cancellationReason: finalReason,
            cancellationDate: new Date().toISOString()
          }));
        }

        setOrderToCancel(null);
        setCustomReason('');
      } else {
        setCancelError(res.message || 'Failed to cancel order.');
      }
    } catch (err) {
      setCancelError('Error processing order cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      case 'Out for Delivery': return { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' };
      case 'Processing':
      case 'Packed': return { bg: '#fef3c7', text: '#854d0e', border: '#fde047' };
      case 'Confirmed': return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '94%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '10px', color: '#166534' }}>
              <Package size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#166534', fontWeight: 800 }}>
                My Orders — Ganapathi Gardens
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                View separate order cards, check delivery progress & manage cancellations
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={loadOrders} 
              title="Refresh Orders"
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Not Logged In Banner */}
        {!customer && (
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.86rem', color: '#854d0e' }}>
              💡 Viewing sample orders. <strong>Log in</strong> to view orders placed with your phone or email!
            </div>
            <button
              type="button"
              onClick={() => { onClose(); onOpenAuth(); }}
              style={{ background: '#166534', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Customer Login
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
            <p>Loading your orders from Ganapathi Gardens nursery database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
            <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 6px 0' }}>No orders placed yet</h4>
            <p style={{ fontSize: '0.88rem', margin: '0 0 16px 0' }}>
              Pick healthy plants from our catalog and get them delivered to your home in Kakinada!
            </p>
            <button 
              onClick={onClose}
              style={{ background: '#166534', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Explore Plants Catalog
            </button>
          </div>
        ) : (
          /* Separate cards for each order */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const isCancellable = isEligibleForCancellation(order.status);

              return (
                <div 
                  key={order.orderNumber || order._id || order.id}
                  id={`order-card-${order.orderNumber}`}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {/* Card Header: Order Number, Date & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534' }}>
                          ORDER #{order.orderNumber || 'GG1001'}
                        </span>
                        <span style={{
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {order.status}
                        </span>
                        {order.paymentMethod && (
                          <span style={{
                            background: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef9c3',
                            color: order.paymentStatus === 'Paid' ? '#166534' : '#854d0e',
                            border: `1px solid ${order.paymentStatus === 'Paid' ? '#bbf7d0' : '#fef08a'}`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {order.paymentStatus === 'Paid' ? '💳 Paid Online' : '💵 COD'}
                            {order.transactionId ? ` • ${order.transactionId}` : ''}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Calendar size={13} />
                        Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Order Total</span>
                      <strong style={{ fontSize: '1.3rem', color: '#166534' }}>
                        ₹{order.totalAmount || order.total}
                      </strong>
                    </div>
                  </div>

                  {/* Products in this order */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                    {(order.products || order.items || []).map((prod, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <img 
                          src={prod.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'} 
                          alt={prod.name} 
                          style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a', fontWeight: 700 }}>
                            {prod.name}
                          </h4>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            Size: <strong>{prod.size || 'Medium'}</strong> {prod.height ? `(${prod.height})` : ''} • Qty: <strong>{prod.quantity}</strong>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                            Price: <strong>₹{prod.price} × {prod.quantity}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial & Delivery Summary Strip */}
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span>Subtotal: <strong>₹{order.subtotal}</strong></span>
                      {order.discount > 0 && <span style={{ marginLeft: '12px', color: '#16a34a' }}>Discount: <strong>-₹{order.discount}</strong></span>}
                      <span style={{ marginLeft: '12px' }}>Transport Charge: <strong>₹{order.transportCharge || 0}</strong></span>
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>
                      Total Paid/Payable: ₹{order.totalAmount || order.total}
                    </div>
                  </div>

                  {/* Cancellation Reason alert if cancelled */}
                  {order.status === 'Cancelled' && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#991b1b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={15} />
                      <span><strong>Order Cancelled.</strong> Reason: {order.cancellationReason || 'Requested by customer'}</span>
                    </div>
                  )}

                  {/* Action Buttons: VIEW ORDER DETAILS & CANCEL ORDER */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isCancellable && (
                      <button
                        onClick={() => { setOrderToCancel(order); setCancelError(''); }}
                        style={{
                          background: '#fff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <XCircle size={15} />
                        <span>CANCEL ORDER</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        background: '#166534',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={15} />
                      <span>VIEW ORDER DETAILS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* SUB-MODAL 1: ORDER DETAILS VIEW */}
        {/* --------------------------------------------- */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)} style={{ zIndex: 10000 }}>
            <div 
              className="modal-content-card" 
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '640px', width: '92%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '16px', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#166534', fontWeight: 800 }}>
                    Order Details: #{selectedOrder.orderNumber}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Status: <strong style={{ color: '#166534' }}>{selectedOrder.status}</strong>
                  </span>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Delivery Address & Customer Info */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.84rem' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#1e293b' }}>
                  📍 Customer & Shipping Address
                </h4>
                <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div><strong>Mobile:</strong> {selectedOrder.phone}</div>
                {selectedOrder.email && <div><strong>Email:</strong> {selectedOrder.email}</div>}
                <div><strong>Delivery Address:</strong> {selectedOrder.address}, {selectedOrder.area}, {selectedOrder.city} - {selectedOrder.pincode}</div>
              </div>

              {/* Ordered Products Table */}
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#1e293b' }}>
                🌿 Plant Items in this Order:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {(selectedOrder.products || selectedOrder.items || []).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Size: {p.size} {p.height ? `(${p.height})` : ''} • Pot: {p.potSize || 'Standard'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>₹{p.price} × {p.quantity}</span>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: '#166534' }}>₹{p.price * p.quantity}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Product Subtotal:</span><strong>₹{selectedOrder.subtotal}</strong>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount:</span><strong>-₹{selectedOrder.discount}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Transport/Delivery Charge:</span><strong>₹{selectedOrder.transportCharge || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #cbd5e1', paddingTop: '8px', marginTop: '4px', fontSize: '1.1rem', color: '#166534', fontWeight: 800 }}>
                  <span>Final Total Amount:</span><span>₹{selectedOrder.totalAmount || selectedOrder.total}</span>
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {isEligibleForCancellation(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      setOrderToCancel(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: '#166534', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* SUB-MODAL 2: CANCEL ORDER CONFIRMATION POPUP */}
        {/* --------------------------------------------- */}
        {orderToCancel && (
          <div className="modal-overlay" onClick={() => setOrderToCancel(null)} style={{ zIndex: 10001 }}>
            <div 
              className="modal-content-card" 
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '480px', width: '92%', borderRadius: '16px', padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '14px' }}>
                <AlertTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Cancel Order #{orderToCancel.orderNumber}?</h3>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Are you sure you want to cancel this order? Once cancelled, the plants will be returned to nursery inventory.
              </p>

              {cancelError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '8px', color: '#b91c1c', fontSize: '0.82rem', marginBottom: '12px' }}>
                  {cancelError}
                </div>
              )}

              <form onSubmit={handleConfirmCancel}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Reason for Cancellation *
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Need to change delivery location">Need to change delivery location</option>
                    <option value="Decided to visit nursery in person">Decided to visit Cheediga nursery in person</option>
                    <option value="Changed mind / Not needed now">Changed mind / Not needed now</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Please specify reason *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Explain reason for cancellation..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setOrderToCancel(null)}
                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling}
                    style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
