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
  timeout: 60000,
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
    // Orvalの生成コードと型定義（CommonResponse envelope）を維持するため、
    // インターセプターでの自動アンラップは行わないように変更
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
  // FormDataを送る際、Content-Typeを手動で設定するとboundaryが欠落するため削除する
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else {
      delete (config.headers as any)['Content-Type'];
      delete (config.headers as any)['content-type'];
    }
  }
  return apiClient(config).then((response) => {
    // 最終確認用ログ
    console.log('[API Client] Upload Success:', response.data.status);
    return response.data;
  });
};

/**
 * Resolves an image URL by prepending the API_HOST if it's a relative path.
 * Ensures consistent handling of leading/trailing slashes.
 */
export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  // Remove leading slash if present to avoid double slashes, then prepend API_HOST
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${API_HOST}/${cleanPath}`;
};

export default apiClient;
