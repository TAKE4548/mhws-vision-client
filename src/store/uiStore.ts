import { create } from 'zustand'

interface UIState {
  activeTab: 'dashboard' | 'roi-calibrator' | 'settings'
  isScanning: boolean
  isSidebarCollapsed: boolean
  setActiveTab: (tab: 'dashboard' | 'roi-calibrator' | 'settings') => void
  setScanning: (scanning: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  isScanning: false,
  isSidebarCollapsed: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))
