import React from 'react';
import { Search, Filter, RefreshCcw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useVisionStore, Talisman } from '../store/visionStore';
import VideoUploader from './vision/VideoUploader';
import AnalysisMonitor from './vision/AnalysisMonitor';

const TalismanCard: React.FC<{ talisman: Talisman }> = ({ talisman }) => {
  // 護石データの capture_id を使用してクロップ画像を取得する想定
  const imageUrl = `http://localhost:8000/api/v1/assets/crops/${talisman.capture_id}.webp`;

  return (
    <div className="mhw-panel border border-mhw-accent/20 bg-gradient-to-br from-mhw-panel to-black group hover:border-mhw-accent/50 transition-all overflow-hidden relative">
      {/* Confidence Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <div 
          className={`h-full shadow-[0_0_8px_rgba(202,176,128,0.5)] ${
            talisman.confidence > 0.8 ? 'bg-mhw-success' : talisman.confidence > 0.5 ? 'bg-mhw-accent' : 'bg-mhw-danger'
          }`} 
          style={{ width: `${talisman.confidence * 100}%` }}
        />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-[10px] text-mhw-accent font-bold tracking-tighter opacity-70">{talisman.capture_id.slice(0, 8)}</span>
          {talisman.validation_status === 'valid' ? (
            <CheckCircle2 size={16} className="text-mhw-success" />
          ) : (
            <AlertCircle size={16} className={talisman.validation_status === 'error' ? 'text-mhw-danger' : 'text-mhw-accent animate-pulse'} />
          )}
        </div>

        <div className="aspect-video bg-black/40 border border-white/5 rounded flex items-center justify-center relative group-hover:bg-black/20 transition-all overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Talisman Crop" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=No+Image';
            }}
          />
          {/* Confidence Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 border border-mhw-accent/30 rounded text-[9px] font-bold text-mhw-accent">
            {(talisman.confidence * 100).toFixed(0)}% CONF
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-sm tracking-tight truncate">Rarity {talisman.rarity} Talisman</h3>
          <div className="flex flex-col gap-1 text-[11px] opacity-70">
            {talisman.skills.map((skill, idx) => (
              <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                <span className="truncate mr-2">{skill.name || 'Unknown Skill'}</span>
                <span className="text-mhw-accent shrink-0">Lv{skill.level}</span>
              </div>
            ))}
            {talisman.skills.length === 0 && <div className="text-mhw-danger opacity-50 italic">No skills detected</div>}
          </div>
        </div>

        <div className="flex gap-1 pt-2">
          {talisman.slots.map((s, i) => (
            <div key={i} className="flex-1 h-6 bg-mhw-accent/5 border border-mhw-accent/20 rounded flex items-center justify-center text-[10px] font-bold">
              {s > 0 ? s : '-'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { isAnalyzing, talismans, reset } = useVisionStore();

  if (isAnalyzing) {
    return <AnalysisMonitor />;
  }

  if (talismans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-mhw-accent tracking-[0.3em] uppercase">Ready for Analysis</h2>
          <p className="text-xs opacity-50 uppercase tracking-widest">Connect video feed or upload file to begin scanning</p>
        </div>
        <VideoUploader />
      </div>
    );
  }

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
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-mhw-danger/80 text-white font-bold text-xs rounded hover:brightness-110 transition-all shadow-[0_0_15px_rgba(170,51,51,0.3)] uppercase tracking-tighter"
          >
            <Trash2 size={14} /> Clear All
          </button>
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-mhw-accent text-mhw-bg font-bold text-xs rounded hover:brightness-110 transition-all shadow-[0_0_15px_rgba(201,160,99,0.3)] uppercase tracking-tighter"
          >
            <RefreshCcw size={14} /> New Scan
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {talismans.map((talisman) => (
          <TalismanCard key={talisman.capture_id} talisman={talisman} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
