import React, { useState } from 'react';
import { Sun, Droplets, Sparkles, BookOpen, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function PlantCareHub() {
  const [selectedIssue, setSelectedIssue] = useState('yellow-leaves');

  const issues = {
    'yellow-leaves': {
      title: 'Yellowing Leaves on Houseplants 🍃',
      cause: 'Most frequently caused by overwatering or poor drainage. Infrequently caused by natural shedding of older lower leaves.',
      symptoms: ['Lower leaves turn pale yellow and soft', 'Soil feels soggy or has sour smell', 'Vines look limp despite wet soil'],
      remedy: 'Allow the top 2 inches of potting mix to completely dry out before watering again. Ensure your pot has an unblocked drainage hole. Never leave stagnant water in the drip tray.',
      severity: 'Moderate • Immediate watering pause required'
    },
    'brown-tips': {
      title: 'Crispy Brown Leaf Tips or Edges 🍂',
      cause: 'Low humidity, hard tap water with excess fluoride/chlorine, or irregular watering cycles.',
      symptoms: ['Tips of Snake Plants, Palms, or Peace Lilies turn brittle', 'Leaf margins feel paper-thin'],
      remedy: 'Use filtered or rested tap water (let water sit overnight so chlorine evaporates). Mist tropical palms twice weekly or place on a pebble humidity tray.',
      severity: 'Mild • Cosmetic fix'
    },
    'drooping-limp': {
      title: 'Sudden Drooping or Wilting Foliage 🥀',
      cause: 'Severe dehydration (underwatering) or sudden thermal shock from air conditioner drafts.',
      symptoms: ['Stems bow downward', 'Soil has pulled away from container edges', 'Peace Lily dramatic collapse'],
      remedy: 'Give a thorough bottom-watering soak: place the pot in a basin with 2 inches of water for 20 minutes until topsoil glistens, then drain.',
      severity: 'Urgent • High recovery rate within 4 hours'
    },
    'fungus-gnats': {
      title: 'Tiny Flying Bugs Around Soil (Fungus Gnats) 🪰',
      cause: 'Potting mix staying continuously damp, allowing organic matter to host fungus gnat larvae.',
      symptoms: ['Small black flies hover when pot is touched', 'Tiny white larvae in topsoil'],
      remedy: 'Let the top 2 inches dry out completely. Sprinkle cold-pressed neem cake powder or spray diluted neem oil (5ml/L) over topsoil.',
      severity: 'Moderate • Treat with organic neem'
    }
  };

  const guides = [
    {
      icon: '💧',
      title: 'The Golden 2-Inch Knuckle Test',
      category: 'Watering Mastery',
      text: 'Push your index finger into the soil up to the second knuckle (~2 inches). If soil clings to your finger and feels cool/damp, DO NOT water. If it comes out clean and dry, water thoroughly until it trickles out the drainage hole.'
    },
    {
      icon: '☀️',
      title: 'Decoding Light: Direct vs Indirect',
      category: 'Sunlight Guide',
      text: 'Direct sunlight casts a sharp, crisp shadow (good for Roses, Bougainvillea, Hibiscus). Bright indirect light casts a fuzzy, soft shadow (ideal for Money Plants, Fiddle Leaf Figs, ZZ, Palms). North windows provide gentle indirect light.'
    },
    {
      icon: '🪴',
      title: 'When and How to Repot Plants',
      category: 'Repotting Guide',
      text: 'Only repot when roots emerge from the drainage hole or circulate tightly in the container. Always choose a pot just 2 inches wider in diameter. Jumping to an oversized pot causes root rot from excess damp uncolonized soil.'
    },
    {
      icon: '🌿',
      title: 'Fertilizing Schedule in Tropical Climates',
      category: 'Nutrition & Growth',
      text: 'Feed during active growing months (February to October). Use organic vermicompost top dressing once a month, or liquid seaweed extract every 3 weeks. Always dilute fertilizers by half to prevent root burn.'
    }
  ];

  return (
    <div className="container" id="plant-care-hub" style={{ padding: '40px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-green" style={{ marginBottom: '8px' }}>Nursery Wisdom</span>
        <h2 style={{ fontSize: '2.4rem', color: '#0C2C20' }}>Plant Care & Health Hub 🌿</h2>
        <p style={{ fontSize: '0.94rem', color: '#71847A', maxWidth: '620px', margin: '6px auto 0' }}>
          Real advice from our on-site nursery horticulturists. Keep your plants thriving with proven watering, lighting, and repotting techniques.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px', marginBottom: '50px' }}>
        {guides.map((g, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid #DDE7E1',
              boxShadow: '0 4px 14px rgba(12, 44, 32, 0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{g.icon}</div>
            <span style={{ fontSize: '0.74rem', color: '#1B523A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {g.category}
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#121A15', margin: '4px 0 10px' }}>{g.title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#475850', lineHeight: 1.6 }}>{g.text}</p>
          </div>
        ))}
      </div>

      {/* Interactive Plant Symptom Troubleshooter */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #DDE7E1',
        padding: '36px',
        boxShadow: '0 8px 24px rgba(12, 44, 32, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFF7E6',
            color: '#B26A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Interactive Plant Troubleshooter</h3>
            <p style={{ fontSize: '0.84rem', color: '#71847A' }}>
              Notice something wrong with your foliage? Select a symptom below for horticulturist diagnosis:
            </p>
          </div>
        </div>

        {/* Symptom Selectors */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { id: 'yellow-leaves', label: '🍂 Yellowing Leaves' },
            { id: 'brown-tips', label: '🔥 Brown Crispy Tips' },
            { id: 'drooping-limp', label: '🥀 Drooping & Limp Stems' },
            { id: 'fungus-gnats', label: '🪰 Tiny Soil Gnats' }
          ].map((item) => (
            <button
              key={item.id}
              className={`btn btn-sm ${selectedIssue === item.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedIssue(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Diagnostic Card */}
        {issues[selectedIssue] && (
          <div style={{
            background: '#F8FAF8',
            borderRadius: '16px',
            border: '1.5px solid #C8E6D0',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0C2C20', margin: 0 }}>
                {issues[selectedIssue].title}
              </h4>
              <span className="badge badge-gold">{issues[selectedIssue].severity}</span>
            </div>

            <div style={{ margin: '14px 0', fontSize: '0.92rem', color: '#2A3830' }}>
              <strong>Primary Cause:</strong> {issues[selectedIssue].cause}
            </div>

            <div style={{ margin: '14px 0' }}>
              <strong style={{ fontSize: '0.86rem', color: '#71847A', textTransform: 'uppercase' }}>Key Symptoms:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.88rem', color: '#475850', lineHeight: 1.5 }}>
                {issues[selectedIssue].symptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>

            <div style={{
              background: '#EBF7EE',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #C8E6D0',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <CheckCircle size={20} color="#1E8E3E" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: '#143D2D' }}>
                <strong>Immediate Nursery Treatment:</strong> {issues[selectedIssue].remedy}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
