import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Điều chỉnh đường dẫn tới authStore của bạn

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào Header nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    // 🌟 Lấy token trực tiếp từ Zustand store
    const token = useAuthStore.getState().token; 
    
    // NẾU BẠN KHÔNG DÙNG ZUSTAND MÀ LƯU RỜI, THÌ DÙNG CÁCH CŨ:
    // const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;