
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, Box, CircleDot, Github, Copy, CheckCircle, ChevronDown, Plus, X, Palette as PaletteIcon, Trash2, PlusCircle, FolderHeart, Layout, Heart, Eye, PlusSquare } from 'lucide-react';
import { generateColorsFromKeyword } from './services/geminiService';
import { RecommendationResponse, ColorDetail, StageObject, ViewMode, CustomPalette } from './types';
import CompositionLab from './components/CompositionLab';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  
  const [stageObjects, setStageObjects] = useState<StageObject[]>([]);
  const [bgColor, setBgColor] = useState<ColorDetail | null>(null);
  
  // Custom Palette States
  const [palettes, setPalettes] = useState<CustomPalette[]>(() => {
    const saved = localStorage.getItem('colormind-palettes');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: '기본 컬렉션', colors: [] }];
  });
  const [activePaletteId, setActivePaletteId] = useState<string>(palettes[0].id);
  const [isPaletteForcedOpen, setIsPaletteForcedOpen] = useState(false);
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  const isPaletteVisible = isPaletteForcedOpen || isPaletteHovered;

  useEffect(() => {
    localStorage.setItem('colormind-palettes', JSON.stringify(palettes));
  }, [palettes]);

  useEffect(() => {
    if (data && data.colors && data.colors.length >= 2) {
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
    setVisibleCount(5);
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

  const showMoreColors = () => setVisibleCount(prev => Math.min(prev + 5, 20));

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

  const deletePalette = (id: string) => {
    if (palettes.length <= 1) return;
    const filtered = palettes.filter(p => p.id !== id);
    setPalettes(filtered);
    if (activePaletteId === id) {
      setActivePaletteId(filtered[0].id);
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 transition-all">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Color Pick
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPaletteForcedOpen(!isPaletteForcedOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isPaletteForcedOpen ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'}`}
            >
              <Heart className={`w-4 h-4 ${isPaletteForcedOpen ? 'fill-current' : ''}`} />
              마이 팔레트 ({activePalette.colors.length})
            </button>
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors hidden sm:block">
              <Github className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Multi-Palette Manager */}
      <div 
        className={`fixed right-6 top-24 z-40 w-80 bg-white rounded-3xl border-2 transition-all duration-500 overflow-hidden ${isPaletteVisible ? 'border-indigo-600 shadow-2xl scale-100 opacity-100 translate-x-0' : 'border-slate-200 scale-95 opacity-0 translate-x-4 pointer-events-none'}`}
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
              onKeyDown={(e) => e.key === 'Enter' && createPalette()}
            />
            <button onClick={createPalette} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {palettes.map((pal) => (
            <div 
              key={pal.id} 
              className={`p-4 border-b border-slate-50 transition-colors group/item ${activePaletteId === pal.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50 cursor-pointer'}`}
              onClick={() => setActivePaletteId(pal.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${activePaletteId === pal.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {pal.name}
                  </span>
                  {activePaletteId === pal.id && <CheckCircle className="w-3 h-3 text-indigo-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{pal.colors.length} 색</span>
                  {palettes.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePalette(pal.id); }}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-1 min-h-[2rem]">
                {pal.colors.map((color) => (
                  <div key={`${pal.id}-${color}`} className="group/color relative aspect-square rounded-lg border border-white flex items-center justify-center cursor-pointer overflow-hidden" style={{ backgroundColor: color }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPalette(pal.id, color); }}
                      className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {pal.colors.length === 0 && (
                  <div className="col-span-6 text-[8px] font-bold text-slate-300 uppercase py-2 text-center border border-dashed border-slate-100 rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <section className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            Color Pick
          </h2>
          <p className="text-slate-500 text-lg font-medium">AI 컬러 연구소 : 3D 시뮬레이션으로 확인하는 색상 조합</p>
        </section>

        <section className="mb-20">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 따뜻한 제주도 노을..."
              className="w-full h-16 pl-6 pr-40 rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-indigo-600 transition-all text-lg font-medium shadow-sm"
            />
            <button
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-black transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              연구 시작
            </button>
          </form>
          {error && <div className="mt-6 text-red-500 text-center font-bold">{error}</div>}
        </section>

        {data && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <CompositionLab 
              stageObjects={stageObjects} 
              bg={bgColor} 
              onUpdateObjects={setStageObjects}
              onRemoveObject={removeObjectFromStage}
            />

            <div className="border-b-2 border-slate-100 pb-10 flex items-end justify-between">
               <div>
                 <h3 className="text-3xl font-black text-slate-900">{data.themeName}</h3>
                 <p className="text-slate-400 font-bold mt-1">전문가를 위한 20색 한난 조화 시스템</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {data.colors.slice(0, visibleCount).map((color, index) => (
                <div key={index} className="flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-indigo-400 transition-all animate-in zoom-in duration-300 group/card">
                  <div className="aspect-square flex items-center justify-center p-8 bg-slate-50 relative">
                     {/* Main Swatch with Palette Add Overlay */}
                     <div className="w-28 h-28 rounded-2xl border border-white shadow-sm relative overflow-hidden" style={{ backgroundColor: color.base }}>
                        <button 
                          onClick={() => addToActivePalette(color.base)}
                          className="absolute inset-0 bg-indigo-600/60 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          title="메인 컬러 추가"
                        >
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-black uppercase">Add Base</span>
                        </button>
                     </div>
                     <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <code className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-black text-slate-600">{color.base}</code>
                     </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-black text-slate-900 truncate">{color.name}</h4>
                      <div className="flex items-center gap-1">
                        <button onClick={() => addToActivePalette(color.base)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors" title="팔레트에 추가">
                          <PlusSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => copyToClipboard(color.base, index)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors" title="복사">
                          {copiedIndex === index ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mb-5">
                      <button onClick={() => addObjectToStage(color, 'sphere')} className="flex flex-col items-center gap-1 py-2 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                        <CircleDot className="w-3.5 h-3.5" /> <span className="text-[8px] font-black uppercase">Sphere</span>
                      </button>
                      <button onClick={() => addObjectToStage(color, 'cube')} className="flex flex-col items-center gap-1 py-2 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                        <Box className="w-3.5 h-3.5" /> <span className="text-[8px] font-black uppercase">Cube</span>
                      </button>
                      <button onClick={() => setBgColor(color)} className="col-span-2 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all text-[9px] font-black mt-1 uppercase">
                        STAGE BG 설정
                      </button>
                    </div>

                    {/* Style Swatches with Hover Activation */}
                    <div 
                      className="mt-auto p-3 bg-slate-50 rounded-xl border border-slate-100 group/variations"
                      onMouseEnter={() => setIsPaletteHovered(true)}
                      onMouseLeave={() => setIsPaletteHovered(false)}
                    >
                       <span className="text-[9px] font-black text-slate-400 block uppercase mb-3 text-center tracking-tighter group-hover/variations:text-indigo-600 transition-colors">
                         {activePalette.name}에 추가
                       </span>
                       <div className="flex justify-between items-center px-1">
                         {color.variations.map((v, i) => (
                           <div key={i} className="flex flex-col items-center gap-1">
                             <div className="flex -space-x-3 transition-transform hover:scale-110">
                                <button 
                                  onClick={() => addToActivePalette(v.highlight)}
                                  className="w-10 h-10 rounded-full border-2 border-white relative group/sw" 
                                  style={{ backgroundColor: v.highlight }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sw:opacity-100 bg-white/40 rounded-full">
                                    <Plus className="w-4 h-4 text-slate-900" />
                                  </div>
                                </button>
                                <button 
                                  onClick={() => addToActivePalette(v.shadow)}
                                  className="w-10 h-10 rounded-full border-2 border-white relative group/sw" 
                                  style={{ backgroundColor: v.shadow }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sw:opacity-100 bg-black/20 rounded-full">
                                    <Plus className="w-4 h-4 text-white" />
                                  </div>
                                </button>
                             </div>
                             <span className="text-[8px] font-black text-slate-400">{v.label[0]}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < 20 && data.colors.length > visibleCount && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={showMoreColors}
                  className="flex items-center gap-2 px-10 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                >
                  컬러 더 보기 <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xl font-black text-slate-800 animate-pulse">AI가 최적의 컬러 엔진을 가동 중입니다...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
