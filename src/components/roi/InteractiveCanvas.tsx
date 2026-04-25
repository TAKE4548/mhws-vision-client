import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useROIStore, type Rect, type RelativeRect, type Point, type CalibrationStep, type ActiveTarget } from '../../store/roiStore';
import ResizeHandle from './ResizeHandle';
import sampleImg from '../../assets/sample-frame.webp';

interface InteractiveCanvasProps {
  backgroundImage?: string;
  showOverlays?: boolean;
}

type InteractionType = 'move' | 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize' | 'point' | null;

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ backgroundImage, showOverlays = true }) => {
  const { 
    step, activeTarget, activeId, profile, previewImage,
    updateParentWindow, updateRelativeRect, updatePoint,
    setActiveTarget
  } = useROIStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<{ 
    type: InteractionType; 
    startPos: { x: number; y: number }; 
    startValue: any 
  } | null>(null);

  const [imgSrc, setImgSrc] = useState<string | null>(previewImage);
  const [actualRatio, setActualRatio] = useState<string | null>(null);

  // 画像ソースの同期
  useEffect(() => {
    setImgSrc(previewImage);
  }, [previewImage]);

  const handleImageError = () => {
    console.warn(`[InteractiveCanvas] Preview loading failed for step: ${step}`);
    // 全画面キャプチャへのフォールバックは、Step 1 (Source) 以外では行わない
    // これにより、子ROI設定中に全画面が表示されるのを防ぐ
    if (step === 'source') {
      setImgSrc(sampleImg);
    } else {
      setImgSrc(null);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const ratioStr = `${naturalWidth} / ${naturalHeight}`;
    setActualRatio(ratioStr);
  };

  const calculatedRatio = useMemo(() => {
    if (step === 'parent' && profile.resolution) return `${profile.resolution.width} / ${profile.resolution.height}`;
    if ((step === 'items' || step === 'save') && profile.parent_window) return `${profile.parent_window.w} / ${profile.parent_window.h}`;
    if (step === 'normalization' && profile.slots && profile.slots.length > 0) {
      const slot = profile.slots[0];
      if (slot?.level) return `${slot.level.w} / ${slot.level.h}`;
    }
    return '16 / 9';
  }, [step, profile.resolution, profile.parent_window, profile.slots]);

  const currentRatio = actualRatio || calculatedRatio;

  const currentTarget = useMemo(() => {
    if (step === 'parent') return profile.parent_window;
    if (activeTarget === 'rarity') return profile.rarity;
    if (activeTarget === 'slot_icon' || activeTarget === 'slot_level') {
      const slot = profile.slots?.find(s => s.id === activeId);
      return slot ? (activeTarget === 'slot_icon' ? slot.icon : slot.level) : null;
    }
    if (activeTarget === 'skill_name' || activeTarget === 'skill_level') {
      const skill = profile.skills?.find(s => s.id === activeId);
      return skill ? (activeTarget === 'skill_name' ? skill.name : skill.level) : null;
    }
    if (activeTarget === 'bg_point' || activeTarget === 'frame_point') {
      return (profile.normalization as any)?.[activeTarget];
    }
    return null;
  }, [step, activeTarget, activeId, profile]);

  const getNormalizedCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    return { x, y };
  };

  const handleMouseDown = (type: InteractionType, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = getNormalizedCoords(e.clientX, e.clientY);
    
    if (step === 'normalization') {
      const slot1 = profile.slots?.[0];
      if (!slot1?.level) return;
      const x_rel = Math.round(slot1.level.x_rel + (pos.x * slot1.level.w));
      const y_rel = Math.round(slot1.level.y_rel + (pos.y * slot1.level.h));
      updatePoint(activeTarget as 'bg_point' | 'frame_point', { x_rel, y_rel });
      return;
    }

    setInteraction({
      type,
      startPos: pos,
      startValue: JSON.parse(JSON.stringify(currentTarget))
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !containerRef.current || !currentTarget) return;

    const currentPos = getNormalizedCoords(e.clientX, e.clientY);
    const dx = currentPos.x - interaction.startPos.x;
    const dy = currentPos.y - interaction.startPos.y;

    if (step === 'parent') {
      const startRect = interaction.startValue as Rect;
      if (!profile.resolution) return;
      const dx_px = dx * (profile.resolution.width || 0);
      const dy_px = dy * (profile.resolution.height || 0);
      
      const updates: Partial<Rect> = {};
      const type = interaction.type || '';
      const isN = type.startsWith('n');
      const isS = type.startsWith('s');
      const isW = type.includes('w-');
      const isE = type.includes('e-');

      if (isW) { updates.x = Math.round(startRect.x + dx_px); updates.w = Math.round(startRect.w - dx_px); }
      if (isE) { updates.w = Math.round(startRect.w + dx_px); }
      if (isN) { updates.y = Math.round(startRect.y + dy_px); updates.h = Math.round(startRect.h - dy_px); }
      if (isS) { updates.h = Math.round(startRect.h + dy_px); }
      
      if (type === 'move') {
        updates.x = Math.round(startRect.x + dx_px);
        updates.y = Math.round(startRect.y + dy_px);
      }
      updateParentWindow(updates);
    } else if (step === 'items') {
      const startRel = interaction.startValue as RelativeRect;
      if (!profile.parent_window) return;
      const dx_px = Math.round(dx * profile.parent_window.w);
      const dy_px = Math.round(dy * profile.parent_window.h);

      const updates: Partial<RelativeRect> = {};
      const type = interaction.type || '';
      const isN = type.startsWith('n');
      const isS = type.startsWith('s');
      const isW = type.includes('w-');
      const isE = type.includes('e-');

      if (isW) { updates.x_rel = startRel.x_rel + dx_px; updates.w = startRel.w - dx_px; }
      if (isE) { updates.w = startRel.w + dx_px; }
      if (isN) { updates.y_rel = startRel.y_rel + dy_px; updates.h = startRel.h - dy_px; }
      if (isS) { updates.h = startRel.h + dy_px; }

      if (type === 'move') {
        updates.x_rel = startRel.x_rel + dx_px;
        updates.y_rel = startRel.y_rel + dy_px;
      }
      updateRelativeRect(activeTarget, activeId, updates);
    }
  }, [interaction, step, activeTarget, activeId, profile, updateParentWindow, updateRelativeRect]);

  const handleMouseUp = useCallback(() => {
    setInteraction(null);
  }, []);

  useEffect(() => {
    if (interaction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, handleMouseMove, handleMouseUp]);

  const renderBoxes = useMemo(() => {
    if (step === 'parent' && profile.parent_window && profile.resolution) {
      const r = profile.parent_window;
      const res = profile.resolution;
      if (!res.width || !res.height) return [];
      return [{
        x: ((r.x || 0) / (res.width || 1)) * 100,
        y: ((r.y || 0) / (res.height || 1)) * 100,
        w: ((r.w || 0) / (res.width || 1)) * 100,
        h: ((r.h || 0) / (res.height || 1)) * 100,
        isActive: true,
        id: 'parent'
      }];
    }

    if (step === 'items') {
      const results: any[] = [];
      
      // Rarity
      if (activeTarget === 'rarity' && profile.rarity && profile.parent_window) {
        const r = profile.rarity;
        const pw = profile.parent_window;
        results.push({
          x: ((r.x_rel || 0) / (pw.w || 1)) * 100,
          y: ((r.y_rel || 0) / (pw.h || 1)) * 100,
          w: ((r.w || 0) / (pw.w || 1)) * 100,
          h: ((r.h || 0) / (pw.h || 1)) * 100,
          isActive: true,
          target: 'rarity',
          id: 0
        });
      }

      // Slots/Skills (Category-based grouping)
      const isSlot = activeTarget.includes('slot');
      const isSkill = activeTarget.includes('skill');
      
      if ((isSlot || isSkill) && profile.parent_window) {
        const list = isSlot ? profile.slots : profile.skills;
        const pw = profile.parent_window;
        list?.forEach((item: any, i: number) => {
          let r = null;
          if (activeTarget === 'slot_icon') r = item.icon;
          if (activeTarget === 'slot_level') r = item.level;
          if (activeTarget === 'skill_name') r = item.name;
          if (activeTarget === 'skill_level') r = item.level;

          if (r) {
            results.push({
              x: ((r.x_rel || 0) / (pw.w || 1)) * 100,
              y: ((r.y_rel || 0) / (pw.h || 1)) * 100,
              w: ((r.w || 0) / (pw.w || 1)) * 100,
              h: ((r.h || 0) / (pw.h || 1)) * 100,
              isActive: i === activeId,
              target: activeTarget,
              id: i
            });
          }
        });
      }
      return results;
    }

    if (step === 'normalization' && profile.normalization && profile.slots && profile.slots.length > 0) {
      const r = activeTarget === 'bg_point' ? profile.normalization.bg_point : profile.normalization.frame_point;
      const slot1 = profile.slots[0];
      if (r && slot1?.level) {
        return [{
          x: (((r.x_rel || 0) - (slot1.level.x_rel || 0)) / (slot1.level.w || 1)) * 100,
          y: (((r.y_rel || 0) - (slot1.level.y_rel || 0)) / (slot1.level.h || 1)) * 100,
          w: 0, h: 0,
          isPoint: true,
          isActive: true
        }];
      }
    }
    return [];
  }, [step, activeTarget, activeId, profile]);

  return (
    <div 
      ref={containerRef}
      className={`relative rounded border-2 border-mhw-accent/20 overflow-hidden shadow-2xl group select-none transition-all duration-500 ease-in-out ${step === 'normalization' ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{
        aspectRatio: currentRatio,
        backgroundColor: '#000',
        maxHeight: '70vh'
      }}
      onMouseDown={step === 'normalization' ? (e) => handleMouseDown('point', e) : undefined}
    >
      <div className="absolute inset-0">
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt="Preview" 
            className="w-full h-full object-fill pointer-events-none" 
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mhw-panel/50">
            <span className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Waiting for Preview Signal...</span>
          </div>
        )}
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow-amber"><feGaussianBlur stdDeviation="0.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {renderBoxes.map((box, idx) => (
          <React.Fragment key={box.id !== undefined && box.target ? `${box.target}-${box.id}` : `box-${idx}`}>
            {!box.isPoint ? (
              <>
                {box.isActive && (
                  <path
                    fill="rgba(0,0,0,0.6)"
                    fillRule="evenodd"
                    d={`M 0 0 H 100 V 100 H 0 Z M ${box.x} ${box.y} h ${box.w} v ${box.h} h ${-box.w} z`}
                  />
                )}
                <rect
                  x={box.x} y={box.y} width={box.w} height={box.h}
                  onClick={() => box.target && setActiveTarget(box.target as ActiveTarget, box.id)}
                  className={`cursor-move pointer-events-auto transition-all ${
                    box.isActive 
                      ? 'fill-mhw-accent/10 stroke-mhw-accent stroke-[0.4]' 
                      : 'fill-white/5 stroke-white/20 stroke-[0.2] hover:stroke-white/50'
                  }`}
                  style={box.isActive ? { filter: 'url(#glow-amber)' } : {}}
                  onMouseDown={(e) => {
                    if (!box.isActive) setActiveTarget(box.target as ActiveTarget, box.id);
                    handleMouseDown('move', e);
                  }}
                />
                {box.isActive && (
                  <g className="pointer-events-auto">
                    <ResizeHandle x={box.x} y={box.y} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('nw-resize', e)} />
                    <ResizeHandle x={box.x + box.w} y={box.y} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('ne-resize', e)} />
                    <ResizeHandle x={box.x} y={box.y + box.h} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('sw-resize', e)} />
                    <ResizeHandle x={box.x + box.w} y={box.y + box.h} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('se-resize', e)} />
                  </g>
                )}
              </>
            ) : (
              <g style={{ filter: 'url(#glow-amber)' }}>
                <circle cx={box.x} cy={box.y} r="2.5" className="fill-transparent stroke-mhw-accent/20 stroke-[0.1]" />
                <circle cx={box.x} cy={box.y} r="1.2" className="fill-transparent stroke-white/40 stroke-[0.1]" />
                <line x1={box.x - 2.5} y1={box.y} x2={box.x + 2.5} y2={box.y} className="stroke-mhw-accent/60 stroke-[0.05]" />
                <line x1={box.x} y1={box.y - 2.5} x2={box.x} y2={box.y + 2.5} className="stroke-mhw-accent/60 stroke-[0.05]" />
                <circle cx={box.x} cy={box.y} r="0.4" className="fill-mhw-accent" />
                <text x={box.x + 2} y={box.y - 2} className="fill-mhw-accent text-[1.5px] font-mono uppercase font-bold select-none">PICK</text>
              </g>
            )}
          </React.Fragment>
        ))}
      </svg>

      {showOverlays && (
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
          <span className="text-[8px] bg-mhw-accent text-mhw-bg px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            {step as string} PHASE
          </span>
          <span className="text-[10px] text-mhw-text font-bold uppercase tracking-tighter drop-shadow-md">
            TARGET: {activeTarget} {activeTarget.includes('slot') || activeTarget.includes('skill') ? `#${activeId + 1}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractiveCanvas;
