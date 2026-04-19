import { create } from 'zustand';
import { apiClient, API_HOST } from '../lib/api-client';

interface ServerState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: string | null;
  serverError: string | null;
  checkHealth: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingIntervalId: ReturnType<typeof setInterval> | null = null;

export const useServerStore = create<ServerState>((set, get) => ({
  isOnline: false,
  isChecking: false,
  lastChecked: null,
  serverError: null,

  checkHealth: async () => {
    set({ isChecking: true });
    try {
      // サーバーのルート（/）を叩いて死活監視
      await apiClient.get('/', { baseURL: API_HOST });
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

  startPolling: () => {
    const { checkHealth, stopPolling } = get();
    // すでに動いていればクリア
    stopPolling();
    
    // 初回実行
    checkHealth();
    
    // 30秒間隔でポーリング
    pollingIntervalId = setInterval(() => {
      get().checkHealth();
    }, 30000);
  },

  stopPolling: () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
  }
}));
