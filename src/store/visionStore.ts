import { create } from 'zustand';
import { apiClient } from '../lib/api-client';
import { sseClient, type SSEEvent } from '../lib/sse-client';

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Talisman {
  capture_id: string; 
  rarity: { value: number; confidence: number };
  slots: { value: number[]; confidence: number };
  skills: {
    name: string;
    level: number;
    confidence: number;
  }[];
  confidence: number;
  validation_status: 'processing' | 'valid' | 'needs_selection' | 'error';
  image_url?: string;
  timestamp_ms?: number;
}

interface VisionState {
  status: JobStatus;
  currentJobId: string | null;
  progress: number;
  isAnalyzing: boolean;
  talismans: Talisman[];
  error: string | null;
  
  // Actions
  uploadVideo: (file: File) => Promise<void>;
  startAnalysis: (profileId: string) => Promise<void>;
  startLocalAnalysis: (path: string) => Promise<void>;
  listenToEvents: (jobId: string) => void;
  cancelJob: () => Promise<void>;
  fetchResults: (jobId?: string) => Promise<void>;
  syncJobStatus: (jobId: string) => Promise<void>;
  updateTalisman: (id: string, updates: Partial<Talisman>) => Promise<void>;
  reset: () => void;
}

export const useVisionStore = create<VisionState>((set, get) => ({
  status: 'idle',
  currentJobId: null,
  progress: 0,
  isAnalyzing: false,
  talismans: [],
  error: null,

  reset: () => {
    sseClient.disconnect();
    set({
      status: 'idle',
      currentJobId: null,
      progress: 0,
      isAnalyzing: false,
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
      
      set({ currentJobId: job_id });
      // We don't start analysis automatically here, UI will trigger startAnalysis
    } catch (err: any) {
      console.error('[VisionStore] Upload failed:', err);
      set({ 
        status: 'failed', 
        error: err.response?.data?.message || '動画のアップロードに失敗しました。' 
      });
      throw err;
    }
  },

  startAnalysis: async (profileId: string) => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    try {
      set({ status: 'processing', isAnalyzing: true });
      await apiClient.post(`/api/v1/analyze/start/${currentJobId}`, { profile_id: profileId });
      get().listenToEvents(currentJobId);
    } catch (err: any) {
      console.error('[VisionStore] Start analysis failed:', err);
      set({ status: 'failed', error: '解析の開始に失敗しました。' });
    }
  },

  startLocalAnalysis: async (path: string) => {
    try {
      get().reset();
      set({ status: 'pending', progress: 0, isAnalyzing: true });
      
      const response = await apiClient.post('/api/v1/analyze/debug_start', { path });
      const job_id = response.data.job_id || response.data.data?.job_id;
      
      if (!job_id) throw new Error('No job_id returned');

      set({ currentJobId: job_id, status: 'processing' });
      get().listenToEvents(job_id);
    } catch (err: any) {
      console.error('[VisionStore] Local analysis failed:', err);
      set({ status: 'failed', error: '解析の開始に失敗しました。' });
    }
  },

  listenToEvents: (jobId: string) => {
    // 1. Initial Sync (SSoT: REST recovery)
    get().syncJobStatus(jobId);
    get().fetchResults(jobId);

    // 2. Connect SSE
    sseClient.connect(jobId);
    
    sseClient.subscribe((event: SSEEvent) => {
      const { type, data } = event;
      
      switch (type) {
        case 'progress':
          set({ progress: data.progress * 100 });
          break;

        case 'capture_extracted':
          // Add a placeholder card
          set((state) => ({
            talismans: [
              ...state.talismans,
              {
                capture_id: data.capture_id,
                timestamp_ms: data.timestamp_ms,
                rarity: { value: 0, confidence: 0 },
                slots: { value: [], confidence: 0 },
                skills: [],
                confidence: 0,
                validation_status: 'processing'
              }
            ]
          }));
          break;

        case 'talisman_analyzed':
          // Update the placeholder with real data
          set((state) => ({
            talismans: state.talismans.map((t) => 
              t.capture_id === data.capture_id ? { ...data, validation_status: data.validation_status || 'valid' } : t
            )
          }));
          break;

        case 'analysis_error':
          set((state) => ({
            talismans: state.talismans.map((t) => 
              t.capture_id === data.capture_id ? { ...t, validation_status: 'error', error: data.message } : t
            )
          }));
          break;

        case 'job_completed':
          set({ status: 'completed', isAnalyzing: false, progress: 100 });
          sseClient.disconnect();
          break;

        case 'job_cancelled':
          set({ status: 'cancelled', isAnalyzing: false });
          sseClient.disconnect();
          break;

        case 'job_failed':
          set({ status: 'failed', isAnalyzing: false, error: data.message || 'ジョブが失敗しました。' });
          sseClient.disconnect();
          break;
      }
    });
  },

  cancelJob: async () => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    try {
      await apiClient.post(`/api/v1/analyze/cancel/${currentJobId}`);
      // UI will update when job_cancelled event arrives via SSE
    } catch (err) {
      console.error('[VisionStore] Cancel failed:', err);
    }
  },

  syncJobStatus: async (jobId: string) => {
    try {
      const resp = await apiClient.get(`/api/v1/analyze/status/${jobId}`);
      if (resp.data) {
        set({ 
          status: resp.data.status.toLowerCase() as JobStatus,
          progress: resp.data.progress * 100 
        });
      }
    } catch (err) {
      console.error('[VisionStore] Sync status failed:', err);
    }
  },

  fetchResults: async (jobId?: string) => {
    try {
      const url = jobId ? `/api/v1/talismans?job_id=${jobId}` : '/api/v1/talismans';
      const response = await apiClient.get(url);
      
      set({ 
        talismans: response.data,
      });
    } catch (err) {
      console.error('[VisionStore] Fetch results failed:', err);
    }
  },

  updateTalisman: async (id: string, updates: Partial<Talisman>) => {
    try {
      await apiClient.patch(`/api/v1/talismans/${id}`, updates);
      
      set((state) => ({
        talismans: state.talismans.map((t) => 
          t.capture_id === id ? { ...t, ...updates, validation_status: 'valid' } : t
        ),
      }));
    } catch (err) {
      console.error('[VisionStore] Update talisman failed:', err);
      throw err;
    }
  },
}));
