import { create } from 'zustand';

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
  name: string;
  resolution: { width: number; height: number };
  parent_window: Rect;
  rarity: RelativeRect;
  slots: SlotROI[];
  skills: SkillROI[];
  normalization: NormalizationPoints;
}

export type CalibrationStep = 'parent' | 'items' | 'normalization' | 'save';
export type ActiveTarget = 'parent' | 'rarity' | 'slot_icon' | 'slot_level' | 'skill_name' | 'skill_level' | 'bg_point' | 'frame_point';

interface ROIState {
  step: CalibrationStep;
  activeTarget: ActiveTarget;
  activeId: number; // For slots/skills (0, 1, 2)
  profile: ROIProfile;
  previewImage: string | null;
  
  setStep: (step: CalibrationStep) => void;
  setActiveTarget: (target: ActiveTarget, id?: number) => void;
  setPreviewImage: (image: string | null) => void;
  
  updateParentWindow: (updates: Partial<Rect>) => void;
  updateRelativeRect: (target: ActiveTarget, id: number, updates: Partial<RelativeRect>) => void;
  updatePoint: (target: 'bg_point' | 'frame_point', updates: Partial<Point>) => void;
  
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

export const useROIStore = create<ROIState>((set) => ({
  step: 'parent',
  activeTarget: 'parent',
  activeId: 0,
  profile: createDefaultProfile(),
  previewImage: null,

  setStep: (step) => set({ step }),
  setActiveTarget: (activeTarget, activeId = 0) => set({ activeTarget, activeId }),
  setPreviewImage: (previewImage) => set({ previewImage }),

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
  resetProfile: () => set({ profile: createDefaultProfile(), step: 'parent', activeTarget: 'parent' }),
}));

