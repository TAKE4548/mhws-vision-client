import React from 'react'
import { Search, Filter, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react'

// Mock Data
const MOCK_CAPTURES = [
  { id: 'CAP-001', name: '攻撃の護石 VII', skill1: '攻撃 Lv3', skill2: '回避性能 Lv2', slots: [4, 2, 1], confidence: 0.98, status: 'OK' },
  { id: 'CAP-002', name: '超会心の護石 V', skill1: '超会心 Lv2', skill2: '体力増強 Lv3', slots: [3, 1, 0], confidence: 0.82, status: 'OK' },
  { id: 'CAP-003', name: '弱点特効の護石 III', skill1: '弱点特効 Lv2', skill2: '見切り Lv1', slots: [2, 0, 0], confidence: 0.54, status: 'REVIEW' },
  { id: 'CAP-004', name: '匠の護石 IV', skill1: '匠 Lv1', skill2: '満足感 Lv2', slots: [4, 3, 0], confidence: 0.95, status: 'OK' },
]

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Search & Tool Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mhw-accent opacity-50" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH CAPTURES..." 
            className="w-full bg-mhw-panel border border-mhw-accent/20 rounded py-2 pl-10 pr-4 text-xs tracking-widest focus:outline-none focus:border-mhw-accent transition-all uppercase placeholder:opacity-30"
          />
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-mhw-panel border border-mhw-accent/20 rounded hover:bg-mhw-accent/10 transition-all text-mhw-accent">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-mhw-accent text-mhw-bg font-bold text-xs rounded hover:brightness-110 transition-all shadow-[0_0_15px_rgba(201,160,99,0.3)] uppercase tracking-tighter">
            <RefreshCcw size={14} /> New Scan
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_CAPTURES.map((cap) => (
          <div 
            key={cap.id} 
            className="mhw-panel border border-mhw-accent/20 bg-gradient-to-br from-mhw-panel to-black group hover:border-mhw-accent/50 transition-all overflow-hidden relative"
          >
            {/* Confidence Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <div 
                className="h-full bg-mhw-accent shadow-[0_0_8px_gold]" 
                style={{ width: `${cap.confidence * 100}%` }}
              />
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-mhw-accent font-bold tracking-tighter opacity-70">{cap.id}</span>
                {cap.status === 'OK' ? (
                  <CheckCircle2 size={16} className="text-mhw-success" />
                ) : (
                  <AlertCircle size={16} className="text-mhw-danger animate-pulse" />
                )}
              </div>

              <div className="aspect-video bg-black/40 border border-white/5 rounded flex items-center justify-center relative group-hover:bg-black/20 transition-all">
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-20">Preview Image</span>
                {/* Confidence Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 border border-mhw-accent/30 rounded text-[9px] font-bold text-mhw-accent">
                  {(cap.confidence * 100).toFixed(0)}% CONF
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm tracking-tight">{cap.name}</h3>
                <div className="flex flex-col gap-1 text-[11px] opacity-70">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>{cap.skill1}</span>
                    <span className="text-mhw-accent">Lv3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{cap.skill2}</span>
                    <span className="text-mhw-accent">Lv2</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 pt-2">
                {cap.slots.map((s, i) => (
                  <div key={i} className="flex-1 h-6 bg-mhw-accent/5 border border-mhw-accent/20 rounded flex items-center justify-center text-[10px] font-bold">
                    {s > 0 ? s : '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Empty placeholder card to show potential for more */}
        <div className="mhw-panel border border-dashed border-mhw-accent/10 flex flex-col items-center justify-center p-6 opacity-30">
          <div className="w-12 h-12 rounded-full border border-dashed border-mhw-accent/30 flex items-center justify-center mb-2">
            <RefreshCcw size={20} />
          </div>
          <span className="text-[10px] uppercase tracking-widest">Waiting for Captures</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
