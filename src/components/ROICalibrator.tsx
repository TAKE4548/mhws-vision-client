import React, { useEffect, useState, useRef } from 'react'
import { Maximize2, Move, Box, Save, History, ChevronRight, ChevronLeft, Target, MousePointer2, Plus, Minus, Eye, EyeOff, Trash2, FilePlus, Settings2, AlertTriangle, Clock, Upload } from 'lucide-react'
import InteractiveCanvas from './roi/InteractiveCanvas'
import NumericalAdjuster from './common/NumericalAdjuster'
import { useROIStore, type CalibrationStep, type ActiveTarget, type Rect, type RelativeRect, type Point } from '../store/roiStore'
import { useVisionStore } from '../store/visionStore'
import { apiClient } from '../lib/api-client'
import type { ROIProfile } from '../api/generated/model';

const STEPS: { id: CalibrationStep; label: string; description: string }[] = [
  { id: 'setup', label: '0. Setup', description: 'プロファイルを新規作成するか、既存の設定をメンテナンスしてください。' },
  { id: 'source', label: '1. Source Frame', description: 'キャリブレーションの基準となる動画と時間を指定してください。' },
  { id: 'parent', label: '2. Window Area', description: '護石情報の表示範囲を枠で囲んでください。' },
  { id: 'items', label: '3. Item ROIs', description: 'レア度、スロット、スキルの各項目の枠を微調整します。' },
  { id: 'normalization', label: '4. Normalization', description: 'スロットの背景色と枠色の基準点をクリックしてください。' },
  { id: 'save', label: '5. Save Profile', description: '設定に名前を付けて保存します。' },
];


const ROICalibrator = () => {
  const { 
    step, activeTarget, activeId, profile,
    profiles, selectedProfileId, description, sourceFile, jobId, timestampMs, previewImage, isLoading, error,
    setStep, setActiveTarget, setPreviewImage, setDescription, setSourceFile,
    fetchProfiles, selectProfile, deleteProfile, prepareSource,
    updateParentWindow, updateRelativeRect, updatePoint, resetProfile,
    updateGaps, gaps
  } = useROIStore();

  const { videoMeta } = useVisionStore();

  const [profileName, setProfileName] = useState('New Profile');
  const [profileDescription, setProfileDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const captureFrameFE = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/webp');
        setPreviewImage(dataUrl);
        const currentRes = useROIStore.getState().profile.resolution!;
        if (canvas.width !== currentRes.width || canvas.height !== currentRes.height) {
          useROIStore.getState().setResolution(canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error('[ROICalibrator] Capture error:', err);
    }
  };

  useEffect(() => {
    if (selectedProfileId && profile) {
      setProfileName(profile.name || 'New Profile');
      setProfileDescription(profile.description || '');
    }
  }, [selectedProfileId, profile]);

  useEffect(() => {
    if (sourceFile && videoRef.current) {
      const url = URL.createObjectURL(sourceFile);
      videoRef.current.src = url;
      videoRef.current.currentTime = timestampMs / 1000;
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [sourceFile]);

  const [showOverlays, setShowOverlays] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (step === 'setup' || step === 'source') return;

    let currentUrl: string | null = null;
    let canceled = false;

    const fetchPreview = async () => {
      setPreviewImage(null); 
      try {
        let params: any = {};
        if (step === 'parent') {
          if (!profile.resolution) return;
          params = { x: 0, y: 0, w: profile.resolution.width, h: profile.resolution.height };
        } else if (step === 'items') {
          if (!profile.parent_window) return;
          params = { ...profile.parent_window };
        } else if (step === 'normalization') {
          const slot1 = profile.slots?.[0];
          if (!profile.parent_window || !slot1?.level) return;
          params = {
            x: profile.parent_window.x + slot1.level.x_rel,
            y: profile.parent_window.y + slot1.level.y_rel,
            w: slot1.level.w,
            h: slot1.level.h
          };
        } else {
          if (!profile.parent_window) return;
          params = { ...profile.parent_window };
        }

        const { jobId, selectedProfileId, timestampMs } = useROIStore.getState();
        const response = await apiClient.get('/vision/preview', { 
          params: {
            ...params,
            job_id: jobId || undefined,
            profile_id: selectedProfileId || undefined,
            timestamp_ms: timestampMs
          },
          responseType: 'blob' 
        });

        if (canceled) return;
        if (currentUrl) URL.revokeObjectURL(currentUrl);

        const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        currentUrl = url;
        setPreviewImage(url);

        if (step === 'parent') {
          const img = new Image();
          img.onload = () => {
            if (canceled || !profile.resolution) return;
            if (img.naturalWidth !== profile.resolution.width || img.naturalHeight !== profile.resolution.height) {
              console.log(`[ROICalibrator] Syncing resolution: ${img.naturalWidth}x${img.naturalHeight}`);
              useROIStore.getState().setResolution(img.naturalWidth, img.naturalHeight);
            }
          };
          img.src = url;
        }
      } catch (error) {
        if (!canceled) {
          console.error('Failed to fetch preview:', error);
        }
      }
    };

    const timer = setTimeout(fetchPreview, 250);
    
    return () => {
      canceled = true;
      clearTimeout(timer);
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [step, activeTarget, activeId, profile, setPreviewImage]);

  const handleNext = async () => {
    const currentIndex = STEPS.findIndex(s => s.id === step);
    if (currentIndex < STEPS.length - 1) {
      let nextStep = STEPS[currentIndex + 1].id;
      
      if (step === 'setup' && selectedProfileId) {
        nextStep = 'parent';
      }
      if (step === 'source') {
        if (!previewImage || !sourceFile) {
          alert('先にキャプチャ画像を確定してください。');
          return;
        }
        try {
          await prepareSource(sourceFile, timestampMs);
        } catch (err) {
          return;
        }
      }

      setStep(nextStep);
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
    const { jobId, timestampMs, selectedProfileId, profile } = useROIStore.getState();
    setIsSaving(true);
    try {
      const payload = {
        ...profile,
        name: profileName,
        description: profileDescription,
        job_id: jobId,
        timestamp_ms: timestampMs
      };
      
      if (selectedProfileId) {
        await apiClient.put(`/config/roi/profiles/${selectedProfileId}`, payload);
      } else {
        await apiClient.post('/config/roi/profiles', payload);
      }

      alert('Calibration profile saved successfully!');
      fetchProfiles(); 
      setStep('setup'); 
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentActiveData = () => {
    if (step === 'parent') return profile.parent_window;
    if (step === 'items') {
      if (activeTarget === 'rarity') return profile.rarity;
      if (activeTarget.includes('slot')) {
        const slot = profile.slots?.find((s: any) => s.id === activeId);
        return activeTarget === 'slot_icon' ? slot?.icon : slot?.level;
      }
      if (activeTarget.includes('skill')) {
        const skill = profile.skills?.find((s: any) => s.id === activeId);
        return activeTarget === 'skill_name' ? skill?.name : skill?.level;
      }
    }
    if (step === 'normalization') {
      return activeTarget === 'bg_point' ? profile.normalization?.bg_point : profile.normalization?.frame_point;
    }
    return null;
  };

  const activeData = getCurrentActiveData();

  const isResolutionMatched = (pRes: ROIProfile['resolution']) => {
    if (!videoMeta || !pRes) return true;
    return pRes.width === videoMeta.width && pRes.height === videoMeta.height;
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      <div className="col-span-8 flex flex-col gap-6">
        <div className="relative group">
          <div className="hidden">
            <video 
              ref={videoRef} 
              onLoadedMetadata={(e) => {
                setVideoDuration(e.currentTarget.duration);
                captureFrameFE();
              }}
              onSeeked={captureFrameFE}
              onCanPlay={captureFrameFE}
              muted 
              playsInline
            />
            <canvas ref={canvasRef} />
          </div>

          {step === 'setup' || step === 'source' ? (
            <div className="aspect-video bg-black/40 rounded border border-white/5 flex flex-col items-center justify-center gap-4 text-mhw-text/30">
              {step === 'setup' ? (
                <>
                  <Settings2 size={48} strokeWidth={1} />
                  <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest">Calibration Workflow</p>
                    <p className="text-[10px] mt-1">プロファイルを選択するか新規作成して開始してください</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  {previewImage ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-in fade-in duration-500">
                      <img src={previewImage} alt="Capture Preview" className="max-w-full max-h-full object-contain rounded border border-mhw-accent/20" />
                      <div className="absolute top-4 left-4 px-2 py-1 bg-mhw-accent text-mhw-bg text-[10px] font-bold uppercase rounded">Preview Ready</div>
                    </div>
                  ) : (
                    <>
                      <FilePlus size={48} strokeWidth={1} />
                      <div className="text-center mt-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-mhw-accent/50">Capture Preparation</p>
                        <p className="text-[10px] mt-1">動画と時間を指定して参照画像を生成してください</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <InteractiveCanvas showOverlays={showOverlays} />
          )}
          
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button 
              onClick={() => setShowOverlays(!showOverlays)}
              className={`p-2 rounded-full backdrop-blur-xl border border-mhw-accent/30 transition-all ${showOverlays ? 'bg-mhw-accent text-mhw-bg' : 'bg-black/60 text-mhw-accent hover:bg-black/80'}`}
              title={showOverlays ? 'Hide Overlays' : 'Show Overlays'}
            >
              {showOverlays ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            {showOverlays && (
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-mhw-accent/20 flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <Target size={12} className="text-mhw-accent animate-pulse" />
                <span className="text-[10px] font-bold text-mhw-text uppercase tracking-widest">Live Calibration Mode</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-mhw-panel border border-mhw-accent/20 rounded">
          <div className="flex gap-4 items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div 
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-100 ${step === s.id ? 'opacity-100' : 'opacity-30'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.id ? 'bg-mhw-accent text-mhw-bg shadow-[0_0_10px_rgba(202,192,128,0.4)]' : 'bg-white/10 group-hover:bg-white/20'}`}>
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

      <div className="col-span-4 space-y-6">
        <div className="mhw-panel border border-mhw-accent/20 p-6 space-y-6 flex flex-col h-full overflow-hidden">
          <div className="border-b border-mhw-accent/10 pb-4">
            <h2 className="text-lg font-bold text-mhw-accent uppercase tracking-widest leading-none mb-2">{STEPS.find(s => s.id === step)?.label}</h2>
            <p className="text-[11px] text-mhw-text/60 leading-relaxed font-hud">
              {STEPS.find(s => s.id === step)?.description}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {activeData && step !== 'save' && (
              <div className="p-4 bg-mhw-accent/5 border border-mhw-accent/10 rounded space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-mhw-accent uppercase tracking-widest">
                  <Maximize2 size={12} /> Fine Tuning: {activeTarget}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  { 'x' in activeData ? (
                    <>
                      <NumericalAdjuster label="X Offset" value={(activeData as Rect).x} onChange={v => updateParentWindow({ x: v })} max={profile.resolution?.width || 1920} />
                      <NumericalAdjuster label="Y Offset" value={(activeData as Rect).y} onChange={v => updateParentWindow({ y: v })} max={profile.resolution?.height || 1080} />
                      <NumericalAdjuster label="Width" value={(activeData as Rect).w} onChange={v => updateParentWindow({ w: v })} max={profile.resolution?.width || 1920} />
                      <NumericalAdjuster label="Height" value={(activeData as Rect).h} onChange={v => updateParentWindow({ h: v })} max={profile.resolution?.height || 1080} />
                    </>
                  ) : 'x_rel' in activeData && 'w' in activeData ? (
                    <>
                      <NumericalAdjuster label="X (Rel)" value={(activeData as RelativeRect).x_rel} onChange={v => updateRelativeRect(activeTarget, activeId, { x_rel: v })} max={profile.parent_window?.w || 1920} />
                      <NumericalAdjuster label="Y (Rel)" value={(activeData as RelativeRect).y_rel} onChange={v => updateRelativeRect(activeTarget, activeId, { y_rel: v })} max={profile.parent_window?.h || 1080} />
                      <NumericalAdjuster label="Width" value={(activeData as RelativeRect).w} onChange={v => updateRelativeRect(activeTarget, activeId, { w: v })} max={profile.parent_window?.w || 1920} />
                      <NumericalAdjuster label="Height" value={(activeData as RelativeRect).h} onChange={v => updateRelativeRect(activeTarget, activeId, { h: v })} max={profile.parent_window?.h || 1080} />
                    </>
                  ) : 'x_rel' in activeData ? (
                    <>
                      <NumericalAdjuster label="X (Rel)" value={(activeData as Point).x_rel} onChange={v => updatePoint(activeTarget as any, { x_rel: v })} max={profile.parent_window?.w || 1920} />
                      <NumericalAdjuster label="Y (Rel)" value={(activeData as Point).y_rel} onChange={v => updatePoint(activeTarget as any, { y_rel: v })} max={profile.parent_window?.h || 1080} />
                    </>
                  ) : null}
                </div>

                {activeTarget && ['slot_icon', 'slot_level', 'skill_name', 'skill_level'].includes(activeTarget) && (() => {
                  const targetMap: Record<string, keyof typeof gaps> = {
                    slot_icon: 'slotGapX',
                    slot_level: 'levelGapX',
                    skill_name: 'skillGapY',
                    skill_level: 'skillLevelGapX'
                  };
                  const gapKey = targetMap[activeTarget];
                  const gapValue = gaps[gapKey];

                  return (
                    <div className="p-4 bg-mhw-accent/5 border border-mhw-accent/20 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-mhw-accent uppercase tracking-widest">
                          <Settings2 size={12} /> Gap Adjustment
                        </div>
                        <span className="text-[10px] font-mono text-mhw-accent">{gapValue}px</span>
                      </div>
                      
                      <div className="space-y-4">
                        <input
                          type="range"
                          min="-50"
                          max="150"
                          value={gapValue}
                          onChange={(e) => updateGaps({ [gapKey]: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-mhw-accent"
                        />
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateGaps({ [gapKey]: gapValue - 1 })}
                            className="flex-1 py-1.5 bg-mhw-accent/10 hover:bg-mhw-accent/20 border border-mhw-accent/30 rounded text-[9px] font-bold text-mhw-accent uppercase transition-all"
                          >
                            -1px
                          </button>
                          <input
                            type="number"
                            value={gapValue}
                            onChange={(e) => updateGaps({ [gapKey]: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-mhw-bg/50 border border-mhw-accent/30 rounded px-2 py-1 text-center text-[10px] text-mhw-text font-mono focus:outline-none focus:border-mhw-accent"
                          />
                          <button
                            onClick={() => updateGaps({ [gapKey]: gapValue + 1 })}
                            className="flex-1 py-1.5 bg-mhw-accent/10 hover:bg-mhw-accent/20 border border-mhw-accent/30 rounded text-[9px] font-bold text-mhw-accent uppercase transition-all"
                          >
                            +1px
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {step === 'items' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Box size={14} className="text-white/20" />
                   <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">ROI Categories</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2 font-hud">
                  <button 
                    onClick={() => setActiveTarget('rarity')} 
                    className={`text-left px-4 py-3 rounded border transition-all ${
                      activeTarget === 'rarity' 
                        ? 'bg-mhw-accent border-mhw-accent text-mhw-bg shadow-[0_0_15px_rgba(202,192,128,0.3)]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest">Rarity Area</div>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'slot_icon' as ActiveTarget, label: 'Slot Icons' },
                      { id: 'slot_level' as ActiveTarget, label: 'Slot Levels' },
                      { id: 'skill_name' as ActiveTarget, label: 'Skill Names' },
                      { id: 'skill_level' as ActiveTarget, label: 'Skill Levels' },
                    ].map((t) => (
                      <button 
                        key={t.id}
                        onClick={() => setActiveTarget(t.id, 0)} 
                        className={`px-3 py-3 rounded border text-center transition-all ${
                          activeTarget === t.id 
                            ? 'bg-mhw-accent border-mhw-accent text-mhw-bg shadow-[0_0_10px_rgba(202,192,128,0.2)]' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-[9px] font-black uppercase tracking-wider leading-tight">{t.label}</div>
                      </button>
                    ))}
                  </div>
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

            {step === 'setup' && (
              <div className="space-y-6">
                <button 
                  onClick={() => {
                    resetProfile();
                    setStep('source');
                  }}
                  className="w-full p-4 bg-mhw-accent/10 border border-mhw-accent/30 rounded-lg flex items-center gap-4 group hover:bg-mhw-accent/20 transition-all text-left"
                >
                  <div className="p-3 bg-mhw-accent text-mhw-bg rounded-full shadow-[0_0_15px_rgba(202,192,128,0.3)]">
                    <Plus size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-mhw-accent">New Profile</div>
                    <div className="text-[10px] opacity-60">新しい護石・解像度用に設定をゼロから作成します</div>
                  </div>
                </button>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                      <History size={12} /> Existing Profiles
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded text-white/40">{profiles.length} total</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.isArray(profiles) && profiles.length === 0 && !isLoading && (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded">
                        <p className="text-[10px] opacity-30">保存済みのプロファイルはありません</p>
                      </div>
                    )}
                    
                    {Array.isArray(profiles) && profiles.map(p => (
                      <div 
                        key={p.profile_id}
                        className={`group relative p-3 rounded border transition-all cursor-pointer ${
                          selectedProfileId === p.profile_id 
                            ? 'bg-mhw-accent/10 border-mhw-accent/50' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => selectProfile(p.profile_id!)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-bold text-mhw-text truncate pr-8">{p.name}</div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if(confirm('このプロファイルを削除しますか？')) deleteProfile(p.profile_id!);
                            }}
                            className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        
                        {p.description && (
                          <div className="text-[10px] text-white/40 line-clamp-1 mb-2 italic">
                            "{p.description}"
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1 text-[9px] font-mono ${isResolutionMatched(p.resolution) ? 'text-mhw-accent/70' : 'text-orange-400'}`}>
                              <Maximize2 size={10} />
                              {p.resolution ? `${p.resolution.width}x${p.resolution.height}` : 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-white/20">
                              <Clock size={10} />
                              {(p as any).last_calibrated_at ? new Date((p as any).last_calibrated_at).toLocaleDateString() : '---'}
                            </div>
                          </div>
                          
                          {!isResolutionMatched(p.resolution) && (
                            <div className="flex items-center gap-1 text-[8px] text-orange-400 font-bold animate-pulse">
                              <AlertTriangle size={10} />
                              RES MISMATCH
                            </div>
                          )}
                        </div>

                        {selectedProfileId === p.profile_id && (
                          <div className="mt-3 pt-3 border-t border-mhw-accent/20 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                            <button 
                              onClick={() => setStep('parent')}
                              className="flex-1 py-1.5 bg-mhw-accent text-mhw-bg text-[9px] font-black uppercase rounded hover:brightness-110"
                            >
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => setStep('normalization')}
                              className="flex-1 py-1.5 border border-mhw-accent text-mhw-accent text-[9px] font-black uppercase rounded hover:bg-mhw-accent/10"
                            >
                              Adjust only
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'source' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                      <FilePlus size={12} /> Video Source
                    </label>
                    {!sourceFile ? (
                      <div className="p-4 border-2 border-dashed border-white/10 rounded-lg text-center hover:border-mhw-accent/30 transition-colors relative group/file">
                        <input 
                          type="file" 
                          accept=".mp4,.mov,.webm,.avi"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSourceFile(file);
                          }}
                        />
                        <Upload size={24} className="mx-auto mb-2 text-white/20 group-hover/file:text-mhw-accent/50 transition-colors" />
                        <p className="text-[10px] text-white/40">動画ファイルをドロップまたはクリック</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FilePlus size={16} className="text-mhw-accent shrink-0" />
                          <span className="text-xs truncate">{sourceFile.name}</span>
                        </div>
                        <button onClick={() => setSourceFile(null)} className="text-[10px] text-white/30 hover:text-red-400 uppercase font-black">Change</button>
                      </div>
                    )}
                  </div>

                  {sourceFile && (
                    <div className="space-y-4 p-4 bg-black/40 border border-white/5 rounded-lg animate-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                           <Clock size={12} /> Seek & Capture
                         </label>
                         <input 
                           type="range"
                           min={0}
                           max={videoDuration}
                           step={0.001}
                           value={timestampMs / 1000}
                           onChange={(e) => {
                             const time = parseFloat(e.target.value);
                             if (videoRef.current) {
                               videoRef.current.currentTime = time;
                               useROIStore.setState({ timestampMs: Math.round(time * 1000) });
                             }
                           }}
                           className="w-full accent-mhw-accent bg-white/10 rounded-lg h-1 outline-none cursor-pointer"
                         />
                       </div>
                    </div>
                  )}
                </div>

                {previewImage && (
                  <div className="p-4 bg-mhw-accent/5 border border-mhw-accent/20 rounded-lg animate-in fade-in duration-500">
                    <div className="text-[10px] text-mhw-accent font-bold uppercase mb-2 flex items-center gap-2">
                      <Eye size={12} /> Result Preview
                    </div>
                    <p className="text-[9px] text-white/40">この画像がキャリブレーションの背景として使用されます。</p>
                    {error && <p className="mt-2 text-red-400 text-[9px] text-center">{error}</p>}
                  </div>
                )}
              </div>
            )}

            {step === 'save' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                    <Target size={12} /> Profile Name
                  </span>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-mhw-bg border border-mhw-accent/30 rounded px-3 py-2 text-sm text-mhw-text focus:border-mhw-accent outline-none" placeholder="例: 4K Standard, RemotePlay..." />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                    <History size={12} /> Description
                  </span>
                  <textarea value={profileDescription} onChange={e => setProfileDescription(e.target.value)} className="w-full bg-mhw-bg border border-mhw-accent/30 rounded px-3 py-2 text-sm text-mhw-text focus:border-mhw-accent outline-none h-24 resize-none" placeholder="このプロファイルの特徴や環境について..." />
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10 space-y-2">
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Metadata Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-2">
                       <Maximize2 size={10} className="text-mhw-accent" />
                       <span className="font-mono">{profile.resolution?.width || 0}x{profile.resolution?.height || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={10} className="text-mhw-accent" />
                       <span className="font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
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
