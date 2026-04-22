import React from 'react'
import { Plus, Minus } from 'lucide-react'

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
        aria-label="decrement"
      >
        <Minus size={12} />
      </button>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(parseInt(e.target.value) || 0)} 
        className="w-full bg-transparent px-2 py-1 text-xs text-mhw-text font-mono text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
      <button 
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-2 hover:bg-white/10 text-mhw-accent transition-colors border-l border-white/10"
        aria-label="increment"
      >
        <Plus size={12} />
      </button>
    </div>
  </div>
);

export default NumericalAdjuster;
