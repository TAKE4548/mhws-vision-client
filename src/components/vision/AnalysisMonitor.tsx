import React, { useState, useEffect } from 'react';
import { Loader2, Activity, Image as ImageIcon, XCircle, Trash2, Scan, Play, Settings } from 'lucide-react';
import { useVisionStore } from '../../store/visionStore';
import { API_HOST } from '../../lib/api-client';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AnalysisMonitor: React.FC = () => {
  const { 
    status, 
    progress = 0, 
    talismans = [], 
    currentJobId, 
    cancelJob, 
    error,
    profiles,
    fetchProfiles,
    startAnalysis
  } = useVisionStore();

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      const defaultProfile = profiles.find(p => (p as any).is_default) || profiles[0];
      if (defaultProfile.profile_id) {
        setSelectedProfileId(defaultProfile.profile_id);
      }
    }
  }, [profiles, selectedProfileId]);

  const recentTalismans = [...talismans].reverse().slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Stat Area */}
      <div className="flex justify-between items-end px-2 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-3xl font-space-tech font-black text-kinetic-blue tracking-[0.2em] uppercase flex items-center gap-4 italic">
            <Activity className="w-8 h-8 animate-pulse" />
            Tactical Analysis Active
          </h2>
          <p className="font-label-tech text-[10px] uppercase tracking-widest text-on-surface/40 mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-kinetic-blue rounded-full animate-ping" />
            Neural Link: <span className="text-kinetic-blue">Synchronized</span> | Feed: <span className="text-white/60">{currentJobId || 'INITIALIZING'}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="font-label-tech text-[10px] text-white/20 uppercase mb-1">Total Integrity</div>
          <span className="text-5xl font-space-tech font-black text-kinetic-blue tabular-nums leading-none">
            {Math.round(progress)}<span className="text-xl opacity-40">%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Control Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="kinetic-surface-high p-8 relative overflow-hidden">
            {/* Progress Bar Container / Ready to Start Area */}
            <div className="space-y-6">
              {(status as string) === 'pending' ? (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="text-center space-y-2">
                    <span className="font-space-tech text-[10px] text-kinetic-blue uppercase tracking-[0.3em]">System Primed</span>
                    <h3 className="text-2xl font-space-tech font-black text-white italic uppercase">READY FOR TACTICAL SCAN</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-lowest/50 p-6 border border-white/5 rounded-sm">
                    <div className="space-y-2">
                       <label className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                         <Settings className="w-2 h-2" />
                         Detection Profile
                       </label>
                       <select 
                         value={selectedProfileId}
                         onChange={(e) => setSelectedProfileId(e.target.value)}
                         className="w-full bg-surface-high border-none text-[10px] font-space-tech text-kinetic-blue py-3 px-4 focus:ring-1 focus:ring-kinetic-blue/40 appearance-none uppercase transition-all"
                       >
                         {profiles.length > 0 ? (
                           profiles.map(p => (
                             <option key={p.profile_id} value={p.profile_id}>{p.name} {(p as any).is_default ? '(DEFAULT)' : ''}</option>
                           ))
                         ) : (
                           <option value="">NO PROFILES DETECTED</option>
                         )}
                       </select>
                       {profiles.length === 0 && (
                          <p className="text-[8px] font-label-tech text-kinetic-amber uppercase animate-pulse">
                            Create a profile in ROI Calibrator first
                          </p>
                       )}
                    </div>
                    
                    <div className="flex items-end">
                      <button 
                        onClick={() => startAnalysis(selectedProfileId)}
                        disabled={!selectedProfileId || (status as string) !== 'pending'}
                        className="w-full py-3 bg-kinetic-blue text-black font-space-tech font-black text-[12px] uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-white hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all disabled:opacity-20"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        INITIATE ANALYSIS
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center font-space-tech text-[10px] font-black tracking-widest text-kinetic-blue">
                    <span className="flex items-center gap-2">
                       <Loader2 className="w-3 h-3 animate-spin" />
                       {status === 'completed' ? 'SCAN COMPLETE' : 'SCANNING VIDEO STREAM'}
                    </span>
                    <span className="tabular-nums">{progress.toFixed(1)}% COMPLETE</span>
                  </div>
                  
                  <div className="h-4 bg-surface-lowest border border-white/5 relative overflow-hidden p-0.5">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '5% 100%' }} />
                    
                    <div 
                      className="h-full bg-kinetic-blue shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-700 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Energy Flow Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-32 animate-flow pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Discrete Progress Pips */}
                  <div className="grid grid-cols-10 gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`h-1 transition-all duration-700 ${progress > (i + 1) * 10 ? 'bg-kinetic-blue shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Status Messages */}
            <div className="border-t border-white/5 pt-6 mt-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="block font-label-tech text-[8px] text-white/20 uppercase">Module Status</span>
                    <span className="block font-space-tech text-[10px] text-on-surface uppercase pr-2 border-r border-white/5">OCR Vision Engine: ACTIVE</span>
                 </div>
                 <div className="space-y-1">
                    <span className="block font-label-tech text-[8px] text-white/20 uppercase">Buffer Info</span>
                    <span className="block font-space-tech text-[10px] text-on-surface uppercase">SSE Stream: ESTABLISHED</span>
                 </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="kinetic-surface-high border-kinetic-danger/30 bg-kinetic-danger/5 p-6 flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-kinetic-danger/10 rounded-full">
                  <XCircle className="w-6 h-6 text-kinetic-danger" />
                </div>
                <div>
                  <span className="block font-space-tech text-xs font-black text-kinetic-danger uppercase italic">Terminal Failure detected</span>
                  <p className="font-label-tech text-[10px] text-kinetic-danger/60 uppercase mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button 
              onClick={cancelJob}
              disabled={status === 'completed' || status === 'failed' || status === 'cancelled'}
              className="group flex items-center gap-4 font-space-tech text-[11px] font-black uppercase tracking-wider text-kinetic-danger border border-kinetic-danger/20 px-10 py-4 hover:bg-kinetic-danger hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-125 transition-transform" />
              ABORT TACTICAL SCAN
            </button>
          </div>
        </div>

        {/* Live Feed / Discovery Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-space-tech text-[10px] font-black text-kinetic-blue uppercase tracking-widest italic flex items-center gap-2">
              <ImageIcon className="w-3 h-3" />
              Live Discoveries
            </span>
            <span className="font-label-tech text-[9px] text-on-surface/20 uppercase">{talismans.length} DETECTED</span>
          </div>

          <div className="space-y-3">
            {recentTalismans.length > 0 ? (
              recentTalismans.map((t) => (
                <div key={t.capture_id} className="kinetic-surface-high p-3 flex gap-4 animate-in slide-in-from-right-4 duration-500 border-l-2 border-kinetic-blue/40">
                  <div className="w-16 h-16 bg-surface-lowest shrink-0 overflow-hidden rounded-sm relative">
                    {t.image_url ? (
                      <img 
                        src={t.image_url.startsWith('/') ? `${API_HOST}${t.image_url}` : t.image_url} 
                        className="w-full h-full object-cover" 
                        alt="Discovery" 
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.dataset.retry === 'true') {
                            if (!target.src.includes('via.placeholder.com')) {
                              target.src = 'https://via.placeholder.com/120x160?text=NONE';
                            }
                          } else {
                            target.dataset.retry = 'true';
                            console.log(`[Monitor] Retrying image load for: ${t.capture_id}`);
                            setTimeout(() => {
                              const baseSrc = target.src.split('?')[0];
                              target.src = `${baseSrc}?t=${Date.now()}`;
                            }, 1500);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center animate-pulse">
                        <Scan className="w-4 h-4 text-kinetic-blue/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 py-1">
                    <div className="flex justify-between items-center">
                       <span className="font-space-tech text-[10px] font-black text-on-surface">UNIT_{t.capture_id.slice(-4).toUpperCase()}</span>
                       <span className={`font-label-tech text-[8px] px-1.5 py-0.5 rounded ${t.validation_status === 'processing' ? 'bg-kinetic-blue/20 text-kinetic-blue animate-pulse' : 'bg-kinetic-amber/20 text-kinetic-amber'}`}>
                          {t.validation_status?.toUpperCase()}
                       </span>
                    </div>
                    {(t.skills?.length || 0) > 0 && (
                       <p className="font-label-tech text-[9px] text-white/40 truncate uppercase">
                         {t.skills![0].name} LV{t.skills![0].level}
                       </p>
                    )}
                    <div className="w-full h-0.5 bg-white/5 rounded-full mt-2">
                      <div 
                        className="h-full bg-kinetic-blue transition-all duration-300" 
                        style={{ width: t.validation_status === 'processing' ? '40%' : '100%' }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="kinetic-surface-high border-dashed border-white/5 p-12 flex flex-col items-center justify-center opacity-20">
                 <Loader2 className="w-8 h-8 animate-spin mb-4" />
                 <span className="font-label-tech text-[9px] uppercase tracking-widest text-center">Synchronizing with<br/>video stream...</span>
              </div>
            )}
            
            {talismans.length > 3 && (
               <div className="text-center pt-2">
                 <span className="font-label-tech text-[8px] text-white/20 uppercase tracking-widest">+ {talismans.length - 3} OTHER FRAGMENTS IN QUEUE</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisMonitor;
