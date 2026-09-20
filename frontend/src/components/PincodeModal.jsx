import React, { useState } from 'react';
import { X, MapPin, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { calculateDelivery } from '../api';

export default function PincodeModal({ isOpen, onClose, currentPincode, onSelectPincode }) {
  const [pincodeInput, setPincodeInput] = useState(currentPincode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const quickPincodes = [
    { name: 'Kakinada Main', pin: '533001' },
    { name: 'Bhanugudi', pin: '533003' },
    { name: 'Sarpavaram', pin: '533005' },
    { name: 'Samalkota', pin: '533440' },
    { name: 'Peddapuram', pin: '533437' },
    { name: 'Rajahmundry', pin: '533101' }
  ];

  const handleCheck = async (pinToCheck) => {
    const pin = pinToCheck || pincodeInput;
    if (!pin || pin.length < 6) return;

    setLoading(true);
    try {
      const data = await calculateDelivery(pin, 500, false);
      setResult(data);
      if (data.available) {
        onSelectPincode(pin, data);
      }
    } catch (err) {
      console.error(err);
      setResult({ available: false, message: 'Could not verify pincode. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="pincode-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-card" 
        style={{ maxWidth: '520px', padding: '28px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} id="close-pincode-modal">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#EBF7EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#143D2D'
          }}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Select Delivery Location</h3>
            <p style={{ fontSize: '0.84rem', color: '#71847A' }}>
              Check delivery availability & transportation charges directly from our nursery
            </p>
          </div>
        </div>

        <div style={{ margin: '22px 0 16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              id="pincode-modal-input"
              className="form-input"
              placeholder="Enter 6-digit Pincode (e.g. 533001)"
              value={pincodeInput}
              maxLength={6}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
            <button
              id="check-pincode-btn"
              className="btn btn-primary"
              disabled={loading || pincodeInput.length < 6}
              onClick={() => handleCheck()}
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>

        {/* Quick Area Chips */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: '#71847A', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Popular Nursery Delivery Hubs:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickPincodes.map(item => (
              <button
                key={item.pin}
                className="bot-chip-btn"
                onClick={() => {
                  setPincodeInput(item.pin);
                  handleCheck(item.pin);
                }}
              >
                {item.name} ({item.pin})
              </button>
            ))}
          </div>
        </div>

        {/* Result Showcase */}
        {result && (
          <div 
            className={`pincode-result-box ${result.available ? 'pincode-result-success' : 'pincode-result-error'}`}
            style={{ padding: '16px', borderRadius: '12px' }}
          >
            {result.available ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.96rem', color: '#0C2C20' }}>
                  <CheckCircle size={18} color="#1E8E3E" />
                  <span>✓ Delivery Available to {result.area}!</span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#2A3830', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span>🚚 <strong>Transportation Charge:</strong> ₹{result.baseCharge} ({result.distanceKm} km from GreenNest nursery)</span>
                  <span>⏱️ <strong>Estimated Arrival:</strong> {result.estimatedDays}</span>
                  <span style={{ color: '#1B523A', fontWeight: 600, marginTop: '4px' }}>
                    🌿 Free Delivery unlocks on orders above ₹{result.freeDeliveryThreshold || 999}!
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={onClose}
                >
                  Apply & Continue Shopping
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={18} color="#D93025" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#900', display: 'block' }}>Delivery Unavailable</strong>
                  <span style={{ fontSize: '0.84rem', color: '#555' }}>
                    {result.message || 'Sorry, delivery is currently unavailable for this pincode.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
