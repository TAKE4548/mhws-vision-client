import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface Talisman {
  id: string; // capture_id mapped to id
  rarity: number;
  slots: number[];
  skills: {
    name: string;
    level: number;
    confidence: number;
  }[];
  confidence: number;
  validation_status: 'valid' | 'needs_selection' | 'error';
}

interface VisionState {
  status: JobStatus;
  currentJobId: string | null;
  progress: number;
  isAnalyzing: boolean; // Add this
  currentThumbnail: string | null;
  talismans: Talisman[];
  error: string | null;
  
  uploadVideo: (file: File) => Promise<void>;
  startLocalAnalysis: (path: string) => Promise<void>;
  pollStatus: () => void;
  fetchResults: () => Promise<void>;
  updateTalisman: (id: string, updates: Partial<Talisman>) => Promise<void>;
  reset: () => void;
}

let pollInterval: number | null = null;

export const useVisionStore = create<VisionState>((set, get) => ({
  status: 'idle',
  currentJobId: null,
  progress: 0,
  isAnalyzing: false, // Initial value
  currentThumbnail: null,
  talismans: [],
  error: null,

  reset: () => {
    if (pollInterval) {
      window.clearInterval(pollInterval);
      pollInterval = null;
    }
    set({
      status: 'idle',
      currentJobId: null,
      progress: 0,
      isAnalyzing: false,
      currentThumbnail: null,
      talismans: [],
      error: null,
    });
  },

  uploadVideo: async (file: File) => {
    try {
      get().reset();
      set({ status: 'pending', progress: 0, isAnalyzing: true });
      
      const formData = new FormData();
      formData.append('video', file);

      const response = await apiClient.post('/api/v1/analyze/video', formData);

      const { job_id } = response.data;
      set({ currentJobId: job_id, status: 'processing' });
      get().pollStatus();
    } catch (err: any) {
      console.error('[VisionStore] Upload failed:', err);
      set({ 
        status: 'failed', 
        error: err.response?.data?.message || '動画のアップロードに失敗しました。' 
      });
      throw err;
    }
  },

  startLocalAnalysis: async (path: string) => {
    try {
      get().reset();
      set({ status: 'pending', progress: 0, isAnalyzing: true });
      
      const response = await apiClient.post('/api/v1/analyze/debug_start', { path });

      const job_id = response.data.data?.job_id || response.data.job_id;
      if (!job_id) {
        throw new Error('No job_id returned from server');
      }
      
      set({ currentJobId: job_id, status: 'processing' });
      get().pollStatus();
    } catch (err: any) {
      console.error('[VisionStore] Local analysis trigger failed:', err);
      set({ 
        status: 'failed', 
        error: err.response?.data?.message || 'ローカル解析の開始に失敗しました。' 
      });
      throw err;
    }
  },

  pollStatus: () => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    if (pollInterval) window.clearInterval(pollInterval);

    pollInterval = window.setInterval(async () => {
      const { status } = get();
      if (status === 'completed' || status === 'failed') {
        if (pollInterval) window.clearInterval(pollInterval);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/analyze/status/${currentJobId}`);
        const jobData = response.data?.data;
        
        if (!jobData) {
          console.warn('[VisionStore] Poll response missing data.data');
          return;
        }

        const { status: jobStatus, progress } = jobData;

        const normalizedStatus = jobStatus.toLowerCase() as JobStatus;

        set({ 
          status: normalizedStatus,
          progress: progress || 0 
        });

        if (normalizedStatus === 'completed') {
          if (pollInterval) window.clearInterval(pollInterval);
          pollInterval = null;
          set({ isAnalyzing: false });
          await get().fetchResults();
        } else if (normalizedStatus === 'failed') {
          if (pollInterval) window.clearInterval(pollInterval);
          pollInterval = null;
          set({ isAnalyzing: false, error: '解析中にエラーが発生しました。' });
        }
      } catch (err) {
        console.error('[VisionStore] Status poll failed:', err);
      }
    }, 2000); 
  },

  fetchResults: async () => {
    try {
      const response = await apiClient.get('/api/v1/talismans');
      const mappedTalismans = response.data.map((t: any) => ({
        ...t,
        id: t.capture_id,
      }));
      set({ 
        talismans: mappedTalismans,
        isAnalyzing: false 
      });
    } catch (err) {
      console.error('[VisionStore] Fetch results failed:', err);
      set({ error: '解析結果の取得に失敗しました。' });
    }
  },

  updateTalisman: async (id: string, updates: Partial<Talisman>) => {
    try {
      await apiClient.patch(`/api/v1/talismans/${id}`, updates);
      
      set((state) => ({
        talismans: state.talismans.map((t) => 
          t.id === id ? { ...t, ...updates, validation_status: 'valid' } : t
        ),
      }));
    } catch (err) {
      console.error('[VisionStore] Update talisman failed:', err);
      throw err;
    }
  },
}));
