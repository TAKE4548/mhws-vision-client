import React from 'react';

interface ResizeHandleProps {
  x: number;
  y: number;
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ x, y, cursor, onMouseDown }) => {
  return (
    <g 
      className="pointer-events-auto" 
      style={{ cursor }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
    >
      {/* Invisible larger hit area */}
      <rect
        x={x - 2}
        y={y - 2}
        width={4}
        height={4}
        className="fill-transparent"
      />
      {/* Visible handle */}
      <rect
        x={x - 0.6}
        y={y - 0.6}
        width={1.2}
        height={1.2}
        className="fill-mhw-accent stroke-white stroke-[0.1]"
      />
    </g>
  );
};

export default ResizeHandle;
