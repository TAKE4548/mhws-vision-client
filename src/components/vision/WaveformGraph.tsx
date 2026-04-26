import React from 'react';

interface WaveformGraphProps {
  waveform: number[];
  threshold: number;
  className?: string;
}

export const WaveformGraph: React.FC<WaveformGraphProps> = ({
  waveform,
  threshold,
  className = '',
}) => {
  // SVG coordinates: x=0 to 100, y=0 to 40
  // waveform values are 0.0 to 1.0. 
  // In SVG, y=0 is top, so we invert it: y = 40 * (1.0 - val)
  
  const width = 100;
  const height = 40;
  
  const points = waveform.map((val, i) => {
    const x = (i / (waveform.length - 1)) * width;
    const y = height * (1.0 - val);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const thresholdY = height * (1.0 - threshold);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fill Area */}
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill="url(#waveformGradient)"
          className="opacity-20"
        />

        {/* Threshold Line */}
        <line
          x1="0"
          y1={thresholdY}
          x2={width}
          y2={thresholdY}
          stroke="#ef4444"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="opacity-50"
        />

        {/* Waveform Line */}
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          points={points}
          filter="url(#neonGlow)"
          className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        />
      </svg>
    </div>
  );
};
