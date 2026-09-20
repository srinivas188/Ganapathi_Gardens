import React, { useState } from 'react';
import { Ruler, Check, Info } from 'lucide-react';

export default function PlantSizeVisualizer({ onSelectSamplePlant }) {
  const [activeSize, setActiveSize] = useState('Medium');

  const sizeProfiles = {
    Small: {
      heightCm: '15–25 cm',
      potInches: '4–5 inch pot',
      idealPlacement: 'Work desks, bedside tables, narrow windowsills',
      priceRange: '₹149 – ₹249',
      scaleHeightPx: 75,
      potWidthPx: 38,
      leafDensity: 5,
      description: 'Compact juvenile nursery specimen, perfect for tabletops and gift giving.'
    },
    Medium: {
      heightCm: '30–45 cm',
      potInches: '6–7 inch pot',
      idealPlacement: 'Coffee tables, bookshelves, office credenzas',
      priceRange: '₹299 – ₹449',
      scaleHeightPx: 120,
      potWidthPx: 52,
      leafDensity: 9,
      description: 'Established, well-rooted foliage plant with full shape and immediate visual impact.'
    },
    Large: {
      heightCm: '50–70 cm',
      potInches: '8–10 inch pot',
      idealPlacement: 'Living room corners, balcony pedestals, patio entryway',
      priceRange: '₹499 – ₹799',
      scaleHeightPx: 175,
      potWidthPx: 70,
      leafDensity: 14,
      description: 'Mature bushy specimen requiring 8-10" pot. Often trained on moss poles.'
    },
    XL: {
      heightCm: '80–120 cm',
      potInches: '12–14 inch heavy-duty planter',
      idealPlacement: 'Statement floor tree for living rooms, reception halls',
      priceRange: '₹799 – ₹1,999',
      scaleHeightPx: 230,
      potWidthPx: 90,
      leafDensity: 20,
      description: 'Grand architectural statement plant. Eligible for large plant nursery transit handling.'
    }
  };

  const current = sizeProfiles[activeSize];

  return (
    <div className="size-visualizer-card" id="plant-size-visualizer">
      <div className="visualizer-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-green">GreenNest Feature</span>
            <h3 style={{ fontSize: '1.4rem' }}>Interactive Plant Size Visualizer 📐</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#71847A', marginTop: '4px' }}>
            Know exactly what you are purchasing. See real height dimensions and nursery pot proportions before placing your order.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['Small', 'Medium', 'Large', 'XL'].map((sizeKey) => (
            <button
              key={sizeKey}
              id={`size-vis-btn-${sizeKey.toLowerCase()}`}
              className={`btn btn-sm ${activeSize === sizeKey ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSize(sizeKey)}
            >
              {sizeKey === 'Small' && '🌱 '}
              {sizeKey === 'Medium' && '🌿 '}
              {sizeKey === 'Large' && '🌳 '}
              {sizeKey === 'XL' && '🌴 '}
              {sizeKey}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Scale Box */}
      <div className="size-scale-container" style={{ minHeight: '260px' }}>
        {/* Scale reference marks */}
        <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9AB4A4', borderLeft: '1.5px solid #C8DBD0', paddingLeft: '6px' }}>
          <span>120 cm (XL Floor)</span>
          <span>70 cm (Large)</span>
          <span>45 cm (Medium Table)</span>
          <span>25 cm (Small Desk)</span>
          <span>0 cm (Pot Base)</span>
        </div>

        {/* The 4 Sizes Rendered Side by Side for Direct Scale Comparison */}
        {Object.entries(sizeProfiles).map(([key, profile]) => {
          const isSelected = activeSize === key;
          return (
            <div
              key={key}
              className={`size-pill-option ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveSize(key)}
              style={{ flex: 1, maxWidth: '180px' }}
            >
              {/* Graphic Representation */}
              <div 
                className="size-plant-graphic"
                style={{
                  height: `${profile.scaleHeightPx}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Foliage Icon */}
                <div style={{
                  fontSize: key === 'Small' ? '2rem' : key === 'Medium' ? '3rem' : key === 'Large' ? '4.2rem' : '5.5rem',
                  lineHeight: 1,
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  filter: isSelected ? 'drop-shadow(0 6px 12px rgba(52, 168, 83, 0.4))' : 'none'
                }}>
                  {key === 'Small' ? '🌱' : key === 'Medium' ? '🌿' : key === 'Large' ? '🪴' : '🌴'}
                </div>

                {/* Pot Graphic */}
                <div style={{
                  width: `${profile.potWidthPx}px`,
                  height: `${profile.potWidthPx * 0.75}px`,
                  background: isSelected ? 'linear-gradient(180deg, #D3653B 0%, #A34825 100%)' : '#C07E63',
                  borderRadius: '2px 2px 8px 8px',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.12)',
                  marginTop: '4px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}>
                  {profile.potInches.split(' ')[0]}
                </div>
              </div>

              {/* Label */}
              <div className="size-meta-badge">
                <strong>{key}</strong>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 500 }}>{profile.heightCm}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Size Specs Card */}
      <div style={{
        marginTop: '20px',
        padding: '18px 24px',
        background: '#F4FAF5',
        borderRadius: '16px',
        border: '1px solid #D5E8DC',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '20px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C2C20' }}>
              Size: {activeSize}
            </span>
            <span className="badge badge-gold">{current.priceRange}</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475850', marginTop: '4px' }}>
            {current.description}
          </p>
        </div>

        <div style={{ borderLeft: '1px solid #DDE7E1', paddingLeft: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>
            📏 Height & Pot Size
          </span>
          <p style={{ fontWeight: 700, color: '#143D2D', fontSize: '0.92rem' }}>
            {current.heightCm} tall
          </p>
          <span style={{ fontSize: '0.8rem', color: '#475850' }}>{current.potInches}</span>
        </div>

        <div style={{ borderLeft: '1px solid #DDE7E1', paddingLeft: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: '#71847A', textTransform: 'uppercase', fontWeight: 600 }}>
            🏡 Ideal Placement
          </span>
          <p style={{ fontWeight: 600, color: '#143D2D', fontSize: '0.88rem' }}>
            {current.idealPlacement}
          </p>
        </div>
      </div>
    </div>
  );
}
