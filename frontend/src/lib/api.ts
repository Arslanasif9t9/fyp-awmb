import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Har request ke sath JWT token bhejo (agar user logged in hai)
api.interceptors.request.use(
  (config) => {
    // Zustand store se token nikal rahe hain (localStorage se bhi le sakte hain)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Agar 401 (Unauthorized) aaye to user ko logout kar do
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);