import React from 'react'
import { LayoutDashboard, Target, Settings, Info } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Sidebar = () => {
  const { activeTab, setActiveTab } = useUIStore()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roi-calibrator', label: 'ROI Calibrator', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <aside className="w-64 bg-mhw-panel border-r border-mhw-accent/20 flex flex-col h-full shadow-2xl z-20">
      <div className="p-6 border-b border-mhw-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mhw-accent/10 border border-mhw-accent/50 flex items-center justify-center rounded">
            <Info className="text-mhw-accent" size={20} />
          </div>
          <div>
            <div className="font-bold text-mhw-accent text-sm tracking-tighter uppercase">Gravity</div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest">Vision System</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-all relative group",
                isActive 
                  ? "text-mhw-accent bg-mhw-accent/5" 
                  : "text-mhw-text/60 hover:text-mhw-text hover:bg-white/5"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-mhw-accent" : "opacity-50")} />
              <span className="text-sm font-bold tracking-widest uppercase">{item.label}</span>
              
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-mhw-accent shadow-[0_0_10px_rgba(201,160,99,0.5)]" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-6 border-t border-mhw-accent/10">
        <div className="mhw-panel p-3 border border-mhw-accent/10 bg-black/30 rounded text-center">
          <div className="text-[10px] uppercase opacity-40 mb-1">Current Hunting Mode</div>
          <div className="text-xs font-bold text-mhw-success tracking-widest">STABLE SCAN</div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
