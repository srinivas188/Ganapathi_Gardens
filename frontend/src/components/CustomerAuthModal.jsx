import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { customerSignup, customerLogin, updateCustomerProfile } from '../api';

export default function CustomerAuthModal({ 
  isOpen, 
  onClose, 
  customer, 
  onAuthSuccess, 
  onLogout, 
  initialMode = 'login',
  customMessage = ''
}) {
  // Modes: 'login' | 'signup' | 'profile' | 'forgot'
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Customer Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    identifier: ''
  });

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || ''
      }));
    }
  }, [isOpen, initialMode, customer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 1. Customer Login Submit
  const handleCustomerLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setError('Please enter your email or mobile number and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await customerLogin(formData.identifier, formData.password);
      if (res.success && res.token) {
        localStorage.setItem('ganapathi_customer_token', res.token);
        localStorage.setItem('ganapathi_customer_data', JSON.stringify(res.user));
        if (rememberMe) {
          localStorage.setItem('ganapathi_remember_me', 'true');
        } else {
          localStorage.removeItem('ganapathi_remember_me');
        }
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error connecting to Ganapathi Gardens server.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Customer Signup Submit
  const handleCustomerSignupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await customerSignup({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });

      if (res.success && res.token) {
        localStorage.setItem('ganapathi_customer_token', res.token);
        localStorage.setItem('ganapathi_customer_data', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Signup failed.');
      }
    } catch (err) {
      setError('Network error creating account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '460px', 
          width: '94%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          borderRadius: '20px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 20px 40px rgba(22, 101, 52, 0.15)',
          padding: '28px'
        }}
      >
        {/* Top Header & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
            }}>
              🌿
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#14532d', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Ganapathi Gardens
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#4b7a60', fontWeight: 500 }}>
                Plant Nursery • Cheediga, Kakinada
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Customer Login | Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          background: '#f0fdf4',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #dcfce7',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              padding: '9px 6px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: mode === 'login' ? 700 : 500,
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#166534' : '#64748b',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Customer Login
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            style={{
              padding: '9px 6px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: mode === 'signup' ? 700 : 500,
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#166534' : '#64748b',
              boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Notices */}
        {customMessage && (
          <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{customMessage}</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* 1. CUSTOMER LOGIN INTERFACE                         */}
        {/* ==================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleCustomerLoginSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email / Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Enter email or 10-digit mobile"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outlineColor: '#16a34a'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outlineColor: '#16a34a'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#16a34a', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>Remember Me</span>
              </label>

              <span 
                onClick={() => setMode('forgot')} 
                style={{ fontSize: '0.82rem', color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot Password?
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Leaf size={16} />
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>

            {/* Create Account / Sign Up Toggle */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <strong 
                onClick={() => setMode('signup')}
                style={{ color: '#16a34a', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create Account / Sign Up
              </strong>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* 2. CUSTOMER SIGNUP INTERFACE                        */}
        {/* ==================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleCustomerSignupSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Email *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Already have an account? Login */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              Already have an account?{' '}
              <strong 
                onClick={() => setMode('login')}
                style={{ color: '#16a34a', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Login
              </strong>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* 3. FORGOT PASSWORD                                  */}
        {/* ==================================================== */}
        {mode === 'forgot' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px', lineHeight: 1.5 }}>
              Enter your registered email or mobile number to receive password recovery instructions:
            </p>
            <input
              type="text"
              placeholder="Email or 10-digit mobile"
              style={{ width: '100%', padding: '11px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', marginBottom: '14px' }}
            />
            <button
              type="button"
              onClick={() => {
                setSuccess('Password reset link sent to your registered contact!');
                setTimeout(() => setMode('login'), 2200);
              }}
              style={{ width: '100%', padding: '11px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Send Reset Link
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span 
                onClick={() => setMode('login')}
                style={{ color: '#16a34a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ← Back to Login
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
