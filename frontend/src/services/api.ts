import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event listener for unauthorized events to trigger login modal
type AuthListener = (redirectPath?: string) => void;
let authModalListener: AuthListener | null = null;

export const registerAuthModalHandler = (handler: AuthListener) => {
  authModalListener = handler;
};

export const triggerAuthModal = (redirectPath?: string) => {
  if (authModalListener) {
    authModalListener(redirectPath);
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mitahara_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // If unauthorized and trying to access cart/orders/profile, trigger login prompt
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.includes('/cart') || url.includes('/user') || url.includes('/orders')) {
        triggerAuthModal(window.location.pathname);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
