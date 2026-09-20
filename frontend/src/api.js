// API Client for Ganapathi Gardens Plant Nursery & Admin Portal

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getCustomerAuthHeader() {
  const token = localStorage.getItem('ganapathi_customer_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function getAdminAuthHeader() {
  const token = localStorage.getItem('ganapathi_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ----------------------------------------------------
// 1. CUSTOMER AUTHENTICATION
// ----------------------------------------------------
export async function customerSignup(data) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function customerLogin(identifier, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  return res.json();
}

export async function fetchCustomerProfile() {
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { ...getCustomerAuthHeader() }
  });
  return res.json();
}

export async function updateCustomerProfile(data) {
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getCustomerAuthHeader() },
    body: JSON.stringify(data)
  });
  return res.json();
}

// ----------------------------------------------------
// 2. ADMIN AUTHENTICATION
// ----------------------------------------------------
export async function adminLogin(email, password) {
  const res = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function adminChangePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/admin/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return res.json();
}

// ----------------------------------------------------
// 3. PRODUCTS (MongoDB Dynamic Catalog)
// ----------------------------------------------------
export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, val);
    }
  });

  const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify(productData)
  });
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify(productData)
  });
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}

// ----------------------------------------------------
// 4. CATEGORIES & OFFERS
// ----------------------------------------------------
export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  return res.json();
}

export async function fetchOffers() {
  const res = await fetch(`${BASE_URL}/offers`);
  return res.json();
}

export async function createOffer(offerData) {
  const res = await fetch(`${BASE_URL}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify(offerData)
  });
  return res.json();
}

export async function applyCoupon(code, subtotal = 0) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (cleanCode === 'MONSOON20') {
    const discount = Math.round(subtotal * 0.2);
    return { success: true, code: cleanCode, discount, message: `Coupon ${cleanCode} applied! Saved ₹${discount}` };
  } else if (cleanCode === 'GREENHOME') {
    const discount = Math.round(subtotal * 0.1);
    return { success: true, code: cleanCode, discount, message: `Coupon ${cleanCode} applied! Saved ₹${discount}` };
  }
  return { success: false, message: 'Invalid coupon code. Try MONSOON20 or GREENHOME.' };
}

// ----------------------------------------------------
// 5. ORDERS & CANCELLATION
// ----------------------------------------------------
export async function placeOrder(orderData) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function fetchMyOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/orders/my-orders?${query}`);
  return res.json();
}

export async function fetchOrderDetails(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`);
  return res.json();
}

export async function trackOrder(orderId) {
  const cleanId = (orderId || '').trim().replace('#', '');
  const res = await fetch(`${BASE_URL}/orders/track/${cleanId}`);
  return res.json();
}

export async function cancelOrder(orderId, cancellationReason) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancellationReason })
  });
  return res.json();
}

export async function fetchAdminOrders() {
  const res = await fetch(`${BASE_URL}/admin/orders`, {
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}

export async function updateOrderStatus(orderId, status, note) {
  const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify({ status, note })
  });
  return res.json();
}

// ----------------------------------------------------
// 6. BUSINESS INFORMATION & DELIVERY CHARGES
// ----------------------------------------------------
export async function fetchBusinessInfo() {
  const res = await fetch(`${BASE_URL}/business-info`);
  return res.json();
}

export async function updateBusinessInfo(infoData) {
  const res = await fetch(`${BASE_URL}/business-info`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify(infoData)
  });
  return res.json();
}

export async function calculateDelivery(pincode, subtotal = 500, hasLargePlant = false) {
  const res = await fetch(`${BASE_URL}/delivery/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pincode, subtotal, hasLargePlant })
  });
  return res.json();
}

// ----------------------------------------------------
// 7. CONTACT MESSAGES
// ----------------------------------------------------
export async function submitContactMessage(msgData) {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msgData)
  });
  return res.json();
}

export async function fetchContactMessages() {
  const res = await fetch(`${BASE_URL}/admin/contact-messages`, {
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}

// ----------------------------------------------------
// 8. ADMIN DASHBOARD STATS
// ----------------------------------------------------
export async function fetchAdminStats() {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}

export async function uploadImage(base64Data, filename = 'plant.jpg') {
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
    body: JSON.stringify({ image: base64Data, filename })
  });
  return res.json();
}

// ----------------------------------------------------
// 10. RAG CHATBOT (AI Assistant GreenBot)
// ----------------------------------------------------
export async function sendChatMessage(message, conversationId = 'default_conv', history = []) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message, 
      conversation_id: conversationId,
      conversationId,
      history 
    })
  });
  return res.json();
}

export async function fetchRagStatus() {
  const res = await fetch(`${BASE_URL}/admin/rag/status`, {
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}

export async function triggerRagSync() {
  const res = await fetch(`${BASE_URL}/admin/rag/sync`, {
    method: 'POST',
    headers: { ...getAdminAuthHeader() }
  });
  return res.json();
}


