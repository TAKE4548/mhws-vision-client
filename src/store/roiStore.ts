import { create } from 'zustand';
import { 
  listRoiProfiles, 
  deleteRoiProfile,
  saveRoiProfile,
  updateRoiProfile 
} from '../api/generated/config/config';
import { prepareCalibration } from '../api/generated/vision/vision';
import type { 
  ROIProfile, 
  Rect, 
  RelativeRect, 
  Point, 
  SlotROI, 
  SkillROI, 
  NormalizationPoints 
} from '../api/generated/model';

export type { 
  ROIProfile, 
  Rect, 
  RelativeRect, 
  Point, 
  SlotROI, 
  SkillROI, 
  NormalizationPoints 
};

export type CalibrationStep = 'setup' | 'source' | 'parent' | 'items' | 'normalization' | 'save';
export type ActiveTarget = 'parent' | 'rarity' | 'slot_icon' | 'slot_level' | 'skill_name' | 'skill_level' | 'bg_point' | 'frame_point';

interface ROIState {
  step: CalibrationStep;
  activeTarget: ActiveTarget;
  activeId: number; // For slots/skills (0, 1, 2)
  profile: ROIProfile;
  
  profiles: ROIProfile[];
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
  setSourceFile: (file: File | null) => void;
  
  updateParentWindow: (updates: Partial<Rect>) => void;
  updateRelativeRect: (target: ActiveTarget, id: number, updates: Partial<RelativeRect>) => void;
  updatePoint: (target: 'bg_point' | 'frame_point', updates: Partial<Point>) => void;
  
  fetchProfiles: () => Promise<void>;
  selectProfile: (id: string) => void;
  deleteProfile: (id: string) => Promise<void>;
  prepareSource: (file: File, timestampMs: number) => Promise<void>;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: ROIProfile = {
  name: 'Default 1080p',
  resolution: { width: 1920, height: 1080 },
  parent_window: { x: 1530, y: 150, w: 320, h: 700 }, // 右上の護石エリア
  rarity: { x_rel: 20, y_rel: 20, w: 80, h: 30 },
  slots: [
    { id: 0, icon: { x_rel: 20, y_rel: 80, w: 40, h: 40 }, level: { x_rel: 70, y_rel: 80, w: 30, h: 30 } },
    { id: 1, icon: { x_rel: 20, y_rel: 130, w: 40, h: 40 }, level: { x_rel: 70, y_rel: 130, w: 30, h: 30 } },
    { id: 2, icon: { x_rel: 20, y_rel: 180, w: 40, h: 40 }, level: { x_rel: 70, y_rel: 180, w: 30, h: 30 } },
  ],
  skills: [
    { id: 0, name: { x_rel: 20, y_rel: 250, w: 200, h: 30 }, level: { x_rel: 230, y_rel: 250, w: 50, h: 30 } },
    { id: 1, name: { x_rel: 20, y_rel: 300, w: 200, h: 30 }, level: { x_rel: 230, y_rel: 300, w: 50, h: 30 } },
    { id: 2, name: { x_rel: 20, y_rel: 350, w: 200, h: 30 }, level: { x_rel: 230, y_rel: 350, w: 50, h: 30 } },
  ],
  normalization: {
    bg_point: { x_rel: 10, y_rel: 10 },
    frame_point: { x_rel: 5, y_rel: 5 }
  }
};

export const useROIStore = create<ROIState>((set, get) => ({
  step: 'setup',
  activeTarget: 'parent',
  activeId: 0,
  profile: { ...DEFAULT_PROFILE },
  
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
  setActiveTarget: (target, id = 0) => set({ activeTarget: target, activeId: id }),
  setPreviewImage: (previewImage) => set({ previewImage }),
  setResolution: (width, height) => set(state => ({
    profile: {
      ...state.profile,
      resolution: { width, height }
    }
  })),
  setDescription: (description) => set({ description }),
  setSourceFile: (sourceFile) => set({ sourceFile }),

  updateParentWindow: (updates) => set(state => ({
    profile: {
      ...state.profile,
      parent_window: { ...state.profile.parent_window!, ...updates }
    }
  })),

  updateRelativeRect: (target, id, updates) => set(state => {
    const profile = { ...state.profile };
    if (target === 'rarity') {
      profile.rarity = { ...profile.rarity!, ...updates };
    } else if (target.includes('slot')) {
      profile.slots = profile.slots!.map((s: SlotROI) => s.id === id 
        ? { ...s, [target.split('_')[1]]: { ...(s as any)[target.split('_')[1]], ...updates } }
        : s
      );
    } else if (target.includes('skill')) {
      profile.skills = profile.skills!.map((s: SkillROI) => s.id === id 
        ? { ...s, [target.split('_')[1]]: { ...(s as any)[target.split('_')[1]], ...updates } }
        : s
      );
    }
    return { profile };
  }),

  updatePoint: (target, updates) => set(state => ({
    profile: {
      ...state.profile,
      normalization: {
        ...state.profile.normalization!,
        [target]: { ...(state.profile.normalization as any)[target], ...updates }
      }
    }
  })),

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await listRoiProfiles();
      set({ profiles: res.data as ROIProfile[], error: null });
    } catch (err) {
      set({ error: 'Failed to fetch profiles' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectProfile: (id) => {
    const selected = get().profiles.find(p => p.profile_id === id);
    if (selected) {
      set({ 
        selectedProfileId: id, 
        profile: { ...selected },
        description: selected.description || '' 
      });
    }
  },

  deleteProfile: async (id) => {
    try {
      await deleteRoiProfile(id);
      set(state => ({ 
        profiles: state.profiles.filter(p => p.profile_id !== id),
        selectedProfileId: state.selectedProfileId === id ? null : state.selectedProfileId
      }));
    } catch (err) {
      set({ error: 'Failed to delete profile' });
    }
  },

  prepareSource: async (file, timestampMs) => {
    set({ isLoading: true, error: null });
    try {
      const res = await prepareCalibration({ file }, { timestamp_ms: timestampMs });
      set({ jobId: (res.data as any).job_id, timestampMs });
    } catch (err) {
      set({ error: 'Failed to prepare video source' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  resetProfile: () => set({
    profile: { ...DEFAULT_PROFILE },
    selectedProfileId: null,
    step: 'setup',
    previewImage: null,
    jobId: null,
    error: null
  })
}));
