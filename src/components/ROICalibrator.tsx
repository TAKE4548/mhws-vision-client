import React from 'react'
import { Maximize2, Move, Box, Save, History } from 'lucide-react'
import InteractiveCanvas from './roi/InteractiveCanvas'
import { useROIStore } from '../store/roiStore'

const ROICalibrator = () => {
  const { roi, updateRoi, resetRoi } = useROIStore();

  // 1920x1080 を基準とした表示用ピクセル計算
  const displayCoords = {
    x: Math.round(roi.x * 1920),
    y: Math.round(roi.y * 1080),
    w: Math.round(roi.w * 1920),
    h: Math.round(roi.h * 1080),
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* Simulation Area */}
      <div className="col-span-8 flex flex-col gap-4">
        <InteractiveCanvas />

        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-mhw-panel border border-mhw-accent/30 rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 transition-all group">
            <Maximize2 size={16} className="text-mhw-accent group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest text-mhw-text">Auto Detect Table Area</span>
          </button>
          <button 
            onClick={resetRoi}
            className="flex-1 py-3 bg-mhw-panel border border-mhw-accent/30 rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 transition-all group"
          >
            <Move size={16} className="text-mhw-accent group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest text-mhw-text">Manual Center Reset</span>
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
                <span className="text-mhw-accent font-mono">{displayCoords.x} px</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.001"
                value={roi.x}
                onChange={(e) => updateRoi({ x: parseFloat(e.target.value) })}
                className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full cursor-pointer" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Y Offset</span>
                <span className="text-mhw-accent font-mono">{displayCoords.y} px</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.001"
                value={roi.y}
                onChange={(e) => updateRoi({ y: parseFloat(e.target.value) })}
                className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full cursor-pointer" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Width</span>
                <span className="text-mhw-accent font-mono">{displayCoords.w} px</span>
              </div>
              <input 
                type="range" 
                min="0.01" max="1" step="0.001"
                value={roi.w}
                onChange={(e) => updateRoi({ w: parseFloat(e.target.value) })}
                className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full cursor-pointer" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                <span>Height</span>
                <span className="text-mhw-accent font-mono">{displayCoords.h} px</span>
              </div>
              <input 
                type="range" 
                min="0.01" max="1" step="0.001"
                value={roi.h}
                onChange={(e) => updateRoi({ h: parseFloat(e.target.value) })}
                className="w-full accent-mhw-accent h-1 bg-white/5 appearance-none rounded-full cursor-pointer" 
              />
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button className="w-full py-3 bg-mhw-accent text-mhw-bg font-black rounded flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(202,192,128,0.2)]">
              <Save size={18} /> Apply Calibration
            </button>
            <button 
              onClick={resetRoi}
              className="w-full py-3 border border-mhw-accent/30 text-mhw-accent font-bold rounded flex items-center justify-center gap-3 hover:bg-mhw-accent/5 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              <History size={18} /> Restore Default
            </button>
          </div>
        </div>

        <div className="mhw-panel border border-mhw-accent/5 p-4 bg-black/40">
          <div className="text-[10px] uppercase font-bold text-mhw-accent opacity-50 mb-2">Calibration Tips</div>
          <p className="text-[11px] text-mhw-text/50 leading-relaxed font-hud">
            護石一覧画面の表部分が正確に収まるように ROI を調整してください。
            スキルスロットの位置が固定されることで、認識精度が向上します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ROICalibrator
