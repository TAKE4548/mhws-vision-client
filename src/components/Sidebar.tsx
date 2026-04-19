import React from 'react'
import { LayoutDashboard, Target, Settings, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSidebarCollapsed, 
    toggleSidebar,
    apiMode,
    setApiMode,
    apiErrorMode,
    setApiErrorMode
  } = useUIStore()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roi-calibrator', label: 'ROI Calibrator', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <aside 
      className={cn(
        "bg-surface-lowest flex flex-col h-full transition-all duration-500 ease-in-out z-20 relative group",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Label/Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 w-6 h-6 bg-surface-highest rounded-full border-none flex items-center justify-center text-kinetic-amber shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30 hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Brand */}
      <div className={cn("p-6 flex items-center transition-all", isSidebarCollapsed ? "justify-center" : "gap-4")}>
        <div className="w-10 h-10 kinetic-glass border-none flex items-center justify-center rounded-tech shrink-0">
          <Info className="text-kinetic-amber" size={20} />
        </div>
        {!isSidebarCollapsed && (
          <div className="animate-in fade-in duration-500">
            <div className="font-space-tech font-black text-kinetic-amber text-sm tracking-tight-eng uppercase">Gravity</div>
            <div className="font-label-tech text-[8px] text-white/20 uppercase tracking-wide-tech">Vision System v4.2</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center transition-all relative group/nav",
                isSidebarCollapsed ? "justify-center px-0 py-4" : "px-6 py-4 gap-4",
                isActive 
                  ? "text-on-surface bg-surface-bright/5" 
                  : "text-white/20 hover:text-on-surface hover:bg-white/5"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-colors", 
                  isActive ? "text-kinetic-amber" : "group-hover/nav:text-white"
                )} 
              />
              
              {!isSidebarCollapsed && (
                <span className="font-space-tech text-xs font-black tracking-wide-tech uppercase animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
              
              {/* Highlight Glow */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-kinetic-amber shadow-[0_0_12px_#ffc174] rounded-r-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* System Settings / API Mode Toggle (REQ-014) */}
      <div className={cn("px-4 py-4 space-y-4 border-t border-white/5", isSidebarCollapsed ? "px-2" : "px-6")}>
        {!isSidebarCollapsed && (
          <div className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest mb-1">System Mode</div>
        )}
        
        {/* API Mode Toggle */}
        <button
          onClick={() => setApiMode(apiMode === 'live' ? 'stub' : 'live')}
          className={cn(
            "w-full flex items-center transition-all duration-300 rounded-tech overflow-hidden",
            isSidebarCollapsed ? "justify-center h-10" : "px-3 py-2 gap-3",
            apiMode === 'stub' 
              ? "bg-status-error/10 border border-status-error/30 text-status-error" 
              : "bg-surface-bright/5 border border-white/5 text-white/40 hover:bg-white/10"
          )}
          title={apiMode === 'stub' ? "Switch to Live Mode" : "Switch to Stub Mode"}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            apiMode === 'stub' ? "bg-status-error shadow-[0_0_5px_#f87171]" : "bg-white/20"
          )} />
          {!isSidebarCollapsed && (
            <span className="font-space-tech text-[10px] uppercase font-black tracking-wider">
              {apiMode === 'stub' ? 'API_STUB_MODE' : 'LIVE_SERVER'}
            </span>
          )}
        </button>

        {/* Error Simulation Toggle (Only active in Stub mode) */}
        {apiMode === 'stub' && (
          <button
            onClick={() => setApiErrorMode(!apiErrorMode)}
            className={cn(
              "w-full flex items-center transition-all duration-300 rounded-tech overflow-hidden border animate-in fade-in slide-in-from-bottom-2",
              isSidebarCollapsed ? "justify-center h-10" : "px-3 py-2 gap-3",
              apiErrorMode 
                ? "bg-status-error text-white border-status-error shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                : "bg-surface-lowest border-status-error/30 text-status-error/60"
            )}
            title={apiErrorMode ? "Stop Simulated Errors" : "Simulate API Error"}
          >
            <Info size={14} className={apiErrorMode ? "animate-pulse" : ""} />
            {!isSidebarCollapsed && (
              <span className="font-space-tech text-[10px] uppercase font-black tracking-wider">
                {apiErrorMode ? 'ERROR_SIM_ON' : 'ERR_SIM_OFF'}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-6">
        <div className={cn(
          "kinetic-surface-mid transition-all duration-300",
          isSidebarCollapsed ? "p-2 aspect-square flex items-center justify-center" : "p-4"
        )}>
          {isSidebarCollapsed ? (
            <div className="w-2 h-2 rounded-full bg-kinetic-amber animate-pulse shadow-[0_0_8px_#ffc174]" />
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest mb-1">Status</div>
              <div className="font-space-tech text-[10px] font-black text-kinetic-amber tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-kinetic-amber animate-pulse shadow-[0_0_5px_#ffc174]" />
                STABLE_SCAN
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
