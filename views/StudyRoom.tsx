
import React, { useState } from 'react';
import { Palace, Locus } from '../types';
import { FeynmanChatModal } from '../components/FeynmanChatModal';
import { get8020Analysis, getBizarreMnemonic } from '../services/geminiService';

interface StudyRoomProps {
  palace: Palace;
  onUpdate: (palace: Palace) => void;
  onBack: () => void;
  onFlashcards: () => void;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({ palace, onUpdate, onBack, onFlashcards }) => {
  const [selectedLocus, setSelectedLocus] = useState<Locus | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tempConcept, setTempConcept] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);

  const handleUpdateLocus = async () => {
    if (!selectedLocus) return;
    const updatedLoci = palace.loci.map(l => 
      l.id === selectedLocus.id ? { ...l, concept: tempConcept } : l
    );
    onUpdate({ ...palace, loci: updatedLoci });
    setSelectedLocus({ ...selectedLocus, concept: tempConcept });
  };

  const handle8020 = async () => {
    setIsAnalyzing(true);
    try {
      const concepts = await get8020Analysis(palace.title);
      const updatedLoci = [...palace.loci];
      concepts.forEach((c, i) => {
        if (updatedLoci[i]) updatedLoci[i].concept = c;
      });
      onUpdate({ ...palace, loci: updatedLoci });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMnemonic = async () => {
    if (!selectedLocus || !selectedLocus.concept) return;
    setIsGeneratingMnemonic(true);
    try {
      const mnemonic = await getBizarreMnemonic(selectedLocus.objectName, selectedLocus.concept);
      const updatedLoci = palace.loci.map(l => 
        l.id === selectedLocus.id ? { ...l, mentalImage: mnemonic } : l
      );
      onUpdate({ ...palace, loci: updatedLoci });
      setSelectedLocus({ ...selectedLocus, mentalImage: mnemonic });
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-20">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-white font-bold flex items-center group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Menu
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handle8020} 
            disabled={isAnalyzing}
            className="bg-blue-600/10 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-blue-600/20 transition-all uppercase tracking-widest"
          >
            {isAnalyzing ? 'Analisando Edital...' : '🎯 Estratégia 80/20'}
          </button>
          <button onClick={onFlashcards} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-amber-500/10 transition-all uppercase tracking-widest">
            🎴 Flashcards ({palace.flashcards?.length || 0})
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 group/image">
            <img src={palace.imageUrl} className="w-full h-auto object-cover group-hover/image:scale-[1.02] transition-transform duration-700" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-6 right-6 bg-slate-950/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700 text-xs font-bold shadow-xl">
               {palace.loci.filter(l => l.concept).length} / {palace.loci.length} Âncoras
            </div>
          </div>
          
          {selectedLocus?.mentalImage && (
            <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2rem] animate-slideUp relative overflow-hidden">
               <div className="absolute -top-4 -right-4 text-8xl opacity-5 pointer-events-none">🧠</div>
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Imagem Mental (Von Restorff)</h4>
               <p className="text-lg italic text-slate-200 leading-relaxed">"{selectedLocus.mentalImage}"</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] h-[450px] overflow-y-auto custom-scrollbar shadow-inner">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 sticky top-0 z-10 backdrop-blur-md">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objetos do Palácio</h4>
            </div>
            {palace.loci.map((locus, index) => (
              <button
                key={locus.id}
                onClick={() => { setSelectedLocus(locus); setTempConcept(locus.concept); }}
                className={`w-full text-left p-6 border-b border-slate-800/50 transition-all relative ${selectedLocus?.id === locus.id ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-slate-800/30'}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-slate-700 mt-1">{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{locus.objectName}</div>
                    <div className="text-sm font-bold text-slate-200">{locus.concept || <span className="text-slate-700 italic">Vazio</span>}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedLocus && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-5 animate-slideUp shadow-2xl">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Conceito para {selectedLocus.objectName}</label>
                <input 
                  type="text" value={tempConcept} onChange={(e) => setTempConcept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                  placeholder="O que memorizar aqui?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleUpdateLocus} className="bg-slate-800 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all text-white border border-slate-700">Salvar</button>
                <button 
                  onClick={handleGenerateMnemonic} 
                  disabled={!selectedLocus.concept || isGeneratingMnemonic}
                  className="bg-amber-500/10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                >
                  {isGeneratingMnemonic ? 'Criando...' : '🪄 Mnemônico'}
                </button>
              </div>
              <button onClick={() => setIsChatOpen(true)} disabled={!selectedLocus.concept} className="w-full bg-amber-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10 transition-all">🎓 Tutor Feynman</button>
            </div>
          )}
        </div>
      </div>
      {isChatOpen && selectedLocus && <FeynmanChatModal locus={selectedLocus} theme={palace.theme} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};
