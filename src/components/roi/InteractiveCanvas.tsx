import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useROIStore, Rect, RelativeRect, Point, CalibrationStep, ActiveTarget } from '../../store/roiStore';
import ResizeHandle from './ResizeHandle';

interface InteractiveCanvasProps {
  backgroundImage?: string;
}

type InteractionType = 'move' | 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize' | 'point' | null;

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ backgroundImage }) => {
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

  // 現在のターゲット矩形/ポイントを取得
  const currentTarget = useMemo(() => {
    if (step === 'parent') return profile.parent_window;
    if (activeTarget === 'rarity') return profile.rarity;
    if (activeTarget === 'slot_icon' || activeTarget === 'slot_level') {
      const slot = profile.slots.find(s => s.id === activeId);
      return slot ? (activeTarget === 'slot_icon' ? slot.icon : slot.level) : null;
    }
    if (activeTarget === 'skill_name' || activeTarget === 'skill_level') {
      const skill = profile.skills.find(s => s.id === activeId);
      return skill ? (activeTarget === 'skill_name' ? skill.name : skill.level) : null;
    }
    if (activeTarget === 'bg_point' || activeTarget === 'frame_point') {
      return profile.normalization[activeTarget];
    }
    return null;
  }, [step, activeTarget, activeId, profile]);

  // 1920x1080 を基準とした正規化座標を取得
  const getNormalizedCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    // 子要素編集時は親ROI内での相対座標として扱う
    if (step !== 'parent') {
      // 親ROIの範囲内での 0~1 に変換
      // ここでは Canvas 全体が親ROIを表示している想定（ズーム時）
    }
    
    return { x, y };
  };

  const handleMouseDown = (type: InteractionType, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = getNormalizedCoords(e.clientX, e.clientY);
    
    if (step === 'normalization') {
      // スポイトモード: クリックした瞬間に座標を確定
      const x_rel = Math.round(pos.x * profile.parent_window.w);
      const y_rel = Math.round(pos.y * profile.parent_window.h);
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
      // 1920x1080 基準のピクセル移動
      const dx_px = dx * 1920;
      const dy_px = dy * 1080;
      
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

  // レンダリング用の座標変換 (0~100%)
  const renderBox = useMemo(() => {
    if (!currentTarget) return null;
    
    if (step === 'parent') {
      const r = currentTarget as Rect;
      return { x: (r.x / 1920) * 100, y: (r.y / 1080) * 100, w: (r.w / 1920) * 100, h: (r.h / 1080) * 100 };
    } else {
      // ポイントか矩形かを w の有無で判定
      const r = currentTarget as any;
      if (r.w !== undefined) {
        return { 
          x: (r.x_rel / profile.parent_window.w) * 100, 
          y: (r.y_rel / profile.parent_window.h) * 100, 
          w: (r.w / profile.parent_window.w) * 100, 
          h: (r.h / profile.parent_window.h) * 100 
        };
      } else {
        // Point (スポイト用)
        return { 
          x: (r.x_rel / profile.parent_window.w) * 100, 
          y: (r.y_rel / profile.parent_window.h) * 100, 
          w: 0, h: 0, 
          isPoint: true 
        };
      }
    }
  }, [currentTarget, step, profile.parent_window]);

  return (
    <div 
      ref={containerRef}
      className={`aspect-video bg-black relative rounded border-2 border-mhw-accent/20 overflow-hidden shadow-2xl group select-none ${step === 'normalization' ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={step === 'normalization' ? (e) => handleMouseDown('point', e) : undefined}
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        {previewImage ? (
          <img src={previewImage} alt="Preview" className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mhw-panel/50">
            <span className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Waiting for Preview Signal...</span>
          </div>
        )}
      </div>

      {/* SVG Overlay */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow-amber"><feGaussianBlur stdDeviation="0.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {renderBox && !renderBox.isPoint && (
          <>
            {/* Mask */}
            <path
              fill="rgba(0,0,0,0.6)"
              fillRule="evenodd"
              d={`M 0 0 H 100 V 100 H 0 Z M ${renderBox.x} ${renderBox.y} h ${renderBox.w} v ${renderBox.h} h ${-renderBox.w} z`}
            />
            {/* Active ROI */}
            <rect
              x={renderBox.x} y={renderBox.y} width={renderBox.w} height={renderBox.h}
              className="fill-mhw-accent/5 stroke-mhw-accent stroke-[0.3] cursor-move pointer-events-auto"
              style={{ filter: 'url(#glow-amber)' }}
              onMouseDown={(e) => handleMouseDown('move', e)}
            />
            {/* Handles */}
            <g className="pointer-events-auto">
              <ResizeHandle x={renderBox.x} y={renderBox.y} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('nw-resize', e)} />
              <ResizeHandle x={renderBox.x + renderBox.w} y={renderBox.y} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('ne-resize', e)} />
              <ResizeHandle x={renderBox.x} y={renderBox.y + renderBox.h} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('sw-resize', e)} />
              <ResizeHandle x={renderBox.x + renderBox.w} y={renderBox.y + renderBox.h} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('se-resize', e)} />
            </g>
          </>
        )}

        {renderBox && renderBox.isPoint && (
          <g style={{ filter: 'url(#glow-amber)' }}>
            {/* Reticle Focus Ring */}
            <circle cx={renderBox.x} cy={renderBox.y} r="2.5" className="fill-transparent stroke-mhw-accent/20 stroke-[0.1]" />
            <circle cx={renderBox.x} cy={renderBox.y} r="1.2" className="fill-transparent stroke-white/40 stroke-[0.1]" />
            
            {/* Crosshair Lines */}
            <line x1={renderBox.x - 2.5} y1={renderBox.y} x2={renderBox.x + 2.5} y2={renderBox.y} className="stroke-mhw-accent/60 stroke-[0.05]" />
            <line x1={renderBox.x} y1={renderBox.y - 2.5} x2={renderBox.x} y2={renderBox.y + 2.5} className="stroke-mhw-accent/60 stroke-[0.05]" />
            
            {/* Center Core */}
            <circle cx={renderBox.x} cy={renderBox.y} r="0.4" className="fill-mhw-accent" />
            
            {/* UI Decals (Points info) */}
            <text x={renderBox.x + 2} y={renderBox.y - 2} className="fill-mhw-accent text-[1.5px] font-mono uppercase font-bold select-none">PICK</text>
          </g>
        )}
      </svg>

      {/* Step Indicator / Label */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-[8px] bg-mhw-accent text-mhw-bg px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
          {step} PHASE
        </span>
        <span className="text-[10px] text-mhw-text font-bold uppercase tracking-tighter drop-shadow-md">
          TARGET: {activeTarget} {activeTarget.includes('slot') || activeTarget.includes('skill') ? `#${activeId + 1}` : ''}
        </span>
      </div>
    </div>
  );
};

export default InteractiveCanvas;

