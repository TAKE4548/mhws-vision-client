import axios from 'axios';
import { useUIStore } from '../store/uiStore';
import * as mockData from './mock-data';

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

// Request interceptor for API Stubbing (REQ-014)
apiClient.interceptors.request.use((config) => {
  const { apiMode, apiErrorMode } = useUIStore.getState();

  if (apiMode === 'stub') {
    console.log(`[API Stub] Intercepting request: ${config.method?.toUpperCase()} ${config.url}`);
    
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

    // Determine mock data based on URL
    let data: any = null;
    const url = config.url || '';

    if (url.includes('/talismans')) {
      data = mockData.MOCK_TALISMANS;
    } else if (url.includes('/analyze/status')) {
      data = mockData.MOCK_ANALYSIS_STATUS;
    } else if (url.includes('/analyze/video')) {
      data = { job_id: 'mock-job-id' };
    } else if (url.includes('/vision/preview')) {
      data = mockData.MOCK_VISION_PREVIEW;
    } else if (url.includes('/config/roi/profiles')) {
      data = mockData.MOCK_ROI_PROFILES;
    } else {
      // Default success for other endpoints (POST/PATCH/DELETE)
      data = { message: 'Stub: Operation successful' };
    }

    // Return a fake response that looks like an Axios response
    // We throw this to catch it and return it as a resolved promise in a special way, 
    // or just return it as a "successful" request that is then handled by the response interceptor.
    // However, Axios request interceptors are expected to return config.
    // To 'short-circuit', we can use an adapter or a trick.
    // Let's use a simpler approach: return a rejected promise with a special flag 
    // and catch it in the response interceptor to transform it back to a success.
    return Promise.reject({
      isStub: true,
      response: {
        status: 200,
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
    if (error.isStub && error.response.status === 200) {
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
