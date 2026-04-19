import { create } from 'zustand'

interface UIState {
  activeTab: 'dashboard' | 'roi-calibrator' | 'settings'
  isScanning: boolean
  isSidebarCollapsed: boolean
  apiMode: 'live' | 'stub'
  apiErrorMode: boolean
  setActiveTab: (tab: 'dashboard' | 'roi-calibrator' | 'settings') => void
  setScanning: (scanning: boolean) => void
  toggleSidebar: () => void
  setApiMode: (mode: 'live' | 'stub') => void
  setApiErrorMode: (enabled: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  isScanning: false,
  isSidebarCollapsed: false,
  apiMode: 'live',
  apiErrorMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setApiMode: (mode) => set({ apiMode: mode }),
  setApiErrorMode: (enabled) => set({ apiErrorMode: enabled }),
}))
