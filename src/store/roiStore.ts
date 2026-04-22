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

  // Sync settings
  isSyncEnabled: boolean;
  gaps: {
    slotIconGapX: number;
    slotLevelGapX: number;
    skillNameGapY: number;
    skillLevelGapY: number;
  };
  
  setStep: (step: CalibrationStep) => void;
  setActiveTarget: (target: ActiveTarget, id?: number) => void;
  setPreviewImage: (image: string | null) => void;
  setResolution: (width: number, height: number) => void;
  setDescription: (desc: string) => void;
  setSourceFile: (file: File | null) => void;
  
  setSyncEnabled: (enabled: boolean) => void;
  updateGaps: (updates: Partial<ROIState['gaps']>) => void;
  syncAllToPrimary: () => void;
  
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
    { id: 1, icon: { x_rel: 70, y_rel: 80, w: 40, h: 40 }, level: { x_rel: 120, y_rel: 80, w: 30, h: 30 } },
    { id: 2, icon: { x_rel: 120, y_rel: 80, w: 40, h: 40 }, level: { x_rel: 170, y_rel: 80, w: 30, h: 30 } },
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

/**
 * Ensures a profile object has all required nested structures by merging with defaults
 */
function ensureProfileStructure(p: Partial<ROIProfile>): ROIProfile {
  return {
    ...DEFAULT_PROFILE,
    ...p,
    resolution: p.resolution || { ...DEFAULT_PROFILE.resolution },
    parent_window: p.parent_window || { ...DEFAULT_PROFILE.parent_window },
    rarity: p.rarity || { ...DEFAULT_PROFILE.rarity },
    slots: Array.isArray(p.slots) && p.slots.length > 0 ? p.slots : [ ...DEFAULT_PROFILE.slots ],
    skills: Array.isArray(p.skills) && p.skills.length > 0 ? p.skills : [ ...DEFAULT_PROFILE.skills ],
    normalization: p.normalization || { ...DEFAULT_PROFILE.normalization },
  };
}

export const useROIStore = create<ROIState>((set, get) => ({
  step: 'setup',
  activeTarget: 'parent',
  activeId: 0,
  profile: ensureProfileStructure({}),
  
  profiles: [],
  selectedProfileId: null,
  description: '',
  sourceFile: null,
  jobId: null,
  timestampMs: 0,
  previewImage: null,
  isLoading: false,
  error: null,

  isSyncEnabled: true,
  gaps: {
    slotIconGapX: 50,
    slotLevelGapX: 50,
    skillNameGapY: 50,
    skillLevelGapY: 50,
  },

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

  setSyncEnabled: (isSyncEnabled) => set({ isSyncEnabled }),
  updateGaps: (updates) => set(state => {
    const gaps = { ...state.gaps, ...updates };
    let profile = { ...state.profile };
    if (state.isSyncEnabled) {
      profile = syncProfile(profile, gaps);
    }
    return { gaps, profile };
  }),

  syncAllToPrimary: () => set(state => ({
    profile: syncProfile(state.profile, state.gaps)
  })),

  updateParentWindow: (updates) => set(state => {
    if (!state.profile.parent_window) return {};
    return {
      profile: {
        ...state.profile,
        parent_window: { ...state.profile.parent_window, ...updates }
      }
    };
  }),

  updateRelativeRect: (target, id, updates) => set(state => {
    let profile = { ...state.profile };
    
    // Apply basic update
    if (target === 'rarity' && profile.rarity) {
      profile.rarity = { ...profile.rarity, ...updates };
    } else if (target.includes('slot') && profile.slots) {
      const subTarget = target.split('_')[1] as 'icon' | 'level';
      profile.slots = profile.slots.map((s: SlotROI) => s.id === id 
        ? { ...s, [subTarget]: { ...s[subTarget], ...updates } }
        : s
      );
    } else if (target.includes('skill') && profile.skills) {
      const subTarget = target.split('_')[1] as 'name' | 'level';
      profile.skills = profile.skills.map((s: SkillROI) => s.id === id 
        ? { ...s, [subTarget]: { ...s[subTarget], ...updates } }
        : s
      );
    }

    // Apply Sync if enabled
    if (state.isSyncEnabled) {
      profile = syncProfile(profile, state.gaps);
    }

    return { profile };
  }),

  updatePoint: (target, updates) => set(state => {
    if (!state.profile.normalization) return {};
    return {
      profile: {
        ...state.profile,
        normalization: {
          ...state.profile.normalization,
          [target]: { ...state.profile.normalization[target], ...updates }
        }
      }
    };
  }),

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await listRoiProfiles();
      // Interceptor might have already unwrapped 'data'
      const data = Array.isArray(res) ? res : (res as any)?.data;
      set({ profiles: Array.isArray(data) ? data : [], error: null });
    } catch (err) {
      set({ error: 'Failed to fetch profiles' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectProfile: (id) => {
    const selected = get().profiles.find(p => p?.profile_id === id);
    if (selected) {
      set({ 
        selectedProfileId: id, 
        profile: ensureProfileStructure(selected),
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
      const data = (res as any)?.data || res;
      set({ jobId: data?.job_id, timestampMs });
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

/**
 * Sync helper to align all elements to the primary (ID: 0) element
 */
function syncProfile(profile: ROIProfile, gaps: ROIState['gaps']): ROIProfile {
  const newProfile = { ...profile };

  // Sync Slots
  if (newProfile.slots && newProfile.slots.length > 0) {
    const primary = newProfile.slots[0];
    if (primary.icon && primary.level) {
      newProfile.slots = newProfile.slots.map((slot, index) => {
        if (index === 0) return slot;
        if (!slot.icon || !slot.level) return slot;

        // Slot Icons Group: Sync to primary icon with slotIconGapX
        const iconX = primary.icon.x_rel + (index * gaps.slotIconGapX);
        
        // Slot Levels Group: Sync to primary level with slotLevelGapX
        const levelX = primary.level.x_rel + (index * gaps.slotLevelGapX);

        return {
          ...slot,
          icon: { ...primary.icon, x_rel: iconX, y_rel: primary.icon.y_rel },
          level: { ...primary.level, x_rel: levelX, y_rel: primary.level.y_rel }
        };
      });
    }
  }

  // Sync Skills
  if (newProfile.skills && newProfile.skills.length > 0) {
    const primary = newProfile.skills[0];
    if (primary.name && primary.level) {
      newProfile.skills = newProfile.skills.map((skill, index) => {
        if (index === 0) return skill;
        if (!skill.name || !skill.level) return skill;

        // Skill Names Group: Sync to primary name with skillNameGapY
        const nameY = primary.name.y_rel + (index * gaps.skillNameGapY);

        // Skill Levels Group: Sync to primary level with skillLevelGapY
        const levelY = primary.level.y_rel + (index * gaps.skillLevelGapY);

        return {
          ...skill,
          name: { ...primary.name, x_rel: primary.name.x_rel, y_rel: nameY },
          level: { ...primary.level, x_rel: primary.level.x_rel, y_rel: levelY }
        };
      });
    }
  }

  return newProfile;
}
