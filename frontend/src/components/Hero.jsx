import React, { useState } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Ruler, 
  HeartHandshake,
  Tag,
  ExternalLink
} from 'lucide-react';

export default function Hero({ onShopPlants, onViewOffers, businessInfo }) {
  const [selectedArea, setSelectedArea] = useState('tier-1');

  const deliveryOptions = [
    { id: 'tier-1', name: 'Kakinada City', charge: 50, time: 'Same Day / Next Morning', areas: 'Main Road, Bhanugudi, Collectorate, Surya Rao Peta' },
    { id: 'tier-2', name: 'Nearby Area', charge: 80, time: 'Next Day Delivery', areas: 'Indra Palem, Cheediga, Ramanayyapeta, Sarpavaram' },
    { id: 'tier-3', name: 'Other Area', charge: 120, time: '1-2 Days', areas: 'Samalkota, Pithapuram, Karapa, Peddapuram outskirts' }
  ];

  const currentOption = deliveryOptions.find(o => o.id === selectedArea) || deliveryOptions[0];

  return (
    <>
      <section className="hero-section" id="hero-section">
        <div className="hero-pattern"></div>
        <div className="container hero-grid">
          {/* Left Column */}
          <div>
            <div className="hero-badge">
              <Sparkles size={15} />
              <span>Plant Nursery & Gardening Store • Cheediga, Kakinada</span>
            </div>
            
            <h2 className="hero-title" style={{ fontSize: '2.8rem', lineHeight: 1.15, fontWeight: 800 }}>
              Bring Nature Home with <span style={{ color: '#86efac' }}>Ganapathi Gardens</span> 🌿
            </h2>
            
            <p className="hero-subtitle" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#e2e8f0', margin: '18px 0 26px 0' }}>
              Healthy plants, beautiful gardens and everything you need to grow a greener home.
            </p>
            
            <div className="hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                id="hero-shop-plants-btn"
                className="btn btn-primary btn-lg" 
                onClick={onShopPlants}
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}
              >
                <span>SHOP PLANTS</span>
                <ArrowRight size={18} />
              </button>
              
              <button 
                id="hero-view-offers-btn"
                className="btn btn-secondary btn-lg" 
                onClick={onViewOffers}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Tag size={17} />
                <span>VIEW OFFERS</span>
              </button>

              <a 
                href="https://maps.app.goo.gl/19cfUNcC6EmtfYVu7"
                target="_blank"
                rel="noreferrer"
                className="btn btn-lg"
                style={{ background: 'rgba(0,0,0,0.25)', color: '#bbf7d0', border: '1px solid rgba(187,247,208,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MapPin size={16} />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Nursery highlights */}
            <div style={{ display: 'flex', gap: '28px', paddingTop: '22px' }}>
              <div>
                <strong style={{ fontSize: '1.4rem', color: '#86efac', display: 'block' }}>1000+</strong>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Healthy Plants</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '28px' }}>
                <strong style={{ fontSize: '1.4rem', color: '#86efac', display: 'block' }}>Direct Nursery</strong>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Farm-Fresh Rates</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '28px' }}>
                <strong style={{ fontSize: '1.4rem', color: '#86efac', display: 'block' }}>Kakinada</strong>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Local Delivery & Location Card */}
          <div>
            <div className="hero-pincode-card" id="hero-pincode-checker" style={{ background: 'rgba(15, 45, 30, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(134, 239, 172, 0.2)' }}>
              <div className="pincode-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac' }}>
                <Truck size={20} />
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Local Nursery Delivery Rates</span>
              </div>
              <p className="pincode-card-desc" style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                We deliver securely potted plants across Kakinada and nearby mandals directly from our Cheediga nursery:
              </p>

              {/* Delivery Zone Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '14px 0' }}>
                {deliveryOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedArea(opt.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: selectedArea === opt.id ? '2px solid #86efac' : '1px solid rgba(255,255,255,0.15)',
                      background: selectedArea === opt.id ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.06)',
                      color: selectedArea === opt.id ? '#ffffff' : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{opt.name}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#86efac', marginTop: '2px' }}>₹{opt.charge}</div>
                  </button>
                ))}
              </div>

              {/* Active Zone Details */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', fontSize: '0.84rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Coverage Areas:</span>
                  <strong style={{ color: '#86efac' }}>{currentOption.areas}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Delivery:</span>
                  <span style={{ color: '#fef08a' }}>{currentOption.time}</span>
                </div>
              </div>

              {/* Physical Nursery Location Pill */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <MapPin size={15} color="#86efac" />
                  <span>Cheediga, PO, Indra Palem, Kakinada</span>
                </div>
                <a 
                  href="https://maps.app.goo.gl/19cfUNcC6EmtfYVu7" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#86efac', fontSize: '0.78rem', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  Map <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip">
        <div className="container trust-grid">
          <div className="trust-item">
            <div className="trust-icon" style={{ color: '#16a34a' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="trust-text">
              <h4>100% Healthy Plants</h4>
              <p>Nourished in Cheediga nursery conditions</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon" style={{ color: '#16a34a' }}>
              <Ruler size={24} />
            </div>
            <div className="trust-text">
              <h4>Accurate Plant Heights</h4>
              <p>Height, pot size & species specifications</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon" style={{ color: '#16a34a' }}>
              <Truck size={24} />
            </div>
            <div className="trust-text">
              <h4>Kakinada City & Nearby</h4>
              <p>Careful transport without root shock</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon" style={{ color: '#16a34a' }}>
              <HeartHandshake size={24} />
            </div>
            <div className="trust-text">
              <h4>Free Gardening Guidance</h4>
              <p>Call or WhatsApp +91 94401 23456</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
