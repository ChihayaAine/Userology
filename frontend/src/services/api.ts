import axios from 'axios';

// 优先使用环境变量，否则使用本地开发地址
// 生产环境: http://47.93.101.73:8090/api
// 本地开发: http://localhost:8090/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 Environment API URL:', process.env.NEXT_PUBLIC_API_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for Retell API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.params);
    // Add auth token if available
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('🚨 Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config?.url, 'Data length:', 
      Array.isArray(response.data) ? response.data.length : typeof response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error?.response?.status, error?.config?.url);
    console.error('❌ Error details:', error?.response?.data || error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - server may be down or slow');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
