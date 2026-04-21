import { create } from 'zustand';
import { sseClient, type SSEEvent } from '../lib/sse-client';
import { 
  createAnalysisJob, 
  startAnalysis, 
  getJobStatus, 
  cancelAnalysis 
} from '../api/generated/analyze/analyze';
import { 
  listTalismans, 
  updateTalisman as updateTalismanApi 
} from '../api/generated/talismans/talismans';
import { listRoiProfiles } from '../api/generated/config/config';
import type { 
  TalismanOut, 
  AnalysisJobStatus, 
  ROIProfile,
  ValidationStatus
} from '../api/generated/model';

export type Talisman = TalismanOut;
export type JobStatus = AnalysisJobStatus | 'idle' | 'pending';

export interface VideoMeta {
  width: number;
  height: number;
  duration?: number;
}

interface VisionState {
  status: JobStatus;
  currentJobId: string | null;
  videoMeta: VideoMeta | null;
  progress: number;
  isAnalyzing: boolean;
  talismans: TalismanOut[];
  profiles: ROIProfile[];
  error: string | null;
  
  // Actions
  uploadVideo: (file: File) => Promise<void>;
  startAnalysis: (profileId: string) => Promise<void>;
  startLocalAnalysis: (path: string) => Promise<void>;
  listenToEvents: (jobId: string) => void;
  cancelJob: () => Promise<void>;
  fetchResults: (jobId?: string) => Promise<void>;
  syncJobStatus: (jobId: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  updateTalisman: (id: string, updates: any) => Promise<void>;
  reset: () => void;
}

export const useVisionStore = create<VisionState>((set, get) => ({
  status: 'idle',
  currentJobId: null,
  videoMeta: null,
  progress: 0,
  isAnalyzing: false,
  talismans: [],
  profiles: [],
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
      set({ status: 'pending', progress: 0, isAnalyzing: true, error: null });
      
      const resp = await createAnalysisJob({ video: file });
      const { data } = resp;
      
      if (!data) throw new Error('No data returned from upload');

      set({ 
        currentJobId: data.job_id,
        videoMeta: null
      });
    } catch (err: any) {
      console.error('[VisionStore] Upload failed:', err);
      set({ 
        status: 'failed' as any, 
        error: err.response?.data?.message || '動画のアップロードに失敗しました。' 
      });
      throw err;
    }
  },

  startAnalysis: async (profileId: string) => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    try {
      set({ status: 'processing', isAnalyzing: true, error: null });
      await startAnalysis(currentJobId, { profile_id: profileId });
      get().listenToEvents(currentJobId);
    } catch (err: any) {
      console.error('[VisionStore] Start analysis failed:', err);
      set({ status: 'failed' as any, error: '解析の開始に失敗しました。' });
    }
  },

  startLocalAnalysis: async (path: string) => {
    // Note: startLocalAnalysis (operationId: start_local_analysis) 
    // が OpenAPI spec でタグ無しのためOrvalで生成されなかった可能性がある。
    // 手動で stub 通信を行うか、OpenAPI を修正するまでのワークアラウンド。
    console.warn('[VisionStore] startLocalAnalysis is temporarily disabled due to spec mismatch.');
    try {
      get().reset();
      set({ status: 'pending', progress: 0, isAnalyzing: true, error: null });
      
      // 仮のジョブIDを発行してSSEシミュレーションを開始する
      const jobId = `stub-local-${Date.now()}`;
      set({ currentJobId: jobId, status: 'processing' });
      get().listenToEvents(jobId);
    } catch (err: any) {
      console.error('[VisionStore] Local analysis failed:', err);
      set({ status: 'failed' as any, error: '解析の開始に失敗しました。' });
    }
  },

  listenToEvents: (jobId: string) => {
    get().syncJobStatus(jobId);
    get().fetchResults(jobId);

    sseClient.connect(jobId);
    
    sseClient.subscribe((event: SSEEvent) => {
      const { type, data } = event;
      
      switch (type) {
        case 'progress':
          set({ progress: Math.min(data.progress || 0, 1.0) * 100 });
          break;

        case 'capture_extracted':
          set((state) => ({
            talismans: [
              ...state.talismans,
              {
                capture_id: data.capture_id,
                confidence: 0,
                rarity: { value: 0, confidence: 0 },
                slots: { value: [], confidence: 0 },
                skills: [],
                validation_status: 'processing' as ValidationStatus
              }
            ]
          }));
          break;

        case 'talisman_analyzed':
          set((state) => ({
            talismans: state.talismans.map((t) => {
              if (t.capture_id === data.capture_id) {
                const talismanUpdate = data.data || data;
                return { 
                  ...t,
                  ...talismanUpdate, 
                  capture_id: data.capture_id,
                  validation_status: (talismanUpdate.validation_status || 'valid') as ValidationStatus
                };
              }
              return t;
            })
          }));
          break;

        case 'analysis_error':
          set((state) => ({
            talismans: state.talismans.map((t) => 
              t.capture_id === data.capture_id ? { ...t, validation_status: 'error' as ValidationStatus } : t
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
          set({ status: 'failed' as any, isAnalyzing: false, error: data.message || 'ジョブが失敗しました。' });
          sseClient.disconnect();
          break;
      }
    });
  },

  cancelJob: async () => {
    const { currentJobId } = get();
    if (!currentJobId) return;

    try {
      await cancelAnalysis(currentJobId);
    } catch (err) {
      console.error('[VisionStore] Cancel failed:', err);
    }
  },

  syncJobStatus: async (jobId: string) => {
    try {
      const resp = await getJobStatus(jobId);
      const { data } = resp;
      if (data) {
        set({ 
          status: data.status,
          progress: Math.min(data.progress || 0, 1.0) * 100 
        });
      }
    } catch (err) {
      console.error('[VisionStore] Sync status failed:', err);
    }
  },

  fetchResults: async (jobId?: string) => {
    try {
      const resp = await listTalismans({ job_id: jobId });
      set({ talismans: resp.data || [] });
    } catch (err) {
      console.error('[VisionStore] Fetch results failed:', err);
    }
  },

  fetchProfiles: async () => {
    try {
      const resp = await listRoiProfiles();
      set({ profiles: resp.data || [] });
    } catch (err) {
      console.error('[VisionStore] Fetch profiles failed:', err);
    }
  },

  updateTalisman: async (id: string, updates: any) => {
    try {
      await updateTalismanApi(id, updates);
      
      set((state) => ({
        talismans: state.talismans.map((t) => 
          t.capture_id === id ? { ...t, ...updates, validation_status: 'valid' as ValidationStatus } : t
        ),
      }));
    } catch (err) {
      console.error('[VisionStore] Update talisman failed:', err);
      throw err;
    }
  },
}));
