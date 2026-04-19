import React, { useState } from 'react';
import { Search, Trash2, RefreshCcw, Scan, Clock, ShieldAlert, FileText, BarChart3, Target } from 'lucide-react';
import { useVisionStore, Talisman } from '../store/visionStore';
import VideoUploader from './vision/VideoUploader';
import AnalysisMonitor from './vision/AnalysisMonitor';
import TalismanDetailsModal from './vision/TalismanDetailsModal';

const TalismanCard: React.FC<{ talisman: Talisman, onClick: () => void }> = ({ talisman, onClick }) => {
  const imageUrl = talisman.image_url || `http://localhost:8000/api/v1/assets/crops/${talisman.capture_id}.webp`;
  const timestamp = talisman.timestamp_ms 
    ? new Date(talisman.timestamp_ms).toLocaleTimeString('ja-JP', { hour12: false })
    : new Date().toLocaleTimeString('ja-JP', { hour12: false });

  const isProcessing = talisman.validation_status === 'processing';

  return (
    <div 
      onClick={!isProcessing ? onClick : undefined}
      className={`kinetic-surface-high group hover:bg-surface-bright/20 transition-all overflow-hidden relative flex h-48 rounded-tech border-none ${isProcessing ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
    >
      {/* 1. Left: Vertical Crop Image (3:4 Ratio) */}
      <div className="w-[120px] h-full bg-surface-lowest relative overflow-hidden shrink-0">
        {!isProcessing && (
          <img 
            src={imageUrl} 
            alt="Crop" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x160?text=SCAN';
            }}
          />
        )}
        {isProcessing && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-high/50">
            <RefreshCcw className="w-6 h-6 text-kinetic-blue animate-spin mb-2" />
            <span className="font-space-tech text-[8px] text-kinetic-blue uppercase">OCR IN PROGRESS</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-high/50" />
        
        {/* Bleeding Label */}
        <div className={`absolute top-0 left-0 px-2 py-0.5 rounded-br-sm shadow-lg z-10 ${isProcessing ? 'bg-kinetic-blue' : 'bg-kinetic-amber'}`}>
           <span className="font-space-tech text-[8px] font-black text-black">
             {isProcessing ? 'PROBING' : 'MOCK_TAL'}
           </span>
        </div>
      </div>

      {/* 2. Right: Data Summary */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div className="space-y-3">
          {/* Header: Confidence (L) / Timestamp (R) */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
               <div className={talisman.confidence < 0.9 ? "text-kinetic-amber" : "text-kinetic-blue"}>
                  <Target size={10} />
               </div>
               <span className={`font-space-tech text-[10px] font-black ${talisman.confidence < 0.9 ? "text-kinetic-amber" : "text-white/40"}`}>
                 {(talisman.confidence * 100).toFixed(1)}%
               </span>
            </div>
            <div className="flex items-center gap-1 text-white/10">
               <Clock size={10} />
               <span className="font-label-tech text-[8px] tracking-widest">{timestamp}</span>
            </div>
          </div>

          {/* Row 1: Rarity Badge */}
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-tech font-space-tech text-[9px] font-black tracking-widest ${isProcessing ? 'bg-white/5 text-white/20' : 'bg-white/5 text-on-surface'}`}>
              RARE {talisman.rarity.value || '?'}
            </span>
          </div>

          {/* Row 2: Slot Configuration */}
          <div className="flex gap-2">
            {(talisman.slots.value.length > 0 ? talisman.slots.value : [0, 0, 0]).map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={s > 0 ? "text-kinetic-blue" : "text-white/5"}>
                  <div className="font-space-tech text-[10px] font-black">{s > 0 ? `[${s}]` : '[-]'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 3: Skill List */}
          <div className="space-y-1">
            {talisman.skills.length > 0 ? (
              talisman.skills.slice(0, 2).map((skill, idx) => (
                <div key={idx} className="flex justify-between items-center group/skill">
                  <span className="font-label-tech text-[9px] text-white/40 truncate mr-2 uppercase group-hover/skill:text-on-surface transition-colors">
                    {skill.name}
                  </span>
                  <span className="font-space-tech text-[9px] font-black text-on-surface">LV{skill.level}</span>
                </div>
              ))
            ) : (
              <div className="h-10 flex items-center">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   {isProcessing && <div className="h-full bg-kinetic-blue/20 animate-pulse w-2/3" />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ambient confidence glow at bottom */}
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden mt-2">
          <div 
            className={`h-full transition-all duration-1000 ${talisman.confidence < 0.9 ? "bg-kinetic-amber shadow-[0_0_8px_#ffc174]" : "bg-kinetic-blue/40"}`}
            style={{ width: `${talisman.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Digital Zoom Hover Overlay */}
      <div className={`absolute inset-0 border transition-colors pointer-events-none ${isProcessing ? 'border-kinetic-blue/10' : 'border-kinetic-amber/0 group-hover:border-kinetic-amber/20'}`} />
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { isAnalyzing, talismans, reset } = useVisionStore();
  const [selectedTalisman, setSelectedTalisman] = useState<Talisman | null>(null);

  if (isAnalyzing) {
    return <AnalysisMonitor />;
  }

  if (talismans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kinetic-amber/5 rounded-full mb-4">
             <div className="w-1.5 h-1.5 bg-kinetic-amber rounded-full animate-pulse" />
             <span className="font-label-tech text-kinetic-amber/60 uppercase tracking-widest">System Ready</span>
          </div>
          <h2 className="text-6xl font-space-tech font-black liquid-neon tracking-tight-eng uppercase">Engine Standby</h2>
          <p className="font-label-tech text-on-surface/20 max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-4">
            Awaiting vision feed input for high-precision tactical analysis and ROI calibration.
          </p>
        </div>
        <VideoUploader />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 max-w-[1600px] mx-auto">
      {/* SPEC Section 3.1: Bento Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Analysis Progress', value: '100', suffix: '%', icon: BarChart3, color: 'text-kinetic-blue' },
          { label: 'Detection Count', value: talismans.length, suffix: ' UNITS', icon: Target, color: 'text-kinetic-amber' },
          { label: 'Check Needed', value: talismans.filter(t => t.confidence < 0.9).length, suffix: ' VARIANTS', icon: ShieldAlert, color: 'text-kinetic-amber' },
          { label: 'Registry ID', value: 'SCAN_2026_V1', suffix: '', icon: FileText, color: 'text-white/40' },
        ].map((stat, i) => (
          <div key={i} className="kinetic-glass p-5 flex flex-col justify-between h-32 relative overflow-hidden border-none group">
            <div className="flex justify-between items-start">
              <span className="font-label-tech text-[10px] text-white/20 uppercase tracking-wide-tech">{stat.label}</span>
              <stat.icon size={16} className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`font-space-tech text-2xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="font-label-tech text-[10px] text-white/10 uppercase font-black">{stat.suffix}</span>
            </div>
            {/* Ambient pulse for check needed */}
            {stat.label === 'Check Needed' && Number(stat.value) > 0 && (
              <div className="absolute inset-0 bg-kinetic-amber/5 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Main Registry Section */}
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-space-tech font-black tracking-tight-eng text-on-surface uppercase italic flex items-center gap-4">
              Capture Registry
              <span className="text-[10px] font-label-tech text-white/10 not-italic block mt-4">V4.2.0-STABLE</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:min-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                type="text" 
                placeholder="PROBE REGISTRY..." 
                className="w-full bg-surface-lowest border-none rounded-tech py-4 pl-12 pr-4 text-[10px] font-space-tech tracking-wide-tech focus:ring-0 focus:bg-surface-high transition-all uppercase placeholder:text-white/5"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                 <div className="w-1 h-3 bg-white/5" />
                 <div className="w-1 h-3 bg-white/10" />
                 <div className="w-1 h-3 bg-kinetic-amber animate-pulse" />
              </div>
            </div>
            <button 
              onClick={reset}
              className="flex items-center justify-center w-12 h-12 bg-surface-lowest text-on-surface/20 hover:text-mhw-danger transition-colors rounded-tech"
              title="Purge Registry"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={reset}
              className="flex items-center gap-3 h-12 px-8 liquid-neon-btn rounded-tech font-space-tech text-[10px] font-black uppercase"
            >
               <RefreshCcw size={14} />
               <span>Initialize Session</span>
            </button>
          </div>
        </div>

        {/* Grid Layout - SPEC compliant columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {talismans.map((talisman) => (
            <TalismanCard 
              key={talisman.capture_id} 
              talisman={talisman} 
              onClick={() => setSelectedTalisman(talisman)}
            />
          ))}
        </div>
      </div>

      {/* Modal - Precision Override */}
      {selectedTalisman && (
        <TalismanDetailsModal 
          talisman={selectedTalisman} 
          onClose={() => setSelectedTalisman(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
