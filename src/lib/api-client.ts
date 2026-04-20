import axios from 'axios';
import { useUIStore } from '../store/uiStore';
import * as mockData from './mock-data';

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

// Import sample asset for stub mode
import sampleImg from '../assets/sample-frame.webp';

// Request interceptor for API Stubbing (REQ-014)
apiClient.interceptors.request.use(async (config) => {
  const { apiMode, apiErrorMode } = useUIStore.getState();

  if (apiMode === 'stub') {
    const url = config.url || '';
    console.log(`[API Stub] Intercepting request: ${config.method?.toUpperCase()} ${url}`);
    
    // Simulate Error
    if (apiErrorMode) {
      return Promise.reject({
        isStub: true,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { status: 'error', message: 'Stub: Simulated Server Error' },
          config,
          headers: {},
        },
      });
    }

    // Spec Handling: /vision/preview returns binary image
    if (url.includes('/vision/preview')) {
      console.log('[Stub API] Intercepting vision/preview', config.params);
      
      const responseStub = async () => {
        const { x, y, w, h } = config.params || {};
        const response = await fetch(sampleImg);
        const fullBlob = await response.blob();

        // クロップ指定がある場合はシミュレーション
        if (w && h) {
          return new Promise<Blob>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // y, x の順序や計算ミスに注意 (OpenAPI基準: x, y, w, h)
                ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
              }
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else resolve(fullBlob);
              }, 'image/webp');
            };
            img.onerror = () => resolve(fullBlob);
            img.src = URL.createObjectURL(fullBlob);
          });
        }
        return fullBlob;
      };

      try {
        const blob = await responseStub();
        return Promise.reject({
          isStub: true,
          response: {
            status: 200,
            statusText: 'OK',
            data: blob,
            config,
            headers: { 'content-type': 'image/webp' },
          },
        });
      } catch (err) {
        console.error('[API Stub] Failed to fetch sample image:', err);
      }
    }

    // Determine mock data based on URL
    let data: any = null;

    if (url.includes('/talismans')) {
      data = mockData.MOCK_TALISMANS;
    } else if (url.includes('/analyze/status')) {
      data = mockData.MOCK_ANALYSIS_STATUS;
    } else if (url.includes('/analyze/video')) {
      data = { job_id: `job-${Math.floor(Math.random() * 10000)}` };
    } else if (url.includes('/analyze/debug_start')) {
      data = { job_id: `debug-job-${Math.floor(Math.random() * 10000)}` };
    } else if (url.includes('/analyze/start/')) {
      data = { status: 'success', message: 'Analysis started (Stub)' };
    } else if (url.includes('/config/roi/profiles')) {
      if (config.method === 'post') {
        const postData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        data = { profile_id: `profile-${Math.random().toString(36).substr(2, 9)}`, ...postData };
      } else {
        data = mockData.MOCK_ROI_PROFILES;
      }
    } else if (url.includes('/analyze/cancel')) {
      data = { status: 'success', message: 'Stub: Job cancellation requested' };
    } else {
      data = { message: 'Stub: Operation successful' };
    }

    return Promise.reject({
      isStub: true,
      response: {
        status: url.includes('/config/roi/profiles') && config.method === 'post' ? 201 : 200,
        statusText: 'OK',
        data: mockData.wrapMock(data),
        config,
        headers: {},
      },
    });

  }

  return config;
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
    // Handle short-circuited Stub requests
    if (error.isStub && error.response.status >= 200 && error.response.status < 300) {
      const resp = error.response;
      // Re-run the unwrapping logic for stubbed data
      if (resp.data && resp.data.status === 'success' && resp.data.data !== undefined) {
        return Promise.resolve({ ...resp, data: resp.data.data });
      }
      return Promise.resolve(resp);
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('[API Client] Network error: Backend server may be offline.');
    } else {
      console.error('[API Client] Request failed:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
