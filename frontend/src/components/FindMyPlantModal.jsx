import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, RotateCcw, ShoppingBag } from 'lucide-react';

export default function FindMyPlantModal({ isOpen, onClose, products = [], onAddToCart }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    space: 'Indoor',
    sunlight: 'Low to Medium',
    experience: 'Beginner',
    budget: 'Under ₹500',
    petFriendly: 'Doesn\'t matter',
    size: 'Small or Medium',
    flowering: 'Foliage / Air Purifying',
    maintenance: 'Low Maintenance'
  });

  const questions = [
    {
      id: 'space',
      title: 'Where will your plant live? 🏡',
      subtitle: 'Choose your primary placement area',
      options: [
        { label: 'Living Room / Bedroom (Indoor)', value: 'Indoor', icon: '🛋️' },
        { label: 'Balcony or Patio', value: 'Balcony', icon: '🪴' },
        { label: 'Sunny Outdoor Garden', value: 'Outdoor', icon: '🌳' },
        { label: 'Office Desk / Study Corner', value: 'Office', icon: '💻' }
      ]
    },
    {
      id: 'sunlight',
      title: 'How much sunlight does that spot receive? ☀️',
      subtitle: 'Sunlight is the primary food source for plants',
      options: [
        { label: 'Low light / Artificial bulb light', value: 'Low', icon: '🌑' },
        { label: 'Medium indirect bright light (near window)', value: 'Medium indirect', icon: '⛅' },
        { label: 'Direct sunlight for 4+ hours daily', value: 'Direct sun', icon: '☀️' },
        { label: 'Diffused filtered light through curtain', value: 'Filtered', icon: '🪟' }
      ]
    },
    {
      id: 'experience',
      title: 'What is your gardening experience? 🌱',
      subtitle: 'Be honest — we have plants for everyone!',
      options: [
        { label: 'Absolute Beginner (Keep it alive!)', value: 'Beginner', icon: '🌱' },
        { label: 'Occasional Caregiver (Water on weekends)', value: 'Moderate', icon: '🌿' },
        { label: 'Green Thumb Enthusiast (Love plant parenting)', value: 'Expert', icon: '🪴' }
      ]
    },
    {
      id: 'budget',
      title: 'What is your preferred budget range? 💰',
      subtitle: 'Find great quality at any price point',
      options: [
        { label: 'Pocket Friendly (Under ₹300)', value: '300', icon: '🪙' },
        { label: 'Standard Nursery Potted (₹300 – ₹600)', value: '600', icon: '💵' },
        { label: 'Premium / Statement Specimens (₹600+)', value: '1000', icon: '👑' },
        { label: 'Show me any budget', value: 'any', icon: '✨' }
      ]
    },
    {
      id: 'maintenance',
      title: 'How frequently can you water? 💧',
      subtitle: 'Matches your busy routine or routine care',
      options: [
        { label: 'Very low maintenance (Once every 2-3 weeks)', value: 'low', icon: '🏜️' },
        { label: 'Standard watering (1-2 times a week)', value: 'medium', icon: '💧' },
        { label: 'I enjoy daily watering and tending', value: 'high', icon: '🚿' }
      ]
    }
  ];

  const handleOptionSelect = (optionValue) => {
    const qKey = questions[step].id;
    setAnswers(prev => ({ ...prev, [qKey]: optionValue }));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // Results step
    }
  };

  // Calculate Recommendations
  const getRecommendations = () => {
    return products.filter(p => {
      // Score matching
      let match = true;
      if (answers.space === 'Outdoor' && p.plantType === 'Indoor') return false;
      if (answers.space === 'Indoor' && p.plantType === 'Outdoor' && !p.plantType.includes('Indoor')) return false;

      if (answers.budget !== 'any') {
        const maxBudget = parseInt(answers.budget, 10);
        const startPrice = p.sizes?.[0]?.price || p.price || 199;
        if (startPrice > maxBudget + 100) return false;
      }
      return match;
    }).slice(0, 3);
  };

  const matchedPlants = getRecommendations();

  return (
    <div className="modal-overlay" id="find-my-plant-modal" onClick={onClose}>
      <div 
        className="modal-content-card" 
        style={{ maxWidth: '680px', padding: '32px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} id="close-find-plant">
          <X size={18} />
        </button>

        {/* Wizard Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#EBF7EE',
            padding: '4px 12px',
            borderRadius: '9999px',
            color: '#1B523A',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            <Sparkles size={14} />
            <span>GreenNest Smart Plant Matcher</span>
          </div>
          <h3 style={{ fontSize: '1.6rem' }}>Find Your Perfect Plant 🌱</h3>
          <p style={{ fontSize: '0.88rem', color: '#71847A' }}>
            Answer 5 quick questions to find the healthiest plant for your home and lifestyle.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="wizard-progress">
          {questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`progress-step-pill ${idx <= step ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Question View */}
        {step < questions.length ? (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.78rem', color: '#71847A', fontWeight: 600, textTransform: 'uppercase' }}>
                Question {step + 1} of {questions.length}
              </span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{questions[step].title}</h4>
              <p style={{ fontSize: '0.84rem', color: '#71847A' }}>{questions[step].subtitle}</p>
            </div>

            <div className="quiz-options-grid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
              {questions[step].options.map((opt, i) => (
                <button
                  key={i}
                  id={`quiz-option-${step}-${i}`}
                  className="quiz-option-btn"
                  onClick={() => handleOptionSelect(opt.value)}
                >
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{opt.icon}</span>
                  <div>
                    <strong style={{ fontSize: '0.98rem', display: 'block', color: '#0C2C20' }}>{opt.label}</strong>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              {step > 0 ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={15} />
                  <span>Previous</span>
                </button>
              ) : <div></div>}
            </div>
          </div>
        ) : (
          /* Results View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h4 style={{ fontSize: '1.4rem', color: '#143D2D' }}>
                Recommended for You 🌱
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#71847A' }}>
                Based on your {answers.space} space and {answers.experience} experience level:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {matchedPlants.map((plant) => {
                const defaultSize = plant.sizes?.[0] || { size: 'Medium', price: 299, pot: '6 inch' };
                return (
                  <div
                    key={plant.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: '#F4FAF5',
                      border: '1.5px solid #C8E6D0',
                      borderRadius: '16px',
                      padding: '14px 18px'
                    }}
                  >
                    <img
                      src={plant.images?.[0]}
                      alt={plant.name}
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{plant.name}</h4>
                        <strong style={{ color: '#0C2C20', fontSize: '1.1rem' }}>₹{defaultSize.price}</strong>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#1B523A', margin: '3px 0' }}>
                        ✓ {plant.sunlight} • {plant.difficulty} • {defaultSize.size} ({defaultSize.height || '30 cm'})
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#71847A' }}>
                        <strong>Why it matches:</strong> Low maintenance foliage tailored for your {answers.space.toLowerCase()} space.
                      </span>
                    </div>

                    <button
                      id={`quiz-add-${plant.id}`}
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onAddToCart({
                          productId: plant.id,
                          name: plant.name,
                          size: defaultSize.size,
                          height: defaultSize.height,
                          pot: defaultSize.pot,
                          price: defaultSize.price,
                          image: plant.images?.[0],
                          quantity: 1
                        });
                        onClose();
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setStep(0)}
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={onClose}
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
