import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          Cookies.set('access_token', access_token, { expires: 7 });
          Cookies.set('refresh_token', refresh_token, { expires: 30 });
          
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api.request(error.config);
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Functions
export const apiClient = {
  // Auth
  register: async (data: any) => {
    return api.post('/auth/register', data);
  },
  login: async (data: any) => {
    return api.post('/auth/login', data);
  },
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refresh_token: refreshToken }),

  // Classifications
  createClassification: (data: any) => api.post('/classify/', data),
  getClassifications: () => api.get('/classify/'),
  uploadImage: (classificationId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/classify/upload-image/${classificationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Disposal
  createDisposal: async (data: any) => {
    console.log('API: Creating disposal with data:', data);
    try {
      const response = await api.post('/disposal/', data);
      console.log('API: Disposal created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('API: Disposal creation failed:', error.response?.data || error.message);
      throw error;
    }
  },
  getDisposals: () => api.get('/disposal/'),
  getVendors: (vendorType: string) => api.get(`/disposal/vendors?vendor_type=${vendorType}`),

  // Donations
  createDonation: (data: any) => api.post('/donate/', data),
  getDonations: () => api.get('/donate/'),
  getDonationOrganizations: () => api.get('/donate/organizations'),

  // Marketplace
  createMarketplaceItem: (data: any) => api.post('/marketplace/', data),
  getMarketplaceItems: (isSelling?: boolean, categoryId?: number) => {
    const params = new URLSearchParams();
    if (isSelling !== undefined) params.append('is_selling', isSelling.toString());
    if (categoryId !== undefined) params.append('category_id', categoryId.toString());
    const queryString = params.toString();
    return api.get(`/marketplace/${queryString ? '?' + queryString : ''}`);
  },
  getMyMarketplaceItems: () => api.get('/marketplace/my-items'),
  getCategories: () => api.get('/marketplace/categories'),
  purchaseItem: (purchaseData: any) => api.post('/marketplace/purchase', purchaseData),
  downloadReceipt: (purchaseId: number) => api.get(`/marketplace/receipt/${purchaseId}`, { responseType: 'blob' }),

  // Repair
  getRepairShops: (repairType: string) => api.get(`/repair/shops?repair_type=${repairType}`),
  getRepairFaq: () => api.get('/repair/faq'),

  // Admin
  initAdmin: () => api.post('/admin/init-admin'),
  getAllUsers: () => api.get('/admin/users'),
  createAdmin: (data: any) => api.post('/admin/create-admin', data),
};

