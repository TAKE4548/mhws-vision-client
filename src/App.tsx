import React, { useEffect } from 'react'
import { useUIStore } from './store/uiStore'
import { useServerStore } from './store/serverStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ROICalibrator from './components/ROICalibrator'

function App() {
  const activeTab = useUIStore((state) => state.activeTab)
  const { isOnline, checkHealth } = useServerStore()

  useEffect(() => {
    // 起動時に接続確認を実行
    checkHealth()
  }, [checkHealth])

  return (
    <div className="flex h-screen bg-surface-lowest text-on-surface overflow-hidden font-hud">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-surface-base">
        <header className="p-4 border-b border-mhw-accent/10 flex justify-between items-center bg-mhw-panel/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold tracking-widest text-mhw-accent uppercase">
            Talisman Vision <span className="text-xs opacity-50 ml-2">v0.1.0</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-mhw-success shadow-[0_0_8px_rgba(74,153,144,0.6)] animate-pulse' : 'bg-mhw-danger shadow-[0_0_8px_rgba(170,51,51,0.6)]'}`}></span>
              <span className={`text-xs uppercase tracking-tighter ${isOnline ? 'opacity-70' : 'text-mhw-danger'}`}>
                {isOnline ? 'Server Online' : 'Server Offline'}
              </span>
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
