import React from 'react';
import { Tag, Sparkles, Percent, ArrowRight, Check } from 'lucide-react';

export default function OffersSection({ offers = [], onShopNow, onCopyCoupon }) {
  const [copiedCode, setCopiedCode] = React.useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onCopyCoupon) onCopyCoupon(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const defaultOffers = [
    {
      id: 'off-1',
      title: 'Monsoon Bloom Fest — 20% OFF',
      code: 'MONSOON20',
      discountPercent: 20,
      description: 'Flat 20% instant discount on all flowering shrubs, roses, and jasmine plants.',
      badgeText: 'HOT DEAL',
      minOrder: '₹499'
    },
    {
      id: 'off-2',
      title: 'Green Home Welcome Discount',
      code: 'GREENHOME',
      discountPercent: 10,
      description: 'Get 10% OFF on all indoor air-purifying plants for new Ganapathi Gardens customers.',
      badgeText: 'NEW CUSTOMER',
      minOrder: '₹299'
    },
    {
      id: 'off-3',
      title: 'Kakinada Local Special — Free Potting Soil',
      code: 'KAKINADA26',
      discountPercent: 15,
      description: 'Enjoy 15% savings + free nutrient compost on all fruit saplings and outdoor palms.',
      badgeText: 'LOCAL SPECIAL',
      minOrder: '₹599'
    }
  ];

  const displayOffers = offers.length > 0 ? offers : defaultOffers;

  return (
    <section className="offers-section" id="offers-section" style={{ padding: '40px 0', background: '#f0fdf4' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <Sparkles size={14} />
            <span>Nursery Specials & Seasonal Discounts</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#14532d', margin: '4px 0 8px 0' }}>
            Special Nursery Offers 🏷️
          </h2>
          <p style={{ color: '#4b7a60', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Save more on healthy nursery plants with our verified coupon codes at checkout!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
          {displayOffers.map((offer) => (
            <div 
              key={offer.id || offer.code}
              style={{
                background: '#ffffff',
                border: '1.5px dashed #86efac',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.05)',
                position: 'relative'
              }}
            >
              <span style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {offer.badgeText || `${offer.discountPercent}% OFF`}
              </span>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', marginBottom: '10px' }}>
                  <Percent size={20} />
                  <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>{offer.discountPercent}% Instant Off</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 6px 0', fontWeight: 700 }}>
                  {offer.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {offer.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Coupon Code:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#166534', letterSpacing: '0.5px' }}>{offer.code}</strong>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    style={{
                      background: copiedCode === offer.code ? '#16a34a' : '#ffffff',
                      color: copiedCode === offer.code ? '#ffffff' : '#166534',
                      border: '1px solid #86efac',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedCode === offer.code ? <Check size={14} /> : <Tag size={14} />}
                    <span>{copiedCode === offer.code ? 'COPIED!' : 'COPY CODE'}</span>
                  </button>
                </div>

                <button
                  onClick={onShopNow}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>SHOP DISCOUNTED PLANTS</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
