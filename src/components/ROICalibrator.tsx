import React, { useEffect, useState } from 'react'
import { Maximize2, Move, Box, Save, History, ChevronRight, ChevronLeft, Target, MousePointer2, Plus, Minus } from 'lucide-react'
import InteractiveCanvas from './roi/InteractiveCanvas'
import { useROIStore, CalibrationStep, ActiveTarget, Rect, RelativeRect, Point } from '../store/roiStore'
import { apiClient } from '../lib/api-client'

const STEPS: { id: CalibrationStep; label: string; description: string }[] = [
  { id: 'parent', label: '1. Window Area', description: '護石情報の表示範囲を枠で囲んでください。' },
  { id: 'items', label: '2. Item ROIs', description: 'レア度、スロット、スキルの各項目の枠を微調整します。' },
  { id: 'normalization', label: '3. Normalization', description: 'スロットの背景色と枠色の基準点をクリックしてください。' },
  { id: 'save', label: '4. Save Profile', description: '設定に名前を付けて保存します。' },
];

interface NumericalAdjusterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const NumericalAdjuster: React.FC<NumericalAdjusterProps> = ({ label, value, onChange, min = 0, max = 2000 }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[9px] uppercase font-bold opacity-50 tracking-tighter">{label}</span>
      <span className="text-[10px] font-mono text-mhw-accent">{value}px</span>
    </div>
    <div className="flex bg-white/5 border border-white/10 rounded overflow-hidden">
      <button 
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2 hover:bg-white/10 text-mhw-accent transition-colors border-r border-white/10"
      >
        <Minus size={12} />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(parseInt(e.target.value) || 0)} 
        className="w-full bg-transparent px-2 py-1 text-xs text-mhw-text font-mono text-center outline-none" 
      />
      <button 
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-2 hover:bg-white/10 text-mhw-accent transition-colors border-l border-white/10"
      >
        <Plus size={12} />
      </button>
    </div>
  </div>
);

const ROICalibrator = () => {
  const { 
    step, activeTarget, activeId, profile,
    setStep, setActiveTarget, setPreviewImage,
    updateParentWindow, updateRelativeRect, updatePoint, resetProfile 
  } = useROIStore();

  const [profileName, setProfileName] = useState('New Profile');
  const [isSaving, setIsSaving] = useState(false);

  // プレビュー画像の自動更新
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        let params: any = {};
        if (step === 'parent') {
          params = { ...profile.parent_window };
        } else {
          const current = (step === 'items') ? (
            activeTarget === 'rarity' ? profile.rarity :
            activeTarget.includes('slot') ? (profile.slots.find(s => s.id === activeId)?.[activeTarget === 'slot_icon' ? 'icon' : 'level']) :
            (profile.skills.find(s => s.id === activeId)?.[activeTarget === 'skill_name' ? 'name' : 'level'])
          ) : null;

          if (current) {
            params = {
              x: profile.parent_window.x + current.x_rel,
              y: profile.parent_window.y + current.y_rel,
              w: current.w,
              h: current.h
            };
          } else {
            params = { ...profile.parent_window };
          }
        }

        const response = await apiClient.get('/vision/preview', { params });
        setPreviewImage(response.data.image || response.data);
      } catch (error) {
        console.error('Failed to fetch preview:', error);
      }
    };

    const timer = setTimeout(fetchPreview, 250); // デバウンスを少し長く
    return () => clearTimeout(timer);
  }, [step, activeTarget, activeId, profile, setPreviewImage]);

  const handleNext = () => {
    const currentIndex = STEPS.findIndex(s => s.id === step);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1].id;
      setStep(nextStep);
      // Normalizationステップに入ったら、デフォルトで背景ポイントを選択
      if (nextStep === 'normalization') {
        setActiveTarget('bg_point');
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex(s => s.id === step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post('/config/roi/profiles', {
        ...profile,
        name: profileName
      });
      alert('Calibration profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // 現在のターゲットデータを取得
  const getCurrentActiveData = () => {
    if (step === 'parent') return profile.parent_window;
    if (step === 'items') {
      if (activeTarget === 'rarity') return profile.rarity;
      if (activeTarget.includes('slot')) {
        const slot = profile.slots.find(s => s.id === activeId);
        return activeTarget === 'slot_icon' ? slot?.icon : slot?.level;
      }
      if (activeTarget.includes('skill')) {
        const skill = profile.skills.find(s => s.id === activeId);
        return activeTarget === 'skill_name' ? skill?.name : skill?.level;
      }
    }
    if (step === 'normalization') {
      return activeTarget === 'bg_point' ? profile.normalization.bg_point : profile.normalization.frame_point;
    }
    return null;
  };

  const activeData = getCurrentActiveData();

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Simulation Area */}
      <div className="col-span-8 flex flex-col gap-6">
        <div className="relative group">
          <InteractiveCanvas />
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-mhw-accent/20 flex items-center gap-2">
              <Target size={12} className="text-mhw-accent animate-pulse" />
              <span className="text-[10px] font-bold text-mhw-text uppercase tracking-widest">Live Calibration Mode</span>
            </div>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between p-4 bg-mhw-panel border border-mhw-accent/20 rounded">
          <div className="flex gap-4 items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 ${step === s.id ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.id ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/10'}`}>
                    {idx + 1}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && <div className="w-4 h-[1px] bg-white/10" />}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button onClick={handleBack} disabled={step === 'parent'} className="p-2 border border-mhw-accent/20 rounded hover:bg-white/5 disabled:opacity-10 transition-colors">
              <ChevronLeft size={20} className="text-mhw-accent" />
            </button>
            <button onClick={handleNext} disabled={step === 'save'} className="p-2 bg-mhw-accent rounded hover:brightness-110 disabled:opacity-20 transition-all">
              <ChevronRight size={20} className="text-mhw-bg" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="col-span-4 space-y-6">
        <div className="mhw-panel border border-mhw-accent/20 p-6 space-y-6 flex flex-col h-full overflow-hidden">
          <div className="border-b border-mhw-accent/10 pb-4">
            <h2 className="text-lg font-bold text-mhw-accent uppercase tracking-widest leading-none mb-2">{STEPS.find(s => s.id === step)?.label}</h2>
            <p className="text-[11px] text-mhw-text/60 leading-relaxed font-hud">
              {STEPS.find(s => s.id === step)?.description}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {/* Fine Tuning Controls (Numerical) */}
            {activeData && step !== 'save' && (
              <div className="p-4 bg-mhw-accent/5 border border-mhw-accent/10 rounded space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-mhw-accent uppercase tracking-widest">
                  <Maximize2 size={12} /> Fine Tuning: {activeTarget}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {'x' in activeData ? (
                    <>
                      <NumericalAdjuster label="X Offset" value={activeData.x} onChange={v => updateParentWindow({ x: v })} max={1920} />
                      <NumericalAdjuster label="Y Offset" value={activeData.y} onChange={v => updateParentWindow({ y: v })} max={1080} />
                      <NumericalAdjuster label="Width" value={activeData.w} onChange={v => updateParentWindow({ w: v })} max={1920} />
                      <NumericalAdjuster label="Height" value={activeData.h} onChange={v => updateParentWindow({ h: v })} max={1080} />
                    </>
                  ) : 'x_rel' in activeData && 'w' in activeData ? (
                    <>
                      <NumericalAdjuster label="X (Rel)" value={(activeData as RelativeRect).x_rel} onChange={v => updateRelativeRect(activeTarget, activeId, { x_rel: v })} max={profile.parent_window.w} />
                      <NumericalAdjuster label="Y (Rel)" value={(activeData as RelativeRect).y_rel} onChange={v => updateRelativeRect(activeTarget, activeId, { y_rel: v })} max={profile.parent_window.h} />
                      <NumericalAdjuster label="Width" value={(activeData as RelativeRect).w} onChange={v => updateRelativeRect(activeTarget, activeId, { w: v })} max={profile.parent_window.w} />
                      <NumericalAdjuster label="Height" value={(activeData as RelativeRect).h} onChange={v => updateRelativeRect(activeTarget, activeId, { h: v })} max={profile.parent_window.h} />
                    </>
                  ) : 'x_rel' in activeData ? (
                    <>
                      <NumericalAdjuster label="X (Rel)" value={(activeData as Point).x_rel} onChange={v => updatePoint(activeTarget as any, { x_rel: v })} max={profile.parent_window.w} />
                      <NumericalAdjuster label="Y (Rel)" value={(activeData as Point).y_rel} onChange={v => updatePoint(activeTarget as any, { y_rel: v })} max={profile.parent_window.h} />
                    </>
                  ) : null}
                </div>
              </div>
            )}

            {step === 'items' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Target</span>
                <div className="grid grid-cols-1 gap-1.5 font-hud">
                  <button onClick={() => setActiveTarget('rarity')} className={`text-left px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTarget === 'rarity' ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5 hover:bg-white/10'}`}>
                    Rarity
                  </button>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex gap-1.5">
                      <button onClick={() => setActiveTarget('slot_icon', i)} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTarget === 'slot_icon' && activeId === i ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5 hover:bg-white/10'}`}>
                        Slot {i+1} Icon
                      </button>
                      <button onClick={() => setActiveTarget('slot_level', i)} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTarget === 'slot_level' && activeId === i ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5 hover:bg-white/10'}`}>
                        Slot {i+1} Lvl
                      </button>
                    </div>
                  ))}
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex gap-1.5">
                      <button onClick={() => setActiveTarget('skill_name', i)} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTarget === 'skill_name' && activeId === i ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5 hover:bg-white/10'}`}>
                        Skill {i+1} Name
                      </button>
                      <button onClick={() => setActiveTarget('skill_level', i)} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${activeTarget === 'skill_level' && activeId === i ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5 hover:bg-white/10'}`}>
                        Skill {i+1} Lvl
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'normalization' && (
                <div className="grid grid-cols-1 gap-2">
                   <button onClick={() => setActiveTarget('bg_point')} className={`w-full px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTarget === 'bg_point' ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5'}`}>
                      Background Point
                    </button>
                    <button onClick={() => setActiveTarget('frame_point')} className={`w-full px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTarget === 'frame_point' ? 'bg-mhw-accent text-mhw-bg' : 'bg-white/5'}`}>
                      Frame Point
                    </button>
                </div>
            )}

            {step === 'save' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold opacity-50">Profile Name</span>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-mhw-bg border border-mhw-accent/30 rounded px-3 py-2 text-sm text-mhw-text focus:border-mhw-accent outline-none" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-3">
            {step === 'save' ? (
              <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-mhw-accent text-mhw-bg font-black rounded flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50">
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save & Exit'}
              </button>
            ) : (
              <button onClick={handleNext} className="w-full py-4 bg-mhw-accent text-mhw-bg font-black rounded flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(202,192,128,0.2)]">
                Next Step <ChevronRight size={18} />
              </button>
            )}
            <button onClick={resetProfile} className="w-full py-3 border border-white/10 text-mhw-text/40 font-bold rounded flex items-center justify-center gap-3 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]">
              <History size={14} /> Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ROICalibrator

