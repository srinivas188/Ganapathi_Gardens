import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCw, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function FakePaymentGateway({
  isOpen,
  amount,
  orderInfo,
  onSuccess,
  onCancel
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiMethod, setUpiMethod] = useState('qr'); // 'qr' | 'apps' | 'id'
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Card state
  const [cardData, setCardData] = useState({
    number: '',
    name: orderInfo?.customerName || '',
    expiry: '',
    cvv: ''
  });

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Flow states
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed'
  const [processingStep, setProcessingStep] = useState(1);
  const [failureReason, setFailureReason] = useState('');
  const [timeLeft, setTimeLeft] = useState(599); // 10 minute countdown for demo QR

  // Countdown timer for demo QR
  useEffect(() => {
    if (processingState !== 'idle') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [processingState]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Quick fill test card
  const handleAutoFillTestCard = () => {
    setCardData({
      number: '4532 8901 3245 7718',
      name: orderInfo?.customerName || 'Pavan Santhosh',
      expiry: '09/29',
      cvv: '654'
    });
  };

  // Simulate payment processing flow
  const triggerSimulation = (isSuccessful = true, channelName = '') => {
    setProcessingState('processing');
    setProcessingStep(1);

    // Step 1: Banking handshake (500ms)
    setTimeout(() => {
      setProcessingStep(2);
    }, 600);

    // Step 2: Verification (1200ms)
    setTimeout(() => {
      setProcessingStep(3);
    }, 1200);

    // Final outcome (1800ms)
    setTimeout(() => {
      if (isSuccessful) {
        setProcessingState('success');
        const txnId = 'TXN_GG_' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 899 + 100);
        
        setTimeout(() => {
          onSuccess({
            transactionId: txnId,
            method: activeTab.toUpperCase(),
            channel: channelName || activeTab,
            amount,
            paidAt: new Date().toISOString()
          });
        }, 1200);
      } else {
        setProcessingState('failed');
        setFailureReason('Bank server timed out or demo payment rejected. You can retry with 1-Click success simulation.');
      }
    }, 1800);
  };

  return (
    <div 
      className="modal-overlay" 
      id="fake-payment-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-content-card" 
        id="fake-payment-modal"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '680px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sandbox Indicator Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#ffffff',
          padding: '6px 14px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>SANDBOX DEMO PAYMENT GATEWAY (SIMULATED MODE)</span>
          </div>
          <span style={{ opacity: 0.9, fontSize: '0.7rem' }}>No Real Money Charged</span>
        </div>

        {/* Modal Header */}
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem'
              }}>
                🌱
              </div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                Ganapathi Gardens Nursery
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 40px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={12} color="#10b981" />
              <span>256-Bit SSL Encrypted Payment Sandbox</span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Amount to Pay</span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>₹{amount}</span>
          </div>
        </div>

        {/* PROCESSING OVERLAY SCREEN */}
        {processingState === 'processing' && (
          <div style={{
            padding: '50px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px'
          }}>
            <div style={{ position: 'relative', width: '70px', height: '70px', marginBottom: '24px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid #e2e8f0',
                borderTopColor: '#16a34a',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#16a34a'
              }}>
                <Lock size={24} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, margin: '0 0 8px 0' }}>
              Processing Payment of ₹{amount}...
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, maxWidth: '380px' }}>
              Communicating securely with the bank simulation gateway. Please do not refresh or close this window.
            </p>

            <div style={{ marginTop: '24px', width: '100%', maxWidth: '320px', textAlign: 'left', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: processingStep >= 1 ? '#166534' : '#94a3b8', marginBottom: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: processingStep >= 1 ? '#16a34a' : '#cbd5e1' }} />
                <span>Handshake with Banking Network</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: processingStep >= 2 ? '#166534' : '#94a3b8', marginBottom: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: processingStep >= 2 ? '#16a34a' : '#cbd5e1' }} />
                <span>Simulating OTP & 2FA Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: processingStep >= 3 ? '#166534' : '#94a3b8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: processingStep >= 3 ? '#16a34a' : '#cbd5e1' }} />
                <span>Settling funds to Ganapathi Gardens</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS OVERLAY SCREEN */}
        {processingState === 'success' && (
          <div style={{
            padding: '50px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#166534', fontWeight: 800, margin: '0 0 6px 0' }}>
              Payment Successful!
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
              ₹{amount} paid securely via Sandbox Gateway
            </p>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              color: '#166534',
              fontWeight: 600
            }}>
              Redirecting to Order Confirmation...
            </div>
          </div>
        )}

        {/* FAILED OVERLAY SCREEN */}
        {processingState === 'failed' && (
          <div style={{
            padding: '40px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#991b1b', fontWeight: 800, margin: '0 0 6px 0' }}>
              Simulation: Transaction Declined
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', margin: '0 0 20px 0' }}>
              {failureReason}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setProcessingState('idle')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Back to Methods
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation(true, 'Retry Instant')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCw size={15} />
                <span>Retry (Simulate Success)</span>
              </button>
            </div>
          </div>
        )}

        {/* MAIN PAYMENT FORM */}
        {processingState === 'idle' && (
          <div style={{ display: 'flex', minHeight: '390px' }}>
            {/* Left Nav Tabs */}
            <div style={{
              width: '190px',
              background: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {[
                { id: 'upi', label: 'UPI / QR Code', icon: <QrCode size={17} /> },
                { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={17} /> },
                { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={17} /> },
                { id: 'wallet', label: 'Wallets', icon: <Wallet size={17} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '11px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab.id ? '#166534' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}

              <div style={{ marginTop: 'auto', padding: '12px 6px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <span>Verified Merchant</span>
                </div>
              </div>
            </div>

            {/* Right Tab Content */}
            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
              
              {/* TAB 1: UPI & QR CODE */}
              {activeTab === 'upi' && (
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('qr')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: upiMethod === 'qr' ? '1.5px solid #166534' : '1px solid #cbd5e1',
                        background: upiMethod === 'qr' ? '#f0fdf4' : '#ffffff',
                        color: upiMethod === 'qr' ? '#166534' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      Scan QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('apps')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: upiMethod === 'apps' ? '1.5px solid #166534' : '1px solid #cbd5e1',
                        background: upiMethod === 'apps' ? '#f0fdf4' : '#ffffff',
                        color: upiMethod === 'apps' ? '#166534' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      UPI Apps (GPay, PhonePe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('id')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: upiMethod === 'id' ? '1.5px solid #166534' : '1px solid #cbd5e1',
                        background: upiMethod === 'id' ? '#f0fdf4' : '#ffffff',
                        color: upiMethod === 'id' ? '#166534' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      UPI ID
                    </button>
                  </div>

                  {upiMethod === 'qr' && (
                    <div style={{ textAlign: 'center', padding: '6px 0' }}>
                      <div style={{
                        width: '160px',
                        height: '160px',
                        margin: '0 auto 12px auto',
                        background: '#ffffff',
                        border: '2px solid #166534',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {/* Dynamic SVG QR Pattern */}
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <rect width="100" height="100" fill="#ffffff" />
                          {/* Corner squares */}
                          <rect x="5" y="5" width="26" height="26" fill="#0f172a" />
                          <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
                          <rect x="13" y="13" width="10" height="10" fill="#166534" />

                          <rect x="69" y="5" width="26" height="26" fill="#0f172a" />
                          <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
                          <rect x="77" y="13" width="10" height="10" fill="#166534" />

                          <rect x="5" y="69" width="26" height="26" fill="#0f172a" />
                          <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
                          <rect x="13" y="77" width="10" height="10" fill="#166534" />

                          {/* Data points */}
                          <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                          <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                          <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                          <rect x="36" y="18" width="6" height="6" fill="#166534" />
                          <rect x="46" y="18" width="6" height="6" fill="#0f172a" />
                          <rect x="56" y="18" width="6" height="6" fill="#166534" />
                          <rect x="36" y="28" width="6" height="6" fill="#0f172a" />
                          <rect x="8" y="36" width="6" height="6" fill="#0f172a" />
                          <rect x="18" y="36" width="6" height="6" fill="#0f172a" />
                          <rect x="28" y="36" width="6" height="6" fill="#166534" />
                          <rect x="38" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="38" width="6" height="6" fill="#166534" />
                          <rect x="58" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="78" y="38" width="6" height="6" fill="#166534" />
                          <rect x="88" y="38" width="6" height="6" fill="#0f172a" />

                          {/* Center Plant Emblem */}
                          <rect x="40" y="40" width="20" height="20" rx="4" fill="#166534" />
                          <text x="50" y="55" fontSize="12" textAnchor="middle" fill="#ffffff">🌱</text>
                        </svg>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                        Scan with GPay, PhonePe, Paytm or BHIM
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                        QR Code expires in {formatTimer(timeLeft)}
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerSimulation(true, 'UPI QR Code')}
                        style={{
                          marginTop: '12px',
                          padding: '10px 24px',
                          background: '#166534',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Simulate QR Scan & Pay • ₹{amount}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {upiMethod === 'apps' && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                        Select your preferred UPI app to simulate direct in-app authorization:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'Google Pay', color: '#ea4335', badge: 'GPay', icon: '🟢' },
                          { id: 'PhonePe', color: '#5f259f', badge: 'PhonePe', icon: '🟣' },
                          { id: 'Paytm UPI', color: '#00baf2', badge: 'Paytm', icon: '🔵' },
                          { id: 'BHIM UPI', color: '#005a9c', badge: 'BHIM', icon: '🟠' }
                        ].map(app => (
                          <div
                            key={app.id}
                            onClick={() => triggerSimulation(true, app.id)}
                            style={{
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#166534'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.3rem' }}>{app.icon}</span>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{app.badge}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>1-Click Pay</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>Pay ₹{amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upiMethod === 'id' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Enter Virtual Payment Address (UPI ID)
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        <input
                          type="text"
                          placeholder="e.g. yourname@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setUpiId((orderInfo?.customerName || 'customer').toLowerCase().replace(/\s+/g, '') + '@okhdfcbank')}
                          style={{
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          Auto-Fill
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerSimulation(true, `UPI ID (${upiId || 'test@upi'})`)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#166534',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        Verify & Pay ₹{amount}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div>
                  {/* Virtual Card Graphic */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '16px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Ganapathi Gardens Nursery Card
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>VISA DEMO</span>
                    </div>

                    <div style={{ fontSize: '1.05rem', letterSpacing: '3px', fontWeight: 600, fontFamily: 'monospace', margin: '10px 0' }}>
                      {cardData.number || '•••• •••• •••• ••••'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8' }}>CARD HOLDER</span>
                        <span style={{ fontWeight: 700 }}>{cardData.name || 'YOUR NAME'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8' }}>EXPIRES</span>
                        <span style={{ fontWeight: 700 }}>{cardData.expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={handleAutoFillTestCard}
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Auto-Fill Test Visa Card</span>
                    </button>
                  </div>

                  {/* Form fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Card Number (4532 8901 3245 7718)"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="CVV"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerSimulation(true, 'Test Visa Card')}
                    style={{
                      marginTop: '14px',
                      width: '100%',
                      padding: '11px',
                      background: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Pay ₹{amount} Securely
                  </button>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                    Select your bank for demo netbanking simulation:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                      <div
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: selectedBank === bank ? '2px solid #166534' : '1px solid #cbd5e1',
                          background: selectedBank === bank ? '#f0fdf4' : '#ffffff',
                          color: selectedBank === bank ? '#166534' : '#334155',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        🏛️ {bank}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerSimulation(true, `NetBanking (${selectedBank})`)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Pay ₹{amount} via {selectedBank}
                  </button>
                </div>
              )}

              {/* TAB 4: WALLETS */}
              {activeTab === 'wallet' && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                    Select wallet to simulate payment:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'MobiKwik'].map(wallet => (
                      <div
                        key={wallet}
                        onClick={() => setSelectedWallet(wallet)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: selectedWallet === wallet ? '2px solid #166534' : '1px solid #cbd5e1',
                          background: selectedWallet === wallet ? '#f0fdf4' : '#ffffff',
                          color: selectedWallet === wallet ? '#166534' : '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span>👛</span>
                        <span>{wallet}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerSimulation(true, selectedWallet)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Pay ₹{amount} with {selectedWallet}
                  </button>
                </div>
              )}

              {/* Simulation Testing Tools Footer */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => triggerSimulation(false, 'Simulated Failure')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Test Failure Flow (Simulate Bank Decline)
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel & Return to Checkout
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
