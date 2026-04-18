import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

interface ServerState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: string | null;
  serverError: string | null;
  checkHealth: () => Promise<void>;
}

export const useServerStore = create<ServerState>((set) => ({
  isOnline: false,
  isChecking: false,
  lastChecked: null,
  serverError: null,

  checkHealth: async () => {
    set({ isChecking: true });
    try {
      // 決まったエンドポイントがないため、ルートを叩く
      await apiClient.get('/');
      set({
        isOnline: true,
        serverError: null,
        lastChecked: new Date().toLocaleTimeString(),
      });
    } catch (error: any) {
      console.error('Health check failed:', error);
      set({
        isOnline: false,
        serverError: error.message || 'Connection failed',
        lastChecked: new Date().toLocaleTimeString(),
      });
    } finally {
      set({ isChecking: false });
    }
  },
}));
