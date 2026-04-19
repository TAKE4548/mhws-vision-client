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
    // Backend uses CommonResponse wrapper: { status: "success", data: T, message: string }
    // Unwrap the 'data' property for easier use in stores
    if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Client] Network error: Backend server may be offline.');
    } else {
      console.error('[API Client] Request failed:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
