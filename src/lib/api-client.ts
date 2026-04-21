import axios, { AxiosRequestConfig } from 'axios';

/**
 * Backend API Configuration
 */
export const API_HOST = 'http://localhost:8000';
export const API_VERSION = '/api/v1';
export const API_BASE_URL = `${API_HOST}${API_VERSION}`;

/**
 * Backend API Client
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

/**
 * API Data Types (Legacy - to be replaced by Orval generated models)
 */
export interface ProfileMetadata {
  id: string;
  name: string;
  description?: string;
  resolution?: string;
  reference_image_path?: string;
  last_calibrated_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    // Backend uses CommonResponse wrapper: { status: "success", data: T, message: string }
    // Unwrap the 'data' property for easier use in stores/hooks
    if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
      // NOTE: Axios interceptors change the data property.
      // Orval generated hooks will see the unwrapped data if they are configured correctly.
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

/**
 * Orval Mutator
 * AxiosResponse.data (CommonResponse.data) を直接返すラッパー
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return apiClient(config).then((response) => response.data);
};

export default apiClient;
