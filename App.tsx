
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, Box, CircleDot, Github, Copy, CheckCircle, ChevronDown, Plus, X, Trash2, PlusCircle, FolderHeart, Heart, PlusSquare, AlertCircle } from 'lucide-react';
import { generateColorsFromKeyword } from './services/geminiService';
import { RecommendationResponse, ColorDetail, StageObject, ViewMode, CustomPalette } from './types';
import CompositionLab from './components/CompositionLab';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(6); // 모바일 2열 구성을 위해 짝수로 시작
  
  const [stageObjects, setStageObjects] = useState<StageObject[]>([]);
  const [bgColor, setBgColor] = useState<ColorDetail | null>(null);
  
  const [palettes, setPalettes] = useState<CustomPalette[]>(() => {
    const saved = localStorage.getItem('color-pick-palettes');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: '기본 컬렉션', colors: [] }];
  });
  const [activePaletteId, setActivePaletteId] = useState<string>(palettes[0].id);
  const [isPaletteForcedOpen, setIsPaletteForcedOpen] = useState(false);
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  const isPaletteVisible = isPaletteForcedOpen || isPaletteHovered;

  useEffect(() => {
    localStorage.setItem('color-pick-palettes', JSON.stringify(palettes));
  }, [palettes]);

  useEffect(() => {
    if (data?.colors && data.colors.length >= 2) {
      const initialStage: StageObject[] = data.colors.slice(0, 2).map((color, i) => ({
        id: `obj-${Date.now()}-${i}`,
        color,
        activeVariationIndex: 0,
        type: i === 0 ? 'sphere' : 'cube',
        x: 35 + i * 30,
        y: 45,
        size: 140
      }));
      setStageObjects(initialStage);
    }
  }, [data]);

  const addObjectToStage = (color: ColorDetail, type: ViewMode) => {
    const newObj: StageObject = {
      id: `obj-${Date.now()}-${Math.random()}`,
      color,
      activeVariationIndex: 0,
      type,
      x: 50,
      y: 50,
      size: 140
    };
    setStageObjects([...stageObjects, newObj]);
  };

  const removeObjectFromStage = (id: string) => {
    setStageObjects(stageObjects.filter(o => o.id !== id));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleCount(6);
    setBgColor(null);
    try {
      const result = await generateColorsFromKeyword(keyword);
      setData(result);
    } catch (err: any) {
      setError(err.message || '데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const showMoreColors = () => setVisibleCount(prev => Math.min(prev + 6, 20));

  const copyToClipboard = (text: string, index: number | string) => {
    navigator.clipboard.writeText(text);
    if (typeof index === 'number') setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const createPalette = () => {
    if (!newPaletteName.trim()) return;
    const newPalette: CustomPalette = {
      id: `pal-${Date.now()}`,
      name: newPaletteName,
      colors: []
    };
    setPalettes([...palettes, newPalette]);
    setActivePaletteId(newPalette.id);
    setNewPaletteName('');
  };

  const addToActivePalette = (hex: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === activePaletteId && !p.colors.includes(hex)) {
        return { ...p, colors: [...p.colors, hex] };
      }
      return p;
    }));
  };

  const removeFromPalette = (paletteId: string, hex: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        return { ...p, colors: p.colors.filter(c => c !== hex) };
      }
      return p;
    }));
  };

  const activePalette = palettes.find(p => p.id === activePaletteId) || palettes[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 transition-all overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Color Pick
            </h1>
          </div>
          <button 
            onClick={() => setIsPaletteForcedOpen(!isPaletteForcedOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${isPaletteForcedOpen ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'}`}
          >
            <Heart className={`w-4 h-4 ${isPaletteForcedOpen ? 'fill-current' : ''}`} />
            <span>팔레트</span> <span className="hidden xs:inline">({activePalette.colors.length})</span>
          </button>
        </div>
      </header>

      {/* Floating Multi-Palette Manager */}
      <div 
        className={`fixed inset-x-4 sm:inset-auto sm:right-6 top-20 z-40 sm:w-80 bg-white rounded-3xl border-2 transition-all duration-500 overflow-hidden ${isPaletteVisible ? 'border-indigo-600 shadow-2xl scale-100 opacity-100 translate-y-0' : 'border-slate-200 scale-95 opacity-0 -translate-y-4 pointer-events-none'}`}
        onMouseEnter={() => setIsPaletteHovered(true)}
        onMouseLeave={() => setIsPaletteHovered(false)}
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-black text-slate-700 uppercase">컬렉션 관리</span>
            </div>
            <button onClick={() => setIsPaletteForcedOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              placeholder="새 컬렉션 이름"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
            <button onClick={createPalette} className="p-2 bg-indigo-600 text-white rounded-xl">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {palettes.map((pal) => (
            <div key={pal.id} className={`p-4 border-b border-slate-50 transition-colors ${activePaletteId === pal.id ? 'bg-indigo-50/50' : ''}`} onClick={() => setActivePaletteId(pal.id)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-700">{pal.name}</span>
                <span className="text-[10px] font-bold text-slate-400">{pal.colors.length} 색</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {pal.colors.map((color) => (
                  <div key={color} className="w-6 h-6 rounded-md border border-white relative group" style={{ backgroundColor: color }}>
                    <button onClick={(e) => { e.stopPropagation(); removeFromPalette(pal.id, color); }} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16">
        <section className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">Color Pick</h2>
          <p className="text-slate-500 text-sm sm:text-lg font-medium px-4">AI 컬러 연구소 : 3D 시뮬레이션으로 확인하는 색상 조합</p>
        </section>

        <section className="mb-12 sm:mb-20">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 따뜻한 제주도 노을..."
              className="w-full h-14 sm:h-16 pl-5 sm:pl-6 pr-28 sm:pr-40 rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-indigo-600 transition-all text-sm sm:text-lg font-medium shadow-sm"
            />
            <button
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-black transition-all flex items-center gap-2 text-xs sm:text-base"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              연구 시작
            </button>
          </form>
          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs sm:text-sm font-bold leading-relaxed">{error}</p>
            </div>
          )}
        </section>

        {data && (
          <div className="space-y-12 sm:space-y-20">
            <div className="hidden sm:block">
              <CompositionLab stageObjects={stageObjects} bg={bgColor} onUpdateObjects={setStageObjects} onRemoveObject={removeObjectFromStage} />
            </div>

            <div className="border-b-2 border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
               <div>
                 <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{data.themeName}</h3>
                 <p className="text-slate-400 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-widest">전문가용 20색 한난 조화 시스템</p>
               </div>
            </div>

            {/* Mobile: 2 columns grid | Desktop: Responsive 3 to 5 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              {data.colors.slice(0, visibleCount).map((color, index) => (
                <div key={index} className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 transition-all group/card shadow-sm">
                  <div className="aspect-square flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 relative">
                     <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl border border-white shadow-md relative overflow-hidden" style={{ backgroundColor: color.base }}>
                        <button onClick={() => addToActivePalette(color.base)} className="absolute inset-0 bg-indigo-600/60 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-[8px] font-black uppercase tracking-tighter">Add</span>
                        </button>
                     </div>
                     <code className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/90 rounded-md text-[8px] sm:text-[10px] font-bold text-slate-500 shadow-sm">{color.base}</code>
                  </div>
                  
                  <div className="p-3 sm:p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate pr-1">{color.name}</h4>
                      <button onClick={() => copyToClipboard(color.base, index)} className="shrink-0 p-1 text-slate-300 hover:text-indigo-600 transition-colors">
                        {copiedIndex === index ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mb-4">
                      <button onClick={() => addObjectToStage(color, 'sphere')} className="flex flex-col items-center gap-1 py-1.5 bg-slate-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                        <CircleDot className="w-3 h-3" /> <span className="text-[7px] font-black uppercase">Sphere</span>
                      </button>
                      <button onClick={() => addObjectToStage(color, 'cube')} className="flex flex-col items-center gap-1 py-1.5 bg-slate-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                        <Box className="w-3 h-3" /> <span className="text-[7px] font-black uppercase">Cube</span>
                      </button>
                    </div>

                    <div className="mt-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                       <span className="text-[7px] font-black text-slate-400 block uppercase mb-2 text-center">Style Mix</span>
                       <div className="flex justify-around items-center">
                         {color.variations.map((v, i) => (
                           <button key={i} onClick={() => addToActivePalette(v.highlight)} className="group/var flex -space-x-2.5 transition-transform hover:scale-110">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.highlight }} />
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.shadow }} />
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < 20 && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={showMoreColors}
                  className="flex items-center gap-2 px-10 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-black text-sm sm:text-base hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                >
                  컬러 더 보기 <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-base sm:text-xl font-black text-slate-800 animate-pulse">AI 엔진이 최적의 색상을 연구 중입니다...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
