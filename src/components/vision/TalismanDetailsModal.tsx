import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Edit3, Target, Crosshair, Activity } from 'lucide-react';
import { type Talisman, useVisionStore } from '../../store/visionStore';
import { API_HOST } from '../../lib/api-client';
import { VisionImage } from '../common/VisionImage';
import type { SkillInfo } from '../../api/generated/model';
import { WaveformGraph } from './WaveformGraph';

interface Props {
  talisman: Talisman;
  onClose: () => void;
}

const TalismanDetailsModal: React.FC<Props> = ({ talisman, onClose }) => {
  const { updateTalisman } = useVisionStore();
  const [edited, setEdited] = useState<Talisman>(talisman);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setEdited(talisman);
  }, [talisman]);

  const handleSave = () => {
    updateTalisman(talisman.capture_id, edited);
    onClose();
  };

  const updateSkill = (index: number, field: 'name' | 'level', value: string | number) => {
    const newSkills = [...edited.skills];
    newSkills[index] = { ...newSkills[index], [field]: value } as SkillInfo;
    setEdited({ ...edited, skills: newSkills });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-lowest/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="kinetic-glass max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative border-none">
        {/* Header - Technical Precision */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-kinetic-amber shadow-[0_0_10px_#ffc174]" />
              <h2 className="font-space-tech text-xl font-black text-on-surface uppercase tracking-tight-eng">Manual Override // Tactical Calibration</h2>
            </div>
            <p className="font-label-tech text-white/10 uppercase tracking-widest">Vision Core Segment: 0x{talisman.capture_id.slice(0, 8)}</p>
          </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowDebug(!showDebug)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-tech font-label-tech text-[10px] uppercase tracking-widest transition-all ${
                  showDebug ? 'bg-kinetic-amber/20 text-kinetic-amber shadow-[0_0_15px_rgba(255,193,116,0.2)]' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                <Activity size={14} className={showDebug ? 'animate-pulse' : ''} />
                <span>Debug {showDebug ? 'ON' : 'OFF'}</span>
              </button>
              <button onClick={onClose} className="p-3 text-white/20 hover:text-mhw-danger transition-colors bg-white/5 rounded-tech">
                <X size={20} />
              </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 flex flex-col lg:flex-row gap-16">
          {/* Left Side: Visual Data & ROI Feed (SPEC 4.3) */}
          <div className="flex-1 space-y-10">
            {/* Visual Detection (Current Crop) */}
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                  <span className="font-label-tech text-kinetic-amber/60 text-[10px] uppercase tracking-widest">A. Observational Data Extraction</span>
                  <div className="font-space-tech text-[8px] text-white/10">SCALE: 1.0x_RAW</div>
               </div>
               <div className="aspect-[4/3] bg-surface-lowest rounded-tech overflow-hidden flex items-center justify-center relative group border border-white/5">
                <VisionImage 
                  src={talisman.image_url} 
                  placeholderType="modal"
                  className="w-full h-full"
                />
                <div className="absolute inset-x-8 top-1/2 h-[1px] bg-kinetic-amber/20" />
                <div className="absolute inset-y-8 left-1/2 w-[1px] bg-kinetic-amber/20" />
                <div className="absolute top-4 left-4 font-space-tech text-[8px] text-white/20 p-2 bg-black/40 backdrop-blur-md italic">
                   ROI_EXTRACT_STABLE
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <span className="font-label-tech text-kinetic-blue/60 text-[10px] uppercase tracking-widest">B. Tactical ROI Live Feed</span>
               <div className="aspect-video bg-surface-lowest rounded-tech relative overflow-hidden flex items-center justify-center group border border-white/5">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                  <Target size={32} className="text-white/5 group-hover:text-kinetic-blue/20 transition-colors" />
                  <div className="absolute inset-x-0 h-[2px] bg-kinetic-blue/40 shadow-[0_0_15px_#adc6ff] animate-[scan_3s_linear_infinite]" />
                  <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                     <span className="font-space-tech text-[10px] font-black text-kinetic-blue">MONITORING_ACTIVE</span>
                     <span className="font-label-tech text-[7px] text-white/20">BUFFER: 240FPS // LATENCY: 12ms</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Side: Calibration Interface (SPEC 4.1/4.2) */}
          <div className="flex-1 space-y-12">
            {/* 1. Rarity (SPEC 4.1) */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield size={14} className="text-kinetic-amber" />
                <span className="font-label-tech text-on-surface/80 uppercase tracking-widest">1. Rarity Calibration</span>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="font-label-tech text-white/10 text-[9px] uppercase">Extraction Confidence</label>
                  <div className="font-space-tech text-2xl font-black text-kinetic-amber">{((edited.rarity?.confidence || 0) * 100).toFixed(2)}<span className="text-xs opacity-40 ml-1">%</span></div>
                  <div className="h-0.5 bg-white/5 w-full">
                    <div className="h-full bg-kinetic-amber" style={{ width: `${(edited.rarity?.confidence || 0) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-tech text-white/10 text-[9px] uppercase">Manual Tier Override</label>
                  <select 
                    value={edited.rarity?.value}
                    onChange={(e) => setEdited({ 
                      ...edited, 
                      rarity: { ...edited.rarity, value: parseInt(e.target.value), confidence: edited.rarity?.confidence || 1 } 
                    })}
                    className="w-full bg-surface-lowest border-none rounded-tech px-4 py-4 text-sm font-space-tech font-black text-on-surface appearance-none focus:ring-0"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>01: RARITY {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Slot Recognition Profile (SPEC 4.2) */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                <Activity size={14} className="text-kinetic-blue" />
                <span className="font-label-tech text-on-surface/80 uppercase tracking-widest">2. Slot Recognition Profile</span>
              </div>

              <div className="flex gap-4">
                {(edited.slots?.value || []).map((slot, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                       const nextVal = (slot + 1) % 5;
                       const newSlotValues = [...(edited.slots?.value || [])];
                       newSlotValues[idx] = nextVal;
                       setEdited({ 
                         ...edited, 
                         slots: { ...edited.slots, value: newSlotValues, confidence: edited.slots?.confidence || 1 } 
                       });
                    }}
                    className="flex-1 bg-surface-lowest p-4 rounded-tech flex flex-col gap-4 group/slot hover:bg-surface-high transition-all border border-white/0 hover:border-white/5"
                  >
                    <div className="flex justify-between items-start">
                       <span className="font-label-tech text-[8px] text-white/20">SLOT_{idx + 1}</span>
                       <span className={`font-space-tech text-xs font-black ${slot > 0 ? "text-kinetic-blue" : "text-white/5"}`}>{slot > 0 ? `LV${slot}` : 'NULL'}</span>
                    </div>
                    
                    {showDebug && (
                      <div className="h-10 w-full animate-in slide-in-from-top duration-300">
                        {edited.slots_debug_data?.[idx] ? (
                          <WaveformGraph 
                            waveform={edited.slots_debug_data[idx].waveform}
                            threshold={edited.slots_debug_data[idx].threshold}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full opacity-20 bg-white/5 rounded flex items-center justify-center border border-white/5 border-dashed">
                            <Activity size={12} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="flex flex-col">
                          <span className="font-label-tech text-[7px] text-white/20">S (Std)</span>
                          <span className="font-space-tech text-[9px] font-black text-white/40">0.{Math.floor(Math.random() * 90) + 10}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="font-label-tech text-[7px] text-white/20">B (BG)</span>
                          <span className="font-space-tech text-[9px] font-black text-white/40">{((edited.slots?.confidence || 0) * 10).toFixed(2)}</span>
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Skill Identification OCR (SPEC 4.3) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 size={14} className="text-kinetic-amber" />
                  <span className="font-label-tech text-on-surface/80 uppercase tracking-widest">3. Skill Identification OCR</span>
                </div>
                <div className="px-2 py-0.5 bg-kinetic-amber/5 rounded-full text-[7px] font-space-tech text-kinetic-amber border border-kinetic-amber/20">MODITATIVE_STABLE</div>
              </div>

              <div className="space-y-4">
                {(edited.skills || []).map((skill, idx) => (
                  <div key={idx} className="flex gap-4 items-end group/field bg-white/5 p-4 rounded-tech relative">
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-label-tech text-[8px] text-white/10 group-focus-within/field:text-kinetic-amber transition-colors">Skill Identifier {idx + 1}</label>
                          {showDebug && skill.crop_b64 && (
                            <div className="h-6 px-1 bg-black/40 rounded border border-white/10 flex items-center animate-in zoom-in duration-300">
                              <img src={`data:image/png;base64,${skill.crop_b64}`} alt="skill name crop" className="h-full object-contain filter brightness-125" />
                            </div>
                          )}
                        </div>
                        <input 
                         type="text"
                         value={skill.name}
                         onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                         className="w-full bg-transparent border-none p-0 text-sm font-manrope text-white focus:ring-0 placeholder:text-white/5"
                         placeholder="INPUT_SKILL_ID..."
                       />
                     </div>
                    <div className="w-20 space-y-2">
                       <label className="font-label-tech text-[8px] text-white/10 text-center block">Level</label>
                       <input 
                        type="number"
                        min="0"
                        max="7"
                        value={skill.level}
                        onChange={(e) => updateSkill(idx, 'level', parseInt(e.target.value))}
                        className="w-full bg-surface-lowest border-none rounded-tech py-2 text-center text-sm font-space-tech font-black text-kinetic-amber focus:ring-1 focus:ring-white/10 transition-all"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5 group-focus-within/field:bg-kinetic-amber transition-all shadow-[0_0_10px_#ffc174]" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer - Final Commitment */}
        <div className="p-10 bg-surface-bright/5 flex justify-between items-center mt-auto border-t border-white/5">
          <button 
            onClick={onClose}
            className="font-label-tech text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest"
          >
            Cancel Calibration
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-4 px-12 py-5 liquid-neon-btn rounded-tech font-space-tech text-xs uppercase"
          >
            <X size={18} />
            <span>Commit Tactical Override</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalismanDetailsModal;
