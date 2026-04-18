import React from 'react';

interface ResizeHandleProps {
  x: number;
  y: number;
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ x, y, cursor, onMouseDown }) => {
  return (
    <rect
      x={x - 1}
      y={y - 1}
      width={2}
      height={2}
      className="fill-kinetic-amber stroke-surface-lowest stroke-[0.2] cursor-pointer transition-transform hover:scale-150"
      style={{ cursor }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
    />
  );
};

export default ResizeHandle;
