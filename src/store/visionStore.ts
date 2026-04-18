import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface Talisman {
  capture_id: string;
  rarity: number;
  slots: number[];
  skills: {
    name: string;
    level: number;
  }[];
  confidence: number;
  validation_status: 'valid' | 'needs_selection' | 'error';
}

interface VisionState {
  isAnalyzing: boolean;
  currentJobId: string | null;
  progress: number;
  currentThumbnail: string | null;
  talismans: Talisman[];
  error: string | null;
  
  startAnalysis: (file: File) => Promise<void>;
  pollStatus: () => Promise<void>;
  fetchResults: () => Promise<void>;
  reset: () => void;
}

let pollInterval: number | null = null;

export const useVisionStore = create<VisionState>((set, get) => ({
  isAnalyzing: false,
  currentJobId: null,
  progress: 0,
  currentThumbnail: null,
  talismans: [],
  error: null,

  reset: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({
      isAnalyzing: false,
      currentJobId: null,
      progress: 0,
      currentThumbnail: null,
      talismans: [],
      error: null,
    });
  },

  startAnalysis: async (file: File) => {
    set({ isAnalyzing: true, error: null, progress: 0, currentThumbnail: null });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/v1/analyze/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { job_id } = response.data.data;
      set({ currentJobId: job_id });
      
      // ポーリング開始
      get().pollStatus();
    } catch (err: any) {
      console.error('Upload failed:', err);
      set({ 
        isAnalyzing: false, 
        error: err.response?.data?.message || '動画のアップロードに失敗しました。' 
      });
    }
  },

  pollStatus: async () => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    if (pollInterval) clearInterval(pollInterval);

    pollInterval = window.setInterval(async () => {
      try {
        const response = await apiClient.get(`/api/v1/analyze/status/${currentJobId}`);
        const { status, progress, current_thumbnail } = response.data.data;

        set({ 
          progress: progress || 0,
          currentThumbnail: current_thumbnail || null 
        });

        if (status === 'completed') {
          if (pollInterval) clearInterval(pollInterval);
          pollInterval = null;
          await get().fetchResults();
          set({ isAnalyzing: false });
        } else if (status === 'error') {
          if (pollInterval) clearInterval(pollInterval);
          pollInterval = null;
          set({ isAnalyzing: false, error: '解析中にエラーが発生しました。' });
        }
      } catch (err) {
        console.error('Status poll failed:', err);
        // 通信エラーでも一旦継続するが、連続失敗時のハンドリングは将来課題
      }
    }, 2000); // 2秒おきにポーリング
  },

  fetchResults: async () => {
    try {
      const response = await apiClient.get('/api/v1/talismans');
      set({ talismans: response.data.data });
    } catch (err) {
      console.error('Fetch results failed:', err);
      set({ error: '解析結果の取得に失敗しました。' });
    }
  },
}));
