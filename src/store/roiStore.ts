import { create } from 'zustand';

export interface ROICoordinates {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ROIState {
  roi: ROICoordinates;
  setRoi: (roi: ROICoordinates) => void;
  updateRoi: (updates: Partial<ROICoordinates>) => void;
  resetRoi: () => void;
}

const DEFAULT_ROI: ROICoordinates = {
  x: 0.3,
  y: 0.2,
  w: 0.4,
  h: 0.5
};

export const useROIStore = create<ROIState>((set) => ({
  roi: DEFAULT_ROI,
  
  setRoi: (roi) => set({ roi }),
  
  updateRoi: (updates) => set((state) => ({
    roi: {
      ...state.roi,
      ...updates,
      // 0.0 ~ 1.0 の範囲にクランプ
      x: Math.max(0, Math.min(1, updates.x !== undefined ? updates.x : state.roi.x)),
      y: Math.max(0, Math.min(1, updates.y !== undefined ? updates.y : state.roi.y)),
      w: Math.max(0.01, Math.min(1, updates.w !== undefined ? updates.w : state.roi.w)),
      h: Math.max(0.01, Math.min(1, updates.h !== undefined ? updates.h : state.roi.h)),
    }
  })),
  
  resetRoi: () => set({ roi: DEFAULT_ROI }),
}));
