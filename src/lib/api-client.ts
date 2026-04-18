import axios from 'axios';

/**
 * Backend API Client
 * Base URL: http://localhost:8000
 */
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // We can add global error handling here later, 
    // e.g., pushing notifications to uiStore
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Client] Network error detected');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
