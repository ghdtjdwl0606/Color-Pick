
import React, { useState, useRef } from 'react';
import { ColorDetail, ViewMode, StageObject } from '../types';
import Visualizer from './Visualizer';
import { Palette, Maximize2, Trash2, Layers, Info, Check, Wand2 } from 'lucide-react';

interface CompositionLabProps {
  stageObjects: StageObject[];
  bg: ColorDetail | null;
  onUpdateObjects: (objects: StageObject[]) => void;
  onRemoveObject: (id: string) => void;
}

const CompositionLab: React.FC<CompositionLabProps> = ({ stageObjects, bg, onUpdateObjects, onRemoveObject }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, id: string, isResize = false) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (isResize) {
      setResizingId(id);
    } else {
      setDraggingId(id);
      setSelectedId(id);
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
      const targetObj = stageObjects.find(o => o.id === id);
      if (targetObj) {
        onUpdateObjects([...stageObjects.filter(o => o.id !== id), targetObj]);
      }
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();

    if (draggingId) {
      let newX = ((e.clientX - stageRect.left - dragOffset.x) / stageRect.width) * 100;
      let newY = ((e.clientY - stageRect.top - dragOffset.y) / stageRect.height) * 100;
      onUpdateObjects(stageObjects.map(obj => 
        obj.id === draggingId ? { ...obj, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } : obj
      ));
    } else if (resizingId) {
      const obj = stageObjects.find(o => o.id === resizingId);
      if (!obj) return;
      const centerX = (obj.x / 100) * stageRect.width + stageRect.left;
      const centerY = (obj.y / 100) * stageRect.height + stageRect.top;
      const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
      onUpdateObjects(stageObjects.map(o => 
        o.id === resizingId ? { ...o, size: Math.max(50, Math.min(450, dist * 2)) } : o
      ));
    }
  };

  const currentBgColor = bg?.base || '#ffffff';
  const selectedObject = stageObjects.find(o => o.id === selectedId);

  return (
    <div className="mt-12 bg-white rounded-[2rem] p-6 border border-slate-200 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900">3D Composition Lab</h3>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">Stage:</span>
          <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: currentBgColor }} />
          <span className="text-xs font-bold text-slate-700">{bg?.name || 'White'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div 
          ref={stageRef}
          className="lg:col-span-8 h-[600px] rounded-[2rem] relative border border-slate-100 select-none touch-none"
          style={{ backgroundColor: currentBgColor }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => { setDraggingId(null); setResizingId(null); }}
          onPointerLeave={() => { setDraggingId(null); setResizingId(null); }}
          onClick={() => setSelectedId(null)}
        >
          {stageObjects.map((obj) => (
            <div 
              key={obj.id}
              className={`absolute cursor-grab active:cursor-grabbing group`}
              style={{ 
                left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.size}px`, height: `${obj.size}px`,
                transform: `translate(-50%, -50%)`,
              }}
              onPointerDown={(e) => handlePointerDown(e, obj.id)}
              onClick={(e) => e.stopPropagation()}
            >
              <Visualizer color={obj.color} variation={obj.color.variations[obj.activeVariationIndex]} mode={obj.type} size={obj.size} hideDetails />
              <div className={`absolute -inset-1 border-2 rounded-[1.5rem] ${selectedId === obj.id ? 'border-indigo-600' : 'border-transparent group-hover:border-slate-300'}`} />
              <div 
                className="absolute -right-1 -bottom-1 w-6 h-6 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center cursor-nwse-resize opacity-0 group-hover:opacity-100 z-10"
                onPointerDown={(e) => handlePointerDown(e, obj.id, true)}
              ><Maximize2 className="w-3 h-3 text-indigo-600" /></div>
              <button 
                className="absolute -right-1 -top-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                onClick={(e) => { e.stopPropagation(); onRemoveObject(obj.id); }}
              ><Trash2 className="w-3 h-3 text-white" /></button>
            </div>
          ))}
          {stageObjects.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-300"><Layers className="w-12 h-12 mb-2 opacity-20" />팔레트에서 물체를 추가하세요</div>}
        </div>

        <div className="lg:col-span-4 bg-slate-50 rounded-[2rem] border border-slate-100 p-6 flex flex-col h-full">
          {selectedObject ? (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase">Selected</span>
                <h4 className="text-xl font-black">{selectedObject.color.name}</h4>
              </div>
              <div className="space-y-3">
                {selectedObject.color.variations.map((v, i) => {
                  const active = selectedObject.activeVariationIndex === i;
                  return (
                    <button
                      key={i} onClick={() => onUpdateObjects(stageObjects.map(o => o.id === selectedObject.id ? {...o, activeVariationIndex: i} : o))}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${active ? 'border-indigo-600 bg-indigo-600 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: v.highlight }} />
                        <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: v.shadow }} />
                        <span className="ml-2 font-black text-sm self-center">{v.label}</span>
                      </div>
                      {active && <Check className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{selectedObject.color.reason}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Info className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-400">물체를 선택하여 명암 스타일을 변경하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompositionLab;
