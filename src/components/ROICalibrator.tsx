import React from 'react'
import { Target, Maximize2, Move, Box, Save, History } from 'lucide-react'

const ROICalibrator = () => {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* Simulation Area */}
      <div className="col-span-8 flex flex-col gap-4">
        <div className="aspect-video bg-black relative rounded border-2 border-mhw-accent/10 overflow-hidden shadow-inner group">
          {/* Mock Video Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest opacity-20 font-bold">Calibration Source Preview</span>
          </div>

          {/* ROI Overlay Mock */}
          <div 
            className="absolute border-2 border-mhw-accent shadow-[0_0_15px_rgba(201,160,99,0.5)] bg-mhw-accent/5 cursor-move"
            style={{ top: '20%', left: '30%', width: '40%', height: '50%' }}
          >
            {/* Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-mhw-accent -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-mhw-accent translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-mhw-accent -translate-x-1/2 translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-mhw-accent translate-x-1/2 translate-y-1/2" />
            
            <div className="absolute top-2 left-2 flex gap-2">
              <Target size={14} className="text-mhw-accent drop-shadow-md" />
              <span className="text-[10px] bg-mhw-accent text-mhw-bg font-bold px-1 rounded uppercase">Current ROI</span>
            </div>
          </div>

          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none border border-mhw-accent/5 flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <div className="w-8 h-8 border-t-2 border-l-2 border-mhw-accent/40" />
              <div className="w-8 h-8 border-t-2 border-r-2 border-mhw-accent/40" />
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-8 border-b-2 border-l-2 border-mhw-accent/40" />
              <div className="w-8 h-8 border-b-2 border-r-2 border-mhw-accent/40" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-mhw-panel border border-mhw-accent/30 rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 transition-all">
            <Maximize2 size={16} className="text-mhw-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">Auto Detect Table Area</span>
          </button>
          <button className="flex-1 py-3 bg-mhw-panel border border-mhw-accent/30 rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 transition-all">
            <Move size={16} className="text-mhw-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">Manual Center Reset</span>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="col-span-4 space-y-6">
        <div className="mhw-panel border border-mhw-accent/20 p-6 space-y-6">
          <div className="border-b border-mhw-accent/10 pb-4 flex items-center gap-3">
            <Box size={18} className="text-mhw-accent" />
            <h2 className="text-lg font-bold text-mhw-accent uppercase tracking-widest">ROI Parameters</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>X Offset</span>
                <span className="text-mhw-accent font-hud">420 px</span>
              </div>
              <input type="range" className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Y Offset</span>
                <span className="text-mhw-accent font-hud">180 px</span>
              </div>
              <input type="range" className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Width</span>
                <span className="text-mhw-accent font-hud">640 px</span>
              </div>
              <input type="range" className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Height</span>
                <span className="text-mhw-accent font-hud">360 px</span>
              </div>
              <input type="range" className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full" />
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button className="w-full py-3 bg-mhw-accent text-mhw-bg font-bold rounded flex items-center justify-center gap-3 hover:brightness-110 transition-all uppercase tracking-widest">
              <Save size={18} /> Apply Calibration
            </button>
            <button className="w-full py-3 border border-mhw-accent/30 text-mhw-accent font-bold rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 transition-all uppercase tracking-widest">
              <History size={18} /> Restore Default
            </button>
          </div>
        </div>

        <div className="mhw-panel border border-mhw-accent/5 p-4 bg-black/40">
          <div className="text-[10px] uppercase font-bold text-mhw-accent opacity-50 mb-2">Calibration Tips</div>
          <p className="text-[11px] opacity-50 leading-relaxed">
            護石一覧画面の表部分が正確に収まるように ROI を調整してください。
            スキルスロットの位置が固定されることで、認識精度が向上します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ROICalibrator
