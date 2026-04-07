import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://10.86.1.119:5000/api"; // Android emulator -> localhost
// const BASE_URL = 'http://YOUR_LOCAL_IP:5000/api'; // Physical device
const API_ORIGIN = BASE_URL.replace(/\/api$/, '');

const getHeaders = async (isMultipart = false) => {
  const token = await AsyncStorage.getItem('token');
  const headers = {};
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  let data = {};

  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const resolveAssetUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url.replace(/^\/+/, '')}`;
};

export const api = {
  // AUTH
  farmerRegister: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/farmer/register`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  consumerRegister: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/consumer/register`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  farmerLogin: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/farmer/login`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  consumerLogin: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/consumer/login`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  sendOTP: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  resetPassword: async (body) => handleResponse(await fetch(`${BASE_URL}/auth/reset-password`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),

  // LISTINGS
  getListings: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return handleResponse(await fetch(`${BASE_URL}/listings${qs ? '?' + qs : ''}`, { headers: await getHeaders() }));
  },
  getListing: async (id) => handleResponse(await fetch(`${BASE_URL}/listings/${id}`, { headers: await getHeaders() })),
  getMyListings: async () => handleResponse(await fetch(`${BASE_URL}/listings/my`, { headers: await getHeaders() })),
  getCategories: async () => handleResponse(await fetch(`${BASE_URL}/listings/categories`, { headers: await getHeaders() })),
  createListing: async (formData) => handleResponse(await fetch(`${BASE_URL}/listings`, { method: 'POST', headers: await getHeaders(true), body: formData })),
  updateListing: async (id, body) => handleResponse(await fetch(`${BASE_URL}/listings/${id}`, { method: 'PUT', headers: await getHeaders(), body: JSON.stringify(body) })),
  deleteListing: async (id) => handleResponse(await fetch(`${BASE_URL}/listings/${id}`, { method: 'DELETE', headers: await getHeaders() })),

  // ORDERS
  placeOrder: async (body) => handleResponse(await fetch(`${BASE_URL}/orders`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  getConsumerOrders: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return handleResponse(await fetch(`${BASE_URL}/orders/consumer${qs ? '?' + qs : ''}`, { headers: await getHeaders() }));
  },
  getFarmerOrders: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return handleResponse(await fetch(`${BASE_URL}/orders/farmer${qs ? '?' + qs : ''}`, { headers: await getHeaders() }));
  },
  getFarmerEarnings: async () => handleResponse(await fetch(`${BASE_URL}/orders/farmer/earnings`, { headers: await getHeaders() })),
  updateOrderStatus: async (id, status) => handleResponse(await fetch(`${BASE_URL}/orders/${id}/status`, { method: 'PUT', headers: await getHeaders(), body: JSON.stringify({ status }) })),

  // CART
  getCart: async () => handleResponse(await fetch(`${BASE_URL}/cart`, { headers: await getHeaders() })),
  addToCart: async (body) => handleResponse(await fetch(`${BASE_URL}/cart`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  removeFromCart: async (id) => handleResponse(await fetch(`${BASE_URL}/cart/${id}`, { method: 'DELETE', headers: await getHeaders() })),
  clearCart: async () => handleResponse(await fetch(`${BASE_URL}/cart/clear`, { method: 'DELETE', headers: await getHeaders() })),

  // REVIEWS
  addReview: async (body) => handleResponse(await fetch(`${BASE_URL}/reviews`, { method: 'POST', headers: await getHeaders(), body: JSON.stringify(body) })),
  getFarmerReviews: async (farmer_id) => handleResponse(await fetch(`${BASE_URL}/reviews/farmer/${farmer_id}`, { headers: await getHeaders() })),

  // PROFILE
  getFarmerProfile: async (id) => handleResponse(await fetch(`${BASE_URL}/profile/farmer${id ? '/' + id : ''}`, { headers: await getHeaders() })),
  getConsumerProfile: async () => handleResponse(await fetch(`${BASE_URL}/profile/consumer`, { headers: await getHeaders() })),
  updateFarmerProfile: async (formData) => handleResponse(await fetch(`${BASE_URL}/profile/farmer`, { method: 'PUT', headers: await getHeaders(true), body: formData })),
  updateConsumerProfile: async (formData) => handleResponse(await fetch(`${BASE_URL}/profile/consumer`, { method: 'PUT', headers: await getHeaders(true), body: formData })),
};
