import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Truck, 
  Layers, 
  Tag, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Save, 
  RefreshCw,
  X,
  Lock,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  DollarSign,
  Key,
  ShieldCheck,
  ExternalLink,
  Eye,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { 
  adminLogin,
  adminChangePassword,
  fetchAdminStats, 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  fetchAdminOrders,
  updateOrderStatus,
  fetchBusinessInfo,
  updateBusinessInfo,
  fetchOffers,
  createOffer,
  fetchContactMessages,
  uploadImage
} from '../api';

export default function AdminPortal({ onExitAdmin, onProductUpdated }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('ganapathi_admin_token'));
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ganapathi_admin_user'));
    } catch {
      return null;
    }
  });

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Change password states
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Dashboard & Management states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalError, setProductModalError] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    botanicalName: '',
    category: 'Indoor Plants',
    plantType: 'Indoor',
    description: '',
    mainImage: '',
    imagesStr: '',
    size: 'Medium',
    height: '2 Feet',
    potSize: '8 Inch Pot',
    originalPrice: 300,
    discount: 10,
    price: 270,
    stock: 20,
    availability: 'In Stock',
    sunlight: 'Bright Indirect Sunlight',
    waterRequirement: 'Water when top 1-2 inches dry',
    careInstructions: 'Apply organic vermicompost every 3-4 weeks.',
    badge: ''
  });

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleMainImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const res = await uploadImage(base64, file.name);
        if (res.success && res.url) {
          setProductForm(prev => ({ ...prev, mainImage: res.url }));
        } else {
          setProductForm(prev => ({ ...prev, mainImage: base64 }));
        }
        showToast('Plant image uploaded successfully!');
      } catch (err) {
        setProductForm(prev => ({ ...prev, mainImage: reader.result }));
        showToast('Image loaded directly from file.');
      } finally {
        setUploadingMain(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const base64 = await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(file);
        });
        try {
          const apiRes = await uploadImage(base64, file.name);
          if (apiRes.success && apiRes.url) {
            uploadedUrls.push(apiRes.url);
          } else {
            uploadedUrls.push(base64);
          }
        } catch {
          uploadedUrls.push(base64);
        }
      }
      setProductForm(prev => {
        const existing = prev.imagesStr ? prev.imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        const combined = [...existing, ...uploadedUrls].join(', ');
        return { ...prev, imagesStr: combined };
      });
      showToast(`${files.length} gallery image(s) uploaded successfully!`);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Selected Order for Modal
  const [viewingOrder, setViewingOrder] = useState(null);

  // New Offer Modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    code: '',
    discountPercent: 15,
    description: '',
    badgeText: 'NURSERY DEAL'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodsRes, ordersRes, infoRes, offersRes, msgsRes] = await Promise.all([
        fetchAdminStats(),
        fetchProducts(),
        fetchAdminOrders(),
        fetchBusinessInfo(),
        fetchOffers(),
        fetchContactMessages()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodsRes.success) setProducts(prodsRes.products || []);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (infoRes.success) setBusinessData(infoRes.businessInfo);
      if (offersRes.success) setOffers(offersRes.offers || []);
      if (msgsRes.success) setContactMessages(msgsRes.messages || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadPortalData();
    }
  }, [adminToken]);

  // Handle Admin Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await adminLogin(loginEmail, loginPassword);
      if (res.success && res.token) {
        localStorage.setItem('ganapathi_admin_token', res.token);
        localStorage.setItem('ganapathi_admin_user', JSON.stringify(res.admin));
        setAdminToken(res.token);
        setAdminUser(res.admin);
        showToast('Welcome to Ganapathi Gardens Admin Portal!');
      } else {
        setLoginError(res.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setLoginError('Error connecting to backend authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('ganapathi_admin_token');
    localStorage.removeItem('ganapathi_admin_user');
    setAdminToken(null);
    setAdminUser(null);
    onExitAdmin();
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    try {
      const res = await adminChangePassword(currentPw, newPw);
      if (res.success) {
        setPwSuccess('Password changed successfully!');
        setCurrentPw('');
        setNewPw('');
      } else {
        setPwError(res.message || 'Could not change password.');
      }
    } catch (err) {
      setPwError('Error connecting to server.');
    }
  };

  // Save / Update Product
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      botanicalName: '',
      category: 'Indoor Plants',
      plantType: 'Indoor',
      description: '',
      mainImage: '',
      imagesStr: '',
      size: 'Medium',
      height: '2 Feet',
      potSize: '8 Inch Nursery Pot',
      originalPrice: 300,
      discount: 10,
      price: 270,
      stock: 20,
      availability: 'In Stock',
      sunlight: 'Bright Indirect Sunlight',
      waterRequirement: 'Water when top 1-2 inches dry',
      careInstructions: 'Apply organic vermicompost every 3-4 weeks.',
      badge: ''
    });
    setProductModalError('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      botanicalName: prod.botanicalName || '',
      category: prod.category,
      plantType: prod.plantType || 'Indoor',
      description: prod.description || '',
      mainImage: prod.mainImage || prod.images?.[0] || '',
      imagesStr: (prod.images || []).join(', '),
      size: prod.size || 'Medium',
      height: prod.height || '2 Feet',
      potSize: prod.potSize || '8 Inch Pot',
      originalPrice: prod.originalPrice || prod.price || 300,
      discount: prod.discount || 0,
      price: prod.finalPrice || prod.price || 270,
      stock: prod.stock !== undefined ? prod.stock : 10,
      availability: prod.availability || 'In Stock',
      sunlight: prod.sunlight || 'Bright Indirect Sunlight',
      waterRequirement: prod.waterRequirement || prod.water || 'Weekly',
      careInstructions: prod.careInstructions || '',
      badge: prod.badge || ''
    });
    setProductModalError('');
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    setProductModalError('');
    const imgs = productForm.imagesStr
      ? productForm.imagesStr.split(',').map(s => s.trim()).filter(Boolean)
      : [productForm.mainImage];

    if (productForm.mainImage && !imgs.includes(productForm.mainImage)) {
      imgs.unshift(productForm.mainImage);
    }

    const payload = {
      ...productForm,
      images: imgs,
      originalPrice: Number(productForm.originalPrice),
      discount: Number(productForm.discount),
      stock: Number(productForm.stock)
    };

    try {
      if (editingProduct) {
        const id = editingProduct.id || editingProduct._id;
        const res = await updateProduct(id, payload);
        if (res.success) {
          showToast(`"${payload.name}" updated in MongoDB!`);
          setIsProductModalOpen(false);
          loadPortalData();
          if (onProductUpdated) onProductUpdated();
        } else {
          setProductModalError(res.message || 'Error updating plant product.');
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          showToast(`New plant "${payload.name}" added to Ganapathi Gardens catalog!`);
          setIsProductModalOpen(false);
          loadPortalData();
          if (onProductUpdated) onProductUpdated();
        } else {
          setProductModalError(res.message || 'Error creating plant product.');
        }
      }
    } catch (err) {
      setProductModalError(err.message || 'Network error connecting to Ganapathi Gardens server.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from Ganapathi Gardens catalog?`)) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        showToast(`"${name}" deleted from database.`);
        loadPortalData();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      alert('Error deleting plant.');
    }
  };

  // Update Order Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} by admin.`);
      if (res.success) {
        showToast(`Order #${orderId} status changed to ${newStatus}`);
        loadPortalData();
        if (viewingOrder && (viewingOrder.orderNumber === orderId || viewingOrder._id === orderId)) {
          setViewingOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  // Business Info & Delivery Charges update
  const handleSaveBusinessInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await updateBusinessInfo(businessData);
      if (res.success) {
        showToast('Ganapathi Gardens information & delivery rates updated successfully!');
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Error saving nursery details.');
    }
  };

  // Add Offer
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await createOffer(offerForm);
      if (res.success) {
        showToast('New Offer added to customer store!');
        setIsOfferModalOpen(false);
        loadPortalData();
      }
    } catch (err) {
      alert('Error adding offer.');
    }
  };

  // ----------------------------------------------------
  // RENDER: 1. ADMIN LOGIN VIEW (if unauthenticated)
  // ----------------------------------------------------
  if (!adminToken) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '36px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #16a34a, #166534)', borderRadius: '14px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', fontSize: '26px' }}>
              🌿
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', margin: '0 0 6px 0' }}>
              Ganapathi Gardens Admin
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Owner Portal • Cheediga, Kakinada
            </p>
          </div>

          {loginError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', color: '#b91c1c', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                placeholder="admin@ganapathigardens.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#166534',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loginLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {loginLoading ? 'Verifying...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onExitAdmin}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={14} /> Back to Customer Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: 2. MAIN ADMIN PORTAL DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="admin-portal-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#166534', color: '#fff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', zIndex: 10000, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Admin Bar */}
      <div style={{ background: '#14532d', color: '#ffffff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🌿</span>
          <div>
            <strong style={{ fontSize: '1.15rem' }}>Ganapathi Gardens — Owner Admin Portal</strong>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block' }}>Cheediga, Kakinada • Live Database Management</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={loadPortalData}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} />
            <span>Sync Data</span>
          </button>

          <button
            onClick={onExitAdmin}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} />
            <span>View Website</span>
          </button>

          <button
            onClick={handleAdminLogout}
            style={{ background: '#dc2626', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar + Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <aside style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={17} /> },
              { id: 'products', label: 'Products Catalog', icon: <Package size={17} /> },
              { id: 'orders', label: 'Customer Orders', icon: <Truck size={17} /> },
              { id: 'offers', label: 'Offers & Discounts', icon: <Tag size={17} /> },
              { id: 'business', label: 'Business & Delivery', icon: <MapPin size={17} /> },
              { id: 'messages', label: 'Customer Inquiries', icon: <MessageSquare size={17} /> },
              { id: 'password', label: 'Change Password', icon: <Key size={17} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? '#f0fdf4' : 'transparent',
                  color: activeTab === tab.id ? '#166534' : '#475569',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ padding: '28px', overflowY: 'auto' }}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Nursery Performance Overview
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                    Live status of plant stock, incoming orders, and revenue
                  </p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  style={{
                    background: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Plant</span>
                </button>
              </div>

              {/* 8 Metric Cards from Prompt */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Products</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#166534', marginTop: '4px' }}>
                    {stats?.totalProducts ?? products.length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Customers</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#0284c7', marginTop: '4px' }}>
                    {stats?.totalCustomers ?? 8}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Orders</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1e293b', marginTop: '4px' }}>
                    {stats?.totalOrders ?? orders.length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Pending Orders</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#eab308', marginTop: '4px' }}>
                    {stats?.pendingOrders ?? orders.filter(o => o.status === 'Order Placed' || o.status === 'Confirmed').length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Processing Orders</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#f97316', marginTop: '4px' }}>
                    {stats?.processingOrders ?? orders.filter(o => o.status === 'Processing' || o.status === 'Packed' || o.status === 'Out for Delivery').length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Delivered Orders</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#16a34a', marginTop: '4px' }}>
                    {stats?.deliveredOrders ?? orders.filter(o => o.status === 'Delivered').length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Cancelled Orders</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#dc2626', marginTop: '4px' }}>
                    {stats?.cancelledOrders ?? orders.filter(o => o.status === 'Cancelled').length}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Nursery Sales</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: '#166534', marginTop: '4px' }}>
                    ₹{stats?.totalSales ?? orders.reduce((acc, o) => o.status !== 'Cancelled' ? acc + (o.totalAmount || 0) : acc, 0)}
                  </strong>
                </div>
              </div>

              {/* Quick Table of Recent Orders */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                  Recent Orders
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 12px' }}>Order #</th>
                        <th style={{ padding: '10px 12px' }}>Customer</th>
                        <th style={{ padding: '10px 12px' }}>Phone</th>
                        <th style={{ padding: '10px 12px' }}>Total Amount</th>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                        <th style={{ padding: '10px 12px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.orderNumber || o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#166534' }}>#{o.orderNumber}</td>
                          <td style={{ padding: '12px' }}>{o.customerName}</td>
                          <td style={{ padding: '12px' }}>{o.phone}</td>
                          <td style={{ padding: '12px', fontWeight: 700 }}>₹{o.totalAmount}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: o.status === 'Delivered' ? '#15803d' : o.status === 'Cancelled' ? '#b91c1c' : '#854d0e' }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => setViewingOrder(o)}
                              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG (Add, Edit, Delete, Stock) */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Plant Catalog Management
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                    Edits made here instantly reflect in MongoDB and on the live customer website.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  style={{
                    background: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Plant</span>
                </button>
              </div>

              {/* Products Table */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Plant</th>
                      <th style={{ padding: '12px' }}>Category</th>
                      <th style={{ padding: '12px' }}>Size & Pot</th>
                      <th style={{ padding: '12px' }}>Original Price</th>
                      <th style={{ padding: '12px' }}>Discount</th>
                      <th style={{ padding: '12px' }}>Final Price</th>
                      <th style={{ padding: '12px' }}>Stock</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id || p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.mainImage || p.images?.[0]} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                              <strong style={{ display: 'block', color: '#0f172a' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.plantType || 'Indoor'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{p.category}</td>
                        <td style={{ padding: '12px' }}>{p.size} • {p.potSize || 'Pot'}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>₹{p.originalPrice || p.price}</td>
                        <td style={{ padding: '12px', color: '#16a34a', fontWeight: 600 }}>{p.discount || 0}%</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#166534' }}>₹{p.finalPrice || p.price}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, background: p.stock > 0 ? '#dcfce7' : '#fee2e2', color: p.stock > 0 ? '#15803d' : '#b91c1c' }}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Edit Plant"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id || p._id, p.name)}
                              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Delete Plant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Customer Orders Management
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                    Track, verify, update delivery statuses, and handle customer cancellations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.orderNumber || order._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: '#166534' }}>
                          ORDER #{order.orderNumber}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '12px' }}>
                          Customer: <strong>{order.customerName}</strong> ({order.phone})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Change Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.orderNumber || order._id, e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#166534' }}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => setViewingOrder(order)}
                          style={{ background: '#166534', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>

                    {/* Order mini item summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#334155' }}>
                      <div>
                        {(order.products || order.items || []).map((p, idx) => (
                          <span key={idx} style={{ marginRight: '14px' }}>
                            • <strong>{p.name}</strong> ({p.size}, Qty: {p.quantity})
                          </span>
                        ))}
                      </div>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.05rem' }}>
                        Total: ₹{order.totalAmount || order.total}
                      </div>
                    </div>

                    {order.status === 'Cancelled' && (
                      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#991b1b', marginTop: '10px' }}>
                        <strong>Cancellation Reason:</strong> {order.cancellationReason || 'Cancelled by customer'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFERS & DISCOUNTS */}
          {activeTab === 'offers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Offers & Discounts Management
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                    Create seasonal discount codes that apply automatically at cart and checkout.
                  </p>
                </div>

                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  style={{ background: '#166534', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>Create New Offer</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {offers.map(off => (
                  <div key={off.id || off.code} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {off.badgeText || `${off.discountPercent}% OFF`}
                      </span>
                      <strong style={{ color: '#166534', fontSize: '1.1rem' }}>{off.code}</strong>
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: '1rem' }}>{off.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>{off.description}</p>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      Discount: <strong>{off.discountPercent}% OFF</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BUSINESS INFORMATION & DELIVERY CHARGES */}
          {activeTab === 'business' && businessData && (
            <div style={{ maxWidth: '780px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Ganapathi Gardens Business Information & Delivery Charges
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                  Manage nursery address, phone, WhatsApp, opening hours, and transport charges.
                </p>
              </div>

              <form onSubmit={handleSaveBusinessInfo} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Business Name</label>
                  <input
                    type="text"
                    value={businessData.businessName || ''}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Nursery Address</label>
                  <textarea
                    rows={2}
                    value={businessData.address || ''}
                    onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Contact Phone</label>
                    <input
                      type="text"
                      value={businessData.contactNumber || ''}
                      onChange={(e) => setBusinessData({ ...businessData, contactNumber: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>WhatsApp Number</label>
                    <input
                      type="text"
                      value={businessData.whatsapp || ''}
                      onChange={(e) => setBusinessData({ ...businessData, whatsapp: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Nursery Opening Hours</label>
                  <input
                    type="text"
                    value={businessData.openingHours || ''}
                    onChange={(e) => setBusinessData({ ...businessData, openingHours: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Google Maps Link</label>
                  <input
                    type="text"
                    value={businessData.mapLink || ''}
                    onChange={(e) => setBusinessData({ ...businessData, mapLink: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Configurable Delivery Areas & Charges */}
                <h3 style={{ fontSize: '1.05rem', margin: '20px 0 12px 0', color: '#166534', fontWeight: 700 }}>
                  🚚 Configurable Transport / Delivery Charges:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {(businessData.deliveryAreas || []).map((area, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => {
                          const updated = [...businessData.deliveryAreas];
                          updated[idx].name = e.target.value;
                          setBusinessData({ ...businessData, deliveryAreas: updated });
                        }}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <input
                        type="number"
                        value={area.charge}
                        onChange={(e) => {
                          const updated = [...businessData.deliveryAreas];
                          updated[idx].charge = Number(e.target.value);
                          setBusinessData({ ...businessData, deliveryAreas: updated });
                        }}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        value={area.estimatedDelivery || ''}
                        onChange={(e) => {
                          const updated = [...businessData.deliveryAreas];
                          updated[idx].estimatedDelivery = e.target.value;
                          setBusinessData({ ...businessData, deliveryAreas: updated });
                        }}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  style={{ background: '#166534', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Business Details & Rates
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: CUSTOMER MESSAGES / INQUIRIES */}
          {activeTab === 'messages' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                Customer Contact Inquiries
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {contactMessages.map(msg => (
                  <div key={msg.id || msg._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#166534' }}>{msg.name} ({msg.mobile})</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(msg.createdAt || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {msg.email && <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '6px' }}>Email: {msg.email}</div>}
                    <div style={{ fontSize: '0.86rem', color: '#1e293b', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      "{msg.message}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div style={{ maxWidth: '440px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                Change Admin Password
              </h2>

              {pwSuccess && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '10px 14px', borderRadius: '8px', color: '#15803d', fontSize: '0.84rem', marginBottom: '14px' }}>
                  {pwSuccess}
                </div>
              )}
              {pwError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', color: '#b91c1c', fontSize: '0.84rem', marginBottom: '14px' }}>
                  {pwError}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Current Admin Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>New Admin Password *</label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min 6 characters"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ width: '100%', padding: '12px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PLANT PRODUCT                      */}
      {/* ---------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', width: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#166534', fontWeight: 800 }}>
                {editingProduct ? `Edit Plant: ${editingProduct.name}` : 'Add New Plant to Catalog'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {productModalError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{productModalError}</span>
              </div>
            )}

            <form onSubmit={handleProductFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Plant Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Red Rose Plant"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  >
                    <option value="Indoor Plants">Indoor Plants</option>
                    <option value="Outdoor Plants">Outdoor Plants</option>
                    <option value="Flowering Plants">Flowering Plants</option>
                    <option value="Fruit Plants">Fruit Plants</option>
                    <option value="Air-Purifying Plants">Air-Purifying Plants</option>
                    <option value="Gardening Products">Gardening Products</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Plant Type</label>
                  <select
                    value={productForm.plantType}
                    onChange={(e) => setProductForm({ ...productForm, plantType: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Air-Purifying">Air-Purifying</option>
                    <option value="Gardening Products">Gardening Products</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Plant Size</label>
                  <input
                    type="text"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    placeholder="e.g. Medium"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Plant Height</label>
                  <input
                    type="text"
                    value={productForm.height}
                    onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                    placeholder="e.g. 2 Feet"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Pot Size</label>
                  <input
                    type="text"
                    value={productForm.potSize}
                    onChange={(e) => setProductForm({ ...productForm, potSize: e.target.value })}
                    placeholder="e.g. 8 Inches"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.originalPrice}
                    onChange={(e) => {
                      const orig = Number(e.target.value);
                      const disc = Number(productForm.discount) || 0;
                      const finalP = disc > 0 ? Math.round(orig * (1 - disc / 100)) : orig;
                      setProductForm({ ...productForm, originalPrice: orig, price: finalP });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => {
                      const disc = Number(e.target.value) || 0;
                      const orig = Number(productForm.originalPrice);
                      const finalP = disc > 0 ? Math.round(orig * (1 - disc / 100)) : orig;
                      setProductForm({ ...productForm, discount: disc, price: finalP });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Calculated Final (₹)</label>
                  <input
                    type="number"
                    disabled
                    value={productForm.price}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, color: '#166534', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Availability</label>
                  <select
                    value={productForm.availability}
                    onChange={(e) => setProductForm({ ...productForm, availability: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Main Plant Image Upload & URL */}
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#14532d', marginBottom: '6px' }}>
                  Main Plant Image *
                </label>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: uploadingMain ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                  }}>
                    <Upload size={14} />
                    <span>{uploadingMain ? 'Uploading...' : 'Upload Plant Photo File'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={uploadingMain}
                      onChange={handleMainImageFileUpload}
                      style={{ display: 'none' }} 
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or paste an image link below</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    value={productForm.mainImage}
                    onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                    placeholder="Plant image URL or file path (e.g. /uploads/plant.jpg)"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                  {productForm.mainImage && (
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, mainImage: '' })}
                      style={{ padding: '8px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {productForm.mainImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={productForm.mainImage} 
                      alt="Plant Preview" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #86efac' }} 
                    />
                    <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>✓ Image Preview Active</span>
                  </div>
                )}
              </div>

              {/* Additional Gallery Images */}
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#14532d', marginBottom: '6px' }}>
                  Additional Gallery Images
                </label>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#047857',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: uploadingGallery ? 'not-allowed' : 'pointer'
                  }}>
                    <Upload size={14} />
                    <span>{uploadingGallery ? 'Uploading Photos...' : 'Upload Multiple Gallery Files'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      disabled={uploadingGallery}
                      onChange={handleGalleryFilesUpload}
                      style={{ display: 'none' }} 
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Select one or multiple photos</span>
                </div>

                <input
                  type="text"
                  value={productForm.imagesStr}
                  onChange={(e) => setProductForm({ ...productForm, imagesStr: e.target.value })}
                  placeholder="Comma separated URLs: /uploads/img1.jpg, /uploads/img2.jpg"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />

                {productForm.imagesStr && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {productForm.imagesStr.split(',').map((imgUrl, idx) => {
                      const trimmed = imgUrl.trim();
                      if (!trimmed) return null;
                      return (
                        <div key={idx} style={{ position: 'relative', width: '45px', height: '45px' }}>
                          <img 
                            src={trimmed} 
                            alt={`Gallery ${idx + 1}`} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = productForm.imagesStr.split(',').map(s => s.trim()).filter(Boolean);
                              list.splice(idx, 1);
                              setProductForm({ ...productForm, imagesStr: list.join(', ') });
                            }}
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                            title="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Plant Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Sunlight Requirement</label>
                  <input
                    type="text"
                    value={productForm.sunlight}
                    onChange={(e) => setProductForm({ ...productForm, sunlight: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Water Requirement</label>
                  <input
                    type="text"
                    value={productForm.waterRequirement}
                    onChange={(e) => setProductForm({ ...productForm, waterRequirement: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Care Instructions</label>
                <input
                  type="text"
                  value={productForm.careInstructions}
                  onChange={(e) => setProductForm({ ...productForm, careInstructions: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#166534', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingProduct ? 'Save Changes to MongoDB' : 'ADD PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: VIEW ORDER DETAILS (ADMIN)                   */}
      {/* ---------------------------------------------------- */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)} style={{ zIndex: 10000 }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#166534', fontWeight: 800 }}>
                  Order #{viewingOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Customer: <strong>{viewingOrder.customerName}</strong> ({viewingOrder.phone})
                </span>
              </div>
              <button onClick={() => setViewingOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div><strong>Address:</strong> {viewingOrder.address}, {viewingOrder.area}, {viewingOrder.city} - {viewingOrder.pincode}</div>
              <div><strong>Email:</strong> {viewingOrder.email || 'N/A'}</div>
              <div><strong>Payment:</strong> {viewingOrder.paymentMethod || 'Cash on Delivery'}</div>
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#166534' }}>Ordered Plants:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(viewingOrder.products || viewingOrder.items || []).map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <strong>{p.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b' }}>Size: {p.size} • Pot: {p.potSize || 'Standard'}</span>
                    </div>
                  </div>
                  <div>
                    <span>Qty: {p.quantity}</span> | <strong>₹{p.price * p.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span><strong>₹{viewingOrder.subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transport Charge:</span><strong>₹{viewingOrder.transportCharge || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #86efac', paddingTop: '6px', marginTop: '4px', fontSize: '1.1rem', color: '#166534', fontWeight: 800 }}>
                <span>Total Amount:</span><span>₹{viewingOrder.totalAmount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select
                value={viewingOrder.status}
                onChange={(e) => handleUpdateStatus(viewingOrder.orderNumber || viewingOrder._id, e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#166534' }}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setViewingOrder(null)}
                style={{ background: '#166534', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE NEW OFFER                              */}
      {/* ---------------------------------------------------- */}
      {isOfferModalOpen && (
        <div className="modal-overlay" onClick={() => setIsOfferModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#166534', fontWeight: 800 }}>
              Create New Nursery Offer
            </h3>
            <form onSubmit={handleCreateOffer}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Rose Festival"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROSE15"
                    value={offerForm.code}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Discount (%) *</label>
                  <input
                    type="number"
                    required
                    value={offerForm.discountPercent}
                    onChange={(e) => setOfferForm({ ...offerForm, discountPercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>Offer Description</label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Applies to all outdoor and flowering rose bushes..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#166534', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
