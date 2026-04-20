import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RelativeRect {
  x_rel: number;
  y_rel: number;
  w: number;
  h: number;
}

export interface Point {
  x_rel: number;
  y_rel: number;
}

export interface SlotROI {
  id: number;
  icon: RelativeRect;
  level: RelativeRect;
}

export interface SkillROI {
  id: number;
  name: RelativeRect;
  level: RelativeRect;
}

export interface NormalizationPoints {
  bg_point: Point;
  frame_point: Point;
}

export interface ROIProfile {
  profile_id?: string;
  name: string;
  description?: string;
  reference_image_url?: string;
  resolution: { width: number; height: number };
  parent_window: Rect;
  rarity: RelativeRect;
  slots: SlotROI[];
  skills: SkillROI[];
  normalization: NormalizationPoints;
}

export type CalibrationStep = 'setup' | 'source' | 'parent' | 'items' | 'normalization' | 'save';
export type ActiveTarget = 'parent' | 'rarity' | 'slot_icon' | 'slot_level' | 'skill_name' | 'skill_level' | 'bg_point' | 'frame_point';

interface ROIState {
  step: CalibrationStep;
  activeTarget: ActiveTarget;
  activeId: number; // For slots/skills (0, 1, 2)
  profile: ROIProfile;
  
  // Metadata for the current session/profile
  profiles: any[]; // ProfileMetadata[] (imported from api-client)
  selectedProfileId: string | null;
  description: string;
  sourceFile: File | null;
  jobId: string | null;
  timestampMs: number;
  previewImage: string | null;
  isLoading: boolean;
  error: string | null;
  
  setStep: (step: CalibrationStep) => void;
  setActiveTarget: (target: ActiveTarget, id?: number) => void;
  setPreviewImage: (image: string | null) => void;
  setResolution: (width: number, height: number) => void;
  setDescription: (desc: string) => void;
  
  updateParentWindow: (updates: Partial<Rect>) => void;
  updateRelativeRect: (target: ActiveTarget, id: number, updates: Partial<RelativeRect>) => void;
  updatePoint: (target: 'bg_point' | 'frame_point', updates: Partial<Point>) => void;
  
  // CRUD Actions
  fetchProfiles: () => Promise<void>;
  selectProfile: (id: string | null) => void;
  deleteProfile: (id: string) => Promise<void>;
  setSourceFile: (file: File | null) => void;
  prepareSource: (file: File | string, timestamp: number) => Promise<void>;
  setProfile: (profile: ROIProfile) => void;
  resetProfile: () => void;
}

const DEFAULT_RECT: Rect = { x: 400, y: 200, w: 800, h: 1200 };
const DEFAULT_REL_RECT: RelativeRect = { x_rel: 0, y_rel: 0, w: 100, h: 50 };

const createDefaultProfile = (): ROIProfile => ({
  name: '',
  resolution: { width: 1920, height: 1080 },
  parent_window: { ...DEFAULT_RECT },
  rarity: { ...DEFAULT_REL_RECT, y_rel: 20, w: 150, h: 40 },
  slots: [0, 1, 2].map(id => ({
    id,
    icon: { ...DEFAULT_REL_RECT, x_rel: 50, y_rel: 100 + id * 60, w: 40, h: 40 },
    level: { ...DEFAULT_REL_RECT, x_rel: 100, y_rel: 100 + id * 60, w: 20, h: 40 },
  })),
  skills: [0, 1, 2].map(id => ({
    id,
    name: { ...DEFAULT_REL_RECT, x_rel: 150, y_rel: 100 + id * 120, w: 300, h: 40 },
    level: { ...DEFAULT_REL_RECT, x_rel: 460, y_rel: 100 + id * 120, w: 100, h: 40 },
  })),
  normalization: {
    bg_point: { x_rel: 110, y_rel: 120 },
    frame_point: { x_rel: 115, y_rel: 125 },
  }
});

export const useROIStore = create<ROIState>((set, get) => ({
  step: 'setup',
  activeTarget: 'parent',
  activeId: 0,
  profile: createDefaultProfile(),
  profiles: [],
  selectedProfileId: null,
  description: '',
  sourceFile: null,
  jobId: null,
  timestampMs: 0,
  previewImage: null,
  isLoading: false,
  error: null,

  setStep: (step) => set({ step }),
  setActiveTarget: (activeTarget, activeId = 0) => set({ activeTarget, activeId }),
  setPreviewImage: (previewImage) => set({ previewImage }),
  setResolution: (width, height) => set((state) => ({
    profile: { ...state.profile, resolution: { width, height } }
  })),
  setDescription: (description) => set({ description }),

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const resp = await apiClient.get('/config/roi/profiles');
      // api-client が自動で response.data.data を剥がして resp.data に入れている
      set({ profiles: resp.data || [], isLoading: false });
    } catch (err) {
      set({ error: 'プロファイル一覧の取得に失敗しました。', isLoading: false });
    }
  },

  selectProfile: (id) => {
    const { profiles } = get();
    if (!id) {
      set({ selectedProfileId: null, description: '' });
      get().resetProfile();
      return;
    }

    const selected = profiles.find(p => p.profile_id === id);
    if (selected) {
      set({ 
        selectedProfileId: id, 
        description: selected.description || '',
        profile: selected,
        previewImage: selected.reference_image_url || null
      });
    }
  },

  deleteProfile: async (id) => {
    try {
      await apiClient.delete(`/config/roi/profiles/${id}`);
      get().fetchProfiles();
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  },

  deleteProfile: async (id) => {
    try {
      await apiClient.delete(`/config/roi/profiles/${id}`);
      set(state => ({
        profiles: state.profiles.filter(p => p.id !== id),
        selectedProfileId: state.selectedProfileId === id ? null : state.selectedProfileId
      }));
    } catch (err) {
      console.error('[ROIStore] Delete failed:', err);
      set({ error: 'プロファイルの削除に失敗しました。' });
    }
  },

  setSourceFile: (file) => set({ sourceFile: file }),

  prepareSource: async (file, timestamp) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      if (typeof file === 'string') {
        // 既存ジョブの再利用
        response = await apiClient.post('/vision/prepare', { job_id: file, timestamp_ms: timestamp });
      } else {
        // 新規アップロード
        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp_ms', timestamp.toString());
        response = await apiClient.post('/vision/prepare', formData);
      }

      const { job_id, reference_image_url } = response.data;
      set({ 
        jobId: job_id, 
        timestampMs: timestamp, 
        previewImage: reference_image_url,
        isLoading: false 
      });
    } catch (err) {
      console.error('[ROIStore] Prepare failed:', err);
      set({ error: '画像の抽出に失敗しました。', isLoading: false });
      throw err;
    }
  },

  updateParentWindow: (updates) => set((state) => ({
    profile: {
      ...state.profile,
      parent_window: { ...state.profile.parent_window, ...updates }
    }
  })),

  updateRelativeRect: (target, id, updates) => set((state) => {
    const newProfile = { ...state.profile };
    if (target === 'rarity') {
      newProfile.rarity = { ...newProfile.rarity, ...updates };
    } else if (target === 'slot_icon' || target === 'slot_level') {
      newProfile.slots = newProfile.slots.map(s => 
        s.id === id ? { ...s, [target === 'slot_icon' ? 'icon' : 'level']: { ...(target === 'slot_icon' ? s.icon : s.level), ...updates } } : s
      );
    } else if (target === 'skill_name' || target === 'skill_level') {
      newProfile.skills = newProfile.skills.map(s => 
        s.id === id ? { ...s, [target === 'skill_name' ? 'name' : 'level']: { ...(target === 'skill_name' ? s.name : s.level), ...updates } } : s
      );
    }
    return { profile: newProfile };
  }),

  updatePoint: (target, updates) => set((state) => ({
    profile: {
      ...state.profile,
      normalization: {
        ...state.profile.normalization,
        [target]: { ...state.profile.normalization[target], ...updates }
      }
    }
  })),

  setProfile: (profile) => set({ profile }),
  resetProfile: () => set({ 
    profile: createDefaultProfile(), 
    step: 'setup', 
    activeTarget: 'parent', 
    selectedProfileId: null, 
    description: '',
    sourceFile: null,
    jobId: null,
    timestampMs: 0,
    previewImage: null
  }),
}));

