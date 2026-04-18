import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useROIStore, ROICoordinates } from '../../store/roiStore';
import ResizeHandle from './ResizeHandle';

interface InteractiveCanvasProps {
  backgroundImage?: string;
}

type InteractionType = 'move' | 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize' | null;

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ backgroundImage }) => {
  const { roi, updateRoi } = useROIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<{ type: InteractionType; startPos: { x: number; y: number }; startRoi: ROICoordinates } | null>(null);

  const getNormalizedCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const handleMouseDown = (type: InteractionType, e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getNormalizedCoords(e.clientX, e.clientY);
    setInteraction({
      type,
      startPos: pos,
      startRoi: { ...roi }
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !containerRef.current) return;

    const currentPos = getNormalizedCoords(e.clientX, e.clientY);
    const dx = currentPos.x - interaction.startPos.x;
    const dy = currentPos.y - interaction.startPos.y;

    const newRoi = { ...interaction.startRoi };

    switch (interaction.type) {
      case 'move':
        newRoi.x = interaction.startRoi.x + dx;
        newRoi.y = interaction.startRoi.y + dy;
        break;
      case 'nw-resize':
        newRoi.x = interaction.startRoi.x + dx;
        newRoi.y = interaction.startRoi.y + dy;
        newRoi.w = interaction.startRoi.w - dx;
        newRoi.h = interaction.startRoi.h - dy;
        break;
      case 'ne-resize':
        newRoi.y = interaction.startRoi.y + dy;
        newRoi.w = interaction.startRoi.w + dx;
        newRoi.h = interaction.startRoi.h - dy;
        break;
      case 'sw-resize':
        newRoi.x = interaction.startRoi.x + dx;
        newRoi.w = interaction.startRoi.w - dx;
        newRoi.h = interaction.startRoi.h + dy;
        break;
      case 'se-resize':
        newRoi.w = interaction.startRoi.w + dx;
        newRoi.h = interaction.startRoi.h + dy;
        break;
    }

    // 負のサイズを防ぐ
    if (newRoi.w < 0.01) {
      if (interaction.type?.includes('w')) newRoi.x = interaction.startRoi.x + interaction.startRoi.w - 0.01;
      newRoi.w = 0.01;
    }
    if (newRoi.h < 0.01) {
      if (interaction.type?.includes('n')) newRoi.y = interaction.startRoi.y + interaction.startRoi.h - 0.01;
      newRoi.h = 0.01;
    }

    updateRoi(newRoi);
  }, [interaction, updateRoi]);

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

  // ピクセル換算（描画用）
  const getPixelStyles = () => {
    return {
      left: `${roi.x * 100}%`,
      top: `${roi.y * 100}%`,
      width: `${roi.w * 100}%`,
      height: `${roi.h * 100}%`
    };
  };

  return (
    <div 
      ref={containerRef}
      className="aspect-video bg-black relative rounded border-2 border-kinetic-outline-variant/20 overflow-hidden shadow-inner group select-none"
    >
      {/* Background Image / Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {backgroundImage ? (
          <img src={backgroundImage} alt="Preview" className="w-full h-full object-contain opacity-50" />
        ) : (
          <span className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Calibration Source Preview</span>
        )}
      </div>

      {/* SVG Overlay */}
      <svg 
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Darken Outside ROI */}
        <path
          fill="rgba(0,0,0,0.5)"
          fillRule="evenodd"
          d={`M 0 0 H 100 V 100 H 0 Z M ${roi.x * 100} ${roi.y * 100} h ${roi.w * 100} v ${roi.h * 100} h ${-roi.w * 100} z`}
          className="transition-all duration-75"
        />

        {/* ROI Box */}
        <rect
          x={roi.x * 100}
          y={roi.y * 100}
          width={roi.w * 100}
          height={roi.h * 100}
          className="fill-kinetic-amber/5 stroke-kinetic-amber stroke-[0.5] cursor-move pointer-events-auto"
          style={{ filter: 'url(#glow)' }}
          onMouseDown={(e) => handleMouseDown('move', e)}
        />

        {/* Handles */}
        <g className="pointer-events-auto">
          <ResizeHandle x={roi.x * 100} y={roi.y * 100} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('nw-resize', e)} />
          <ResizeHandle x={(roi.x + roi.w) * 100} y={roi.y * 100} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('ne-resize', e)} />
          <ResizeHandle x={roi.x * 100} y={(roi.y + roi.h) * 100} cursor="nesw-resize" onMouseDown={(e) => handleMouseDown('sw-resize', e)} />
          <ResizeHandle x={(roi.x + roi.w) * 100} y={(roi.y + roi.h) * 100} cursor="nwse-resize" onMouseDown={(e) => handleMouseDown('se-resize', e)} />
        </g>
      </svg>

      {/* Label */}
      <div 
        className="absolute pointer-events-none flex gap-2"
        style={{ 
          left: `${roi.x * 100}%`, 
          top: `calc(${roi.y * 100}% - 24px)`,
          opacity: roi.y < 0.1 ? 0.3 : 1
        }}
      >
        <span className="text-[9px] bg-kinetic-amber text-black font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shadow-lg">
          ACTIVE_ROI: {(roi.w * 100).toFixed(0)}x{(roi.h * 100).toFixed(0)}
        </span>
      </div>

      {/* HUD Corners */}
      <div className="absolute inset-0 pointer-events-none border border-kinetic-outline-variant/10 flex flex-col justify-between p-4">
        <div className="flex justify-between">
          <div className="w-8 h-8 border-t border-l border-kinetic-amber/30" />
          <div className="w-8 h-8 border-t border-r border-kinetic-amber/30" />
        </div>
        <div className="flex justify-between">
          <div className="w-8 h-8 border-b border-l border-kinetic-amber/30" />
          <div className="w-8 h-8 border-b border-r border-kinetic-amber/30" />
        </div>
      </div>
    </div>
  );
};

export default InteractiveCanvas;
