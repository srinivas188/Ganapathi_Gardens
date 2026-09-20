import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Leaf, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Key
} from 'lucide-react';
import { customerLogin, customerSignup, adminLogin } from '../api';

export default function LandingFrontPage({ 
  onCustomerAuthSuccess, 
  onAdminLoginSuccess,
  onProceedAsGuest,
  savedCustomer 
}) {
  // Tabs: 'login' | 'signup' | 'admin' | 'forgot'
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Customer Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Admin Form State (Completely distinct from customer)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Customer Login Submit
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Please enter your Email or Mobile Number and Password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await customerLogin(loginIdentifier, loginPassword);
      if (res.success && res.token) {
        localStorage.setItem('ganapathi_customer_token', res.token);
        localStorage.setItem('ganapathi_customer_data', JSON.stringify(res.user));
        if (rememberMe) {
          localStorage.setItem('ganapathi_remember_me', 'true');
        } else {
          localStorage.removeItem('ganapathi_remember_me');
        }
        setSuccessMsg(`Welcome back, ${res.user.name || 'valued customer'}!`);
        setTimeout(() => {
          onCustomerAuthSuccess(res.user);
        }, 600);
      } else {
        setErrorMsg(res.message || 'Invalid login credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to Ganapathi Gardens server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Customer Signup Submit
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    if (!signupName || !signupMobile || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await customerSignup({
        name: signupName,
        phone: signupMobile,
        email: signupEmail,
        password: signupPassword
      });
      if (res.success && res.token) {
        localStorage.setItem('ganapathi_customer_token', res.token);
        localStorage.setItem('ganapathi_customer_data', JSON.stringify(res.user));
        setSuccessMsg('Account created successfully! Entering Ganapathi Gardens...');
        setTimeout(() => {
          onCustomerAuthSuccess(res.user);
        }, 600);
      } else {
        setErrorMsg(res.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error creating your account.');
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Admin Login Submit
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setErrorMsg('Please enter both Admin Email and Password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminLogin(adminEmail, adminPassword);
      if (res.success && res.token) {
        localStorage.setItem('ganapathi_admin_token', res.token);
        localStorage.setItem('ganapathi_admin_user', JSON.stringify(res.admin));
        setSuccessMsg('Administrator verified! Redirecting to Secure Admin Portal...');
        setTimeout(() => {
          if (onAdminLoginSuccess) {
            onAdminLoginSuccess(res.admin);
          }
        }, 600);
      } else {
        setErrorMsg(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to Admin authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `url('/assets/nursery_bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      color: '#ffffff',
      overflowX: 'hidden'
    }}>
      {/* Dark/soft transparent overlay so forms and information are easy to read */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(7, 28, 15, 0.88) 0%, rgba(6, 20, 12, 0.72) 45%, rgba(4, 18, 9, 0.86) 100%)',
        backdropFilter: 'blur(2.5px)',
        zIndex: 1
      }} />

      {/* Top Brand Navigation / Status */}
      <header style={{
        position: 'relative',
        zIndex: 2,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/assets/ganapathi_logo.jpg" 
            alt="Ganapathi Gardens Official Logo" 
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              objectFit: 'contain', 
              background: '#ffffff', 
              padding: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)' 
            }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.4px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌱 GANAPATHI GARDENS</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#86efac', fontWeight: 500, letterSpacing: '0.2px' }}>
              Plant Nursery & Landscape Company • Cheediga, Kakinada
            </p>
          </div>
        </div>

        {/* Quick Phone contact shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="tel:09000835323"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.2s'
            }}
          >
            <Phone size={14} color="#86efac" />
            <span>📞 090008 35323</span>
          </a>
        </div>
      </header>

      {/* Main Content: Left About Section + Center/Right Glassmorphism Login Card */}
      <main style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1180px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>

          {/* LEFT: Branding & "About Ganapathi Gardens" Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '10px'
          }}>
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(34, 197, 94, 0.22)',
                color: '#86efac',
                border: '1px solid rgba(134, 239, 172, 0.35)',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Sparkles size={14} />
                <span>Welcome to Cheediga's Premier Nursery</span>
              </span>

              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3.1rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '0 0 14px 0',
                letterSpacing: '-0.8px',
                color: '#ffffff'
              }}>
                🌱 Ganapathi Gardens
              </h2>

              <p style={{
                fontSize: '1.15rem',
                color: '#bbf7d0',
                fontWeight: 600,
                margin: '0 0 12px 0'
              }}>
                Plant Nursery & Landscape Company
              </p>

              <p style={{
                fontSize: '0.96rem',
                color: '#cbd5e1',
                lineHeight: 1.65,
                maxWidth: '480px',
                margin: '0 0 20px 0'
              }}>
                Cultivating fresh flowering shrubs, indoor air-purifying foliage, grafted fruit saplings, exotic bonsais, and premium gardening solutions for your home and landscape.
              </p>
            </div>

            {/* About Ganapathi Gardens Business Information Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Leaf size={18} color="#86efac" />
                <span>About Ganapathi Gardens</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={18} color="#86efac" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Cheediga, Kakinada, Andhra Pradesh, India</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#86efac" style={{ flexShrink: 0 }} />
                  <a href="tel:09000835323" style={{ color: '#86efac', textDecoration: 'none', fontWeight: 600 }}>
                    090008 35323
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="#86efac" style={{ flexShrink: 0 }} />
                  <a href="mailto:ganapathigardens@gmail.com" style={{ color: '#ffffff', textDecoration: 'underline' }}>
                    ganapathigardens@gmail.com
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={18} color="#86efac" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>ganapathigardens.com</span>
                </div>
              </div>

              {/* VIEW LOCATION ON MAP Button */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <a
                  href="https://maps.app.goo.gl/apLx3Us3cWC1PKz87"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'rgba(34, 197, 94, 0.25)',
                    color: '#86efac',
                    border: '1px solid #22c55e',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#16a34a';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)';
                    e.currentTarget.style.color = '#86efac';
                  }}
                >
                  <MapPin size={16} />
                  <span>VIEW LOCATION ON MAP</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Saved customer session prompt */}
            {savedCustomer && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.18)',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#bbf7d0', display: 'block' }}>Logged in as:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{savedCustomer.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => onCustomerAuthSuccess(savedCustomer)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Proceed to Main Website</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT / CENTER: Premium Glassmorphism Login / Signup Card */}
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div 
              className="landing-glass-card"
              style={{
                width: '100%',
                maxWidth: '450px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(34, 197, 94, 0.2)',
                padding: '32px',
                color: '#0f172a'
              }}
            >

              {/* Official Ganapathi Gardens Logo at Top/Center of Login Card */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div 
                  className="landing-logo-badge"
                  style={{
                    display: 'inline-block',
                    background: '#ffffff',
                    padding: '6px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 20px rgba(22, 101, 52, 0.18)',
                    border: '2px solid #bbf7d0'
                  }}
                >
                  <img
                    src="/assets/ganapathi_logo.jpg"
                    alt="Official Ganapathi Gardens Logo"
                    style={{
                      width: '88px',
                      height: '88px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#14532d',
                  margin: '12px 0 2px 0',
                  letterSpacing: '-0.4px'
                }}>
                  Ganapathi Gardens
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b7a60', fontWeight: 600 }}>
                  Plant Nursery & Gardening Portal
                </p>
              </div>

              {/* THREE CLEAR BUTTONS / TABS: [ CUSTOMER LOGIN ] [ SIGN UP ] [ ADMIN LOGIN ] */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '5px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  id="tab-customer-login"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'login' ? '#16a34a' : 'transparent',
                    color: activeTab === 'login' ? '#ffffff' : '#64748b',
                    boxShadow: activeTab === 'login' ? '0 3px 8px rgba(22, 163, 74, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  CUSTOMER
                </button>

                <button
                  type="button"
                  id="tab-sign-up"
                  onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'signup' ? '#16a34a' : 'transparent',
                    color: activeTab === 'signup' ? '#ffffff' : '#64748b',
                    boxShadow: activeTab === 'signup' ? '0 3px 8px rgba(22, 163, 74, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  SIGN UP
                </button>

                <button
                  type="button"
                  id="tab-admin-login"
                  onClick={() => { setActiveTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'admin' ? '#0f291e' : 'transparent',
                    color: activeTab === 'admin' ? '#fbbf24' : '#64748b',
                    boxShadow: activeTab === 'admin' ? '0 3px 8px rgba(15, 41, 30, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>ADMIN 🔐</span>
                </button>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ============================================== */}
              {/* 1. CENTER/RIGHT LOGIN CARD FORM                */}
              {/* ============================================== */}
              {activeTab === 'login' && (
                <form onSubmit={handleCustomerLogin}>
                  {/* Email / Mobile Number */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Email / Mobile Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="login-identifier"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Enter email or 10-digit mobile"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outlineColor: '#16a34a',
                          boxSizing: 'border-box'
                        }}
                      />
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        style={{
                          width: '100%',
                          padding: '11px 38px 11px 38px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outlineColor: '#16a34a',
                          boxSizing: 'border-box'
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

                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    id="btn-login-submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Leaf size={16} />
                    <span>{loading ? 'Logging in...' : 'Login'}</span>
                  </button>

                  {/* Don't have an account? Sign Up */}
                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.86rem', color: '#64748b' }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================== */}
              {/* 2. SIGN UP FORM                                */}
              {/* ============================================== */}
              {activeTab === 'signup' && (
                <form onSubmit={handleCustomerSignup}>
                  {/* Full Name */}
                  <div style={{ marginBottom: '11px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Enter full name"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div style={{ marginBottom: '11px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: '11px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        style={{ width: '100%', padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        style={{ width: '100%', padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    id="btn-signup-submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Already have an account? Login */}
                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.86rem', color: '#64748b' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      Login
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================== */}
              {/* 3. DISTINCT SECURE ADMIN LOGIN INTERFACE        */}
              {/* ============================================== */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminLogin}>
                  {/* Security Notice Card */}
                  <div style={{
                    background: '#0f291e',
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ShieldCheck size={20} color="#fbbf24" />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.84rem', color: '#fbbf24', letterSpacing: '0.2px' }}>
                        Authorized Admin Access
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                        Nursery stock, pricing, and orders dashboard.
                      </span>
                    </div>
                  </div>

                  {/* Admin Email / Username */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Admin Email / Username *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="admin-email-input"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@ganapathigardens.com"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outlineColor: '#0f291e',
                          boxSizing: 'border-box',
                          background: '#f8fafc'
                        }}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  {/* Admin Password */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Admin Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        id="admin-password-input"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
                        style={{
                          width: '100%',
                          padding: '11px 38px 11px 38px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outlineColor: '#0f291e',
                          boxSizing: 'border-box',
                          background: '#f8fafc'
                        }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}
                        aria-label="Toggle password visibility"
                      >
                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Admin Submit Button */}
                  <button
                    type="submit"
                    id="btn-admin-login-submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'linear-gradient(135deg, #14532d 0%, #0f291e 100%)',
                      color: '#fbbf24',
                      border: '1px solid #22c55e',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(15, 41, 30, 0.4)',
                      letterSpacing: '0.3px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Key size={16} />
                    <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}</span>
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}
                    >
                      ← Switch to Customer Login
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================== */}
              {/* 4. FORGOT PASSWORD FORM                         */}
              {/* ============================================== */}
              {activeTab === 'forgot' && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#14532d', fontWeight: 700 }}>
                    Reset Your Password
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.5 }}>
                    Enter your registered email or mobile number and we will send password reset assistance:
                  </p>
                  <input
                    type="text"
                    placeholder="Enter email or mobile"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', marginBottom: '14px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMsg('Reset instructions sent to your registered contact!');
                      setTimeout(() => setActiveTab('login'), 2200);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Send Reset Link
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}

              {/* Guest Explore Option */}
              {onProceedAsGuest && (
                <div style={{
                  marginTop: '22px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                  textAlign: 'center'
                }}>
                  <button
                    type="button"
                    onClick={onProceedAsGuest}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#16a34a',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.84rem'
                    }}
                  >
                    Explore Plant Catalog as Guest →
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Clean Footer Strip */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        padding: '16px 32px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.8rem',
        color: 'rgba(255, 255, 255, 0.75)'
      }}>
        © {new Date().getFullYear()} Ganapathi Gardens Plant Nursery. All rights reserved. Cheediga, Kakinada, Andhra Pradesh.
      </footer>
    </div>
  );
}
