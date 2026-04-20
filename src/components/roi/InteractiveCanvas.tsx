import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useROIStore, Rect, RelativeRect, Point, CalibrationStep, ActiveTarget } from '../../store/roiStore';
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

  // Fallback support (REQ-019)
  const [imgSrc, setImgSrc] = useState<string | null>(previewImage);
  const [actualRatio, setActualRatio] = useState<string | null>(null);

  useEffect(() => {
    setImgSrc(previewImage);
    // 画像リセット時、または Step 1 (parent) に戻った際に比率もリセットして全画面に即時復帰させる (REQ-019 Follow-up)
    if (!previewImage || step === 'parent') {
      setActualRatio(null);
    }
  }, [previewImage, step]);

  const handleImageError = () => {
    console.warn('[InteractiveCanvas] Preview loading failed, falling back to sample image.');
    setImgSrc(sampleImg);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const ratioStr = `${naturalWidth} / ${naturalHeight}`;
    setActualRatio(ratioStr);
    console.log(`[InteractiveCanvas] Image loaded, aspect-ratio: ${ratioStr}`);
  };

  // 現在のコンテキストに応じたアスペクト比を計算 (REQ-019 Follow-up)
  const calculatedRatio = useMemo(() => {
    if (step === 'parent') return `${profile.resolution.width} / ${profile.resolution.height}`;
    if (step === 'items' || step === 'save') return `${profile.parent_window.w} / ${profile.parent_window.h}`;
    if (step === 'normalization') {
      const slot = profile.slots[0];
      return `${slot.level.w} / ${slot.level.h}`;
    }
    return '16 / 9';
  }, [step, profile.resolution, profile.parent_window, profile.slots]);

  // 実画像比率を優先しつつ、未ロード時は計算比率を使用
  const currentRatio = actualRatio || calculatedRatio;

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
      // スポイトモード: クリックした瞬間に座標を確定 (REQ-019 Follow-up)
      // ステップ3では背景が Slot 1 Level なので、pos.x (0~1) は Slot 1 Level 内の相対位置
      const slot1 = profile.slots[0];
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
      // profile.resolution 基準のピクセル移動
      const dx_px = dx * profile.resolution.width;
      const dy_px = dy * profile.resolution.height;
      
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
      return { 
        x: (r.x / profile.resolution.width) * 100, 
        y: (r.y / profile.resolution.height) * 100, 
        w: (r.w / profile.resolution.width) * 100, 
        h: (r.h / profile.resolution.height) * 100 
      };
    } else if (step === 'items') {
      const r = currentTarget as RelativeRect;
      return { 
        x: (r.x_rel / profile.parent_window.w) * 100, 
        y: (r.y_rel / profile.parent_window.h) * 100, 
        w: (r.w / profile.parent_window.w) * 100, 
        h: (r.h / profile.parent_window.h) * 100 
      };
    } else if (step === 'normalization') {
      // ステップ3では背景が Slot 1 Level なので、それに対する相対位置を計算
      const r = currentTarget as Point;
      const slot1 = profile.slots[0];
      return { 
        x: ((r.x_rel - slot1.level.x_rel) / slot1.level.w) * 100, 
        y: ((r.y_rel - slot1.level.y_rel) / slot1.level.h) * 100, 
        w: 0, h: 0, 
        isPoint: true 
      };
    }
    return null;
  }, [currentTarget, step, profile.parent_window]);

  return (
    <div 
      ref={containerRef}
      className={`relative rounded border-2 border-mhw-accent/20 overflow-hidden shadow-2xl group select-none transition-all duration-500 ease-in-out ${step === 'normalization' ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{
        aspectRatio: currentRatio,
        backgroundColor: '#000',
        maxHeight: '70vh' // 画面を突き抜けないように制限
      }}
      onMouseDown={step === 'normalization' ? (e) => handleMouseDown('point', e) : undefined}
    >
      {/* Background Layer */}
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

      {/* SVG Overlay */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow-amber"><feGaussianBlur stdDeviation="0.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {renderBox && !renderBox.isPoint && (
          <>
            {/* Mask - ステップ2以降では親ROIに合わせるため不要な場合が多いが、コンテキスト維持のため残す。 */}
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
      {showOverlays && (
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
          <span className="text-[8px] bg-mhw-accent text-mhw-bg px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            {step} PHASE
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

