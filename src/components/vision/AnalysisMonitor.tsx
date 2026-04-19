import React, { useEffect } from 'react';
import { Loader2, Activity, ImageIcon, XCircle } from 'lucide-react';
import { useVisionStore } from '../../store/visionStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AnalysisMonitor: React.FC = () => {
  const { status, progress, currentThumbnail, currentJobId, reset, pollStatus, error } = useVisionStore();

  useEffect(() => {
    if (status === 'processing' && currentJobId) {
      pollStatus();
    }
  }, [status, currentJobId, pollStatus]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header Stat Area */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-2xl font-black text-mhw-accent tracking-[0.2em] uppercase flex items-center gap-3">
            <Activity className="w-6 h-6 animate-pulse" />
            Analyzing Scan Data
          </h2>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">
            System status: <span className="text-mhw-success">Processing</span> | Syncing with vision engine...
          </p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-mhw-accent/20 tabular-nums leading-none">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Display */}
        <div className="md:col-span-2 space-y-6">
          <div className="mhw-panel relative overflow-hidden bg-mhw-panel/80">
            {/* Progress Bar Container */}
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-mhw-accent">
                <span>Total Progress</span>
                <span className="tabular-nums">{progress.toFixed(1)}%</span>
              </div>
              
              <div className="h-4 bg-mhw-bg/50 border border-mhw-accent/20 rounded-sm relative overflow-hidden p-0.5">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '10% 100%' }} />
                
                <div 
                  className="h-full bg-mhw-accent shadow-[0_0_15px_rgba(202,176,128,0.5)] transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Energy Flow Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-flow pointer-events-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={cn(
                    "h-1 rounded-full transition-colors duration-500",
                    progress > (i + 1) * 25 ? "bg-mhw-accent" : "bg-mhw-accent/10"
                  )} />
                ))}
              </div>
            </div>

            {/* Status Messages */}
            <div className="border-t border-mhw-accent/10 pt-4 mt-2">
              <div className="flex items-center gap-3 text-xs opacity-70">
                <Loader2 className="w-3 h-3 animate-spin text-mhw-accent" />
                <span className="animate-pulse">Detecting Talisman patterns...</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mhw-panel border-mhw-danger/30 bg-mhw-danger/5 text-mhw-danger p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 font-bold" />
                <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
              </div>
              <button 
                onClick={reset}
                className="text-[10px] border border-mhw-danger/50 px-3 py-1 rounded hover:bg-mhw-danger hover:text-white transition-colors uppercase font-bold"
              >
                Reset System
              </button>
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="mhw-panel flex flex-col items-center justify-center space-y-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-mhw-accent/70 w-full border-b border-mhw-accent/10 pb-2 mb-2">
            Live Feed
          </div>
          <div className="w-full aspect-video bg-mhw-bg/80 border border-mhw-accent/20 rounded relative flex items-center justify-center overflow-hidden">
            {currentThumbnail ? (
              <img 
                src={currentThumbnail} 
                alt="Scan Preview" 
                className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-300" 
              />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-[10px] uppercase font-bold">Waiting for stream...</span>
              </div>
            )}
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none z-10 bg-[length:100%_2px,3px_100%]" />
          </div>
          <p className="text-[8px] text-center opacity-50 uppercase tracking-tighter leading-tight">
            Frame processing at 30fps<br/>
            Neural verification: Active
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={reset}
          className="mhw-button bg-transparent border border-mhw-accent/40 text-mhw-accent hover:bg-mhw-accent/10 text-xs px-8"
        >
          Cancel Scan
        </button>
      </div>
    </div>
  );
};

export default AnalysisMonitor;
