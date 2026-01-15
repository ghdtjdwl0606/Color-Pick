
import React, { useId } from 'react';
import { ColorDetail, ViewMode, ColorVariation } from '../types';

interface VisualizerProps {
  color: ColorDetail;
  variation?: ColorVariation;
  mode: ViewMode;
  size?: number;
  hideDetails?: boolean;
}

const Sphere: React.FC<{ color: string; highlight: string; shadow: string }> = ({ color, highlight, shadow }) => {
  const id = useId().replace(/:/g, '');
  const gradId = `grad-sphere-${id}`;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full block">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="65%" fx="30%" fy="30%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={shadow} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill={`url(#${gradId})`} />
    </svg>
  );
};

const Cube: React.FC<{ color: string; highlight: string; shadow: string }> = ({ color, highlight, shadow }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full block">
    <g transform="translate(100, 110)">
      <path d="M -65 -45 L 0 0 L 0 90 L -65 45 Z" fill={color} />
      <path d="M 0 0 L 65 -45 L 65 45 L 0 90 Z" fill={shadow} />
      <path d="M -65 -45 L 0 -90 L 65 -45 L 0 0 Z" fill={highlight} />
    </g>
  </svg>
);

const Visualizer: React.FC<VisualizerProps> = ({ color, variation, mode, size = 100, hideDetails = false }) => {
  const activeVar = variation || (color.variations && color.variations.length > 0 
    ? color.variations[0] 
    : { label: 'Default', highlight: '#ffffff', shadow: '#000000' });
  
  const renderShape = () => {
    switch (mode) {
      case 'sphere': return <Sphere color={color.base} highlight={activeVar.highlight} shadow={activeVar.shadow} />;
      case 'cube': return <Cube color={color.base} highlight={activeVar.highlight} shadow={activeVar.shadow} />;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${hideDetails ? '' : 'p-4 bg-white rounded-2xl border border-slate-200 min-h-[280px]'}`}>
      <div className={`${hideDetails ? 'w-full h-full' : 'w-48 h-48 mb-4'} flex items-center justify-center`}>
        {renderShape()}
      </div>
      {!hideDetails && (
        <div className="flex flex-col gap-4 w-full max-w-[240px]">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-200 mb-1" style={{ backgroundColor: activeVar.highlight }} />
              <span className="text-[10px] text-slate-400 font-bold uppercase">High</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-200 mb-1" style={{ backgroundColor: color.base }} />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Base</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-200 mb-1" style={{ backgroundColor: activeVar.shadow }} />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Shadow</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizer;
