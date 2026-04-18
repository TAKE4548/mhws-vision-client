import { create } from 'zustand'

interface UIState {
  activeTab: 'dashboard' | 'roi-calibrator' | 'settings'
  isScanning: boolean
  setActiveTab: (tab: 'dashboard' | 'roi-calibrator' | 'settings') => void
  setScanning: (scanning: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  isScanning: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setScanning: (scanning) => set({ isScanning: scanning }),
}))
