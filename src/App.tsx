import React from 'react'
import { useUIStore } from './store/uiStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ROICalibrator from './components/ROICalibrator'

function App() {
  const activeTab = useUIStore((state) => state.activeTab)

  return (
    <div className="flex h-screen bg-mhw-bg text-mhw-text overflow-hidden font-hud">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <header className="p-4 border-b border-mhw-accent/10 flex justify-between items-center bg-mhw-panel/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold tracking-widest text-mhw-accent uppercase">
            Talisman Vision <span className="text-xs opacity-50 ml-2">v0.1.0</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mhw-success animate-pulse"></span>
              <span className="text-xs uppercase opacity-70">Server Connected</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'roi-calibrator' && <ROICalibrator />}
          {activeTab === 'settings' && (
            <div className="mhw-panel p-8 text-center border border-mhw-accent/20">
              <h2 className="text-2xl font-bold text-mhw-accent mb-4 uppercase">Settings</h2>
              <p className="opacity-70 text-sm">システム設定は現在準備中です。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
