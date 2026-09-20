import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { submitContactMessage } from '../api';

export default function AboutLocationSection({ businessInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: 'Nursery Plants Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Business information specified for Ganapathi Gardens
  const nursery = {
    businessName: businessInfo?.businessName || 'Ganapathi Gardens – Plant Nursery',
    address: businessInfo?.address || 'Cheediga, Kakinada, Andhra Pradesh, India',
    phone: businessInfo?.contactNumber || '090008 35323',
    email: businessInfo?.email || 'ganapathigardens@gmail.com',
    website: businessInfo?.website || 'ganapathigardens.com',
    mapLink: businessInfo?.mapLink || 'https://maps.app.goo.gl/apLx3Us3cWC1PKz87',
    timings: businessInfo?.openingHours || 'Monday – Sunday: 7:00 AM – 7:30 PM',
    description: businessInfo?.description || 'Welcome to Ganapathi Gardens – Plant Nursery in Cheediga, Kakinada. We cultivate healthy flowering roses, indoor air-purifying foliage, grafted fruit saplings, exotic bonsais, and premium organic garden supplies.'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.message) {
      setErrorMsg('Please provide your name, mobile number, and message.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await submitContactMessage(formData);
      if (res.success) {
        setSuccessMsg('Thank you for contacting Ganapathi Gardens! We will call or WhatsApp you shortly.');
        setFormData({
          name: '',
          email: '',
          mobile: '',
          subject: 'Nursery Plants Inquiry',
          message: ''
        });
      } else {
        setErrorMsg(res.message || 'Failed to send message.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to nursery server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="about-location-section" id="about-section" style={{ padding: '60px 0', background: '#f8fafc' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ 
            background: '#dcfce7', 
            color: '#166534', 
            padding: '5px 16px', 
            borderRadius: '9999px', 
            fontSize: '0.82rem', 
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            <span>About Ganapathi Gardens</span>
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#14532d', margin: '10px 0 12px 0', letterSpacing: '-0.5px' }}>
            {nursery.businessName}
          </h2>
          <p style={{ color: '#4b7a60', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            {nursery.description}
          </p>
        </div>

        {/* 3-Column Info / Map / Contact Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          
          {/* Column 1: Verified Business Details */}
          <div style={{ 
            background: '#ffffff', 
            padding: '30px', 
            borderRadius: '18px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  🌿
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#14532d', fontWeight: 800 }}>
                    Nursery Information
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cheediga, Kakinada • Andhra Pradesh</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.92rem', color: '#334155' }}>
                {/* Address */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>LOCATION</span>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{nursery.address}</strong>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>PHONE NUMBER</span>
                    <a href={`tel:${nursery.phone.replace(/\s+/g, '')}`} style={{ color: '#166534', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
                      {nursery.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>EMAIL ADDRESS</span>
                    <a href={`mailto:${nursery.email}`} style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>
                      {nursery.email}
                    </a>
                  </div>
                </div>

                {/* Website */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>WEBSITE</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{nursery.website}</span>
                  </div>
                </div>

                {/* Timings */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>OPENING HOURS</span>
                    <span style={{ color: '#0f172a' }}>{nursery.timings}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Location on Map Button */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
              <a
                href={nursery.mapLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  padding: '13px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <MapPin size={18} />
                <span>View Location on Map</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Location Map Presentation */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '18px', 
            border: '1px solid #e2e8f0', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#16a34a" />
                <strong style={{ fontSize: '0.92rem', color: '#14532d' }}>Cheediga, Kakinada Location</strong>
              </div>
              <a 
                href={nursery.mapLink}
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                Open Google Maps <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
              <iframe
                title="Ganapathi Gardens Cheediga Kakinada Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3815.7725916327376!2d82.222384!3d16.985447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a382875c754b2a7%3A0xb30f81d1e4c9fce2!2sGanapathi%20Gardens!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px', display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div style={{ padding: '14px 18px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                <span>Cheediga, Kakinada, Andhra Pradesh 533006</span>
              </div>
              <a
                href={nursery.mapLink}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#15803d', fontWeight: 700, textDecoration: 'underline' }}
              >
                Get Directions →
              </a>
            </div>
          </div>

          {/* Column 3: Contact Message Form */}
          <div style={{ 
            background: '#ffffff', 
            padding: '28px', 
            borderRadius: '18px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)' 
          }} id="contact-form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MessageSquare size={20} color="#166534" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#166534', fontWeight: 800 }}>
                Get In Touch
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Ask about plant availability, bulk orders, or garden consulting. We respond promptly!
            </p>

            {successMsg && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '10px 14px', borderRadius: '10px', color: '#15803d', fontSize: '0.84rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '10px', color: '#b91c1c', fontSize: '0.84rem', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Message / Inquiry *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Inquire about plant species, pricing, or delivery..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)'
                }}
              >
                <Send size={15} />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
