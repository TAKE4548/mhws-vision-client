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

export default apiClient;
