import React from 'react'
import { LayoutDashboard, Target, Settings, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useServerStore } from '../store/serverStore'
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
  } = useUIStore()

  const {
    isStubMode,
    setStubMode
  } = useServerStore()

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

      {/* Footer Info */}
      <div className="p-6 mt-auto space-y-4">
        {/* API Mode Toggle */}
        {!isSidebarCollapsed && (
          <div className="animate-in fade-in duration-500">
            <div className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest mb-2">API Connection Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStubMode(true)}
                className={cn(
                  "py-1 px-2 text-[8px] font-black tracking-tighter uppercase rounded-sm border transition-all",
                  isStubMode 
                    ? "bg-kinetic-blue text-white border-kinetic-blue shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
                    : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                )}
              >
                Stub Mode
              </button>
              <button
                onClick={() => setStubMode(false)}
                className={cn(
                  "py-1 px-2 text-[8px] font-black tracking-tighter uppercase rounded-sm border transition-all",
                  !isStubMode 
                    ? "bg-kinetic-amber text-black border-kinetic-amber shadow-[0_0_10px_rgba(240,200,80,0.3)]" 
                    : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                )}
              >
                Live Server
              </button>
            </div>
          </div>
        )}

        <div className={cn(
          "kinetic-surface-mid transition-all duration-300",
          isSidebarCollapsed ? "p-2 aspect-square flex items-center justify-center" : "p-4"
        )}>
          {isSidebarCollapsed ? (
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]",
              isStubMode ? "text-kinetic-blue bg-kinetic-blue" : "text-kinetic-amber bg-kinetic-amber"
            )} />
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest mb-1">Status</div>
              <div className={cn(
                "font-space-tech text-[10px] font-black tracking-widest flex items-center gap-2",
                isStubMode ? "text-kinetic-blue" : "text-kinetic-amber"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_currentColor]",
                  isStubMode ? "bg-kinetic-blue" : "bg-kinetic-amber"
                )} />
                {isStubMode ? 'MOCK_ENGINE' : 'LIVE_STABLE'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
