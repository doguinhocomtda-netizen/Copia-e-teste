
import React, { useState, useMemo } from 'react';
import { Palace, Flashcard } from '../types';
import { generateFlashcards, suggestFlashcardMnemonic } from '../services/geminiService';

interface FlashcardsViewProps {
  palace: Palace | null;
  allPalaces?: Palace[];
  onSelectPalace?: (p: Palace) => void;
  onUpdatePalace: (p: Palace) => void;
  onBack: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ palace, allPalaces = [], onSelectPalace, onUpdatePalace, onBack }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'library'>('study');
  const [isGenerating, setIsGenerating] = useState(false);
  const [numCards, setNumCards] = useState(10);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [isGeneratingMnemonicId, setIsGeneratingMnemonicId] = useState<string | null>(null);

  // Filter cards to find those due for review
  const dueCards = useMemo(() => {
    if (!palace) return [];
    const now = Date.now();
    return (palace.flashcards || []).filter(card => !card.nextReview || card.nextReview <= now);
  }, [palace]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const conceptsCount = palace ? palace.loci.filter(l => l.concept).length : 0;
  const currentCard = dueCards[currentIndex];

  if (!palace) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-bold mb-3">Biblioteca de Flashcards</h2>
          <p className="text-slate-400">Selecione um Palácio da Memória para gerenciar seus conhecimentos.</p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPalaces.map(p => (
            <button 
              key={p.id}
              onClick={() => onSelectPalace?.(p)}
              className="group bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] text-left hover:border-amber-500/50 transition-all shadow-xl"
            >
              <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-slate-800">
                <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">{p.title}</h3>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{p.flashcards?.length || 0} Cartões</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Entrar →</span>
              </div>
            </button>
          ))}
        </div>

        {allPalaces.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
            <p className="text-slate-500 italic">Você ainda não criou nenhum palácio.</p>
          </div>
        )}
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!palace) return;
    const concepts = palace.loci.filter(l => l.concept).map(l => l.concept);
    if (concepts.length < 2) return;
    
    setIsGenerating(true);
    try {
      const cards = await generateFlashcards(palace.theme, concepts, Math.min(numCards, 50));
      const now = Date.now();
      const newFlashcards: Flashcard[] = cards.map(c => ({
        id: Math.random().toString(36).substr(2, 9),
        question: c.question!,
        answer: c.answer!,
        lastReview: now,
        nextReview: now, 
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5
      }));
      onUpdatePalace({ ...palace, flashcards: [...(palace.flashcards || []), ...newFlashcards] });
      setCurrentIndex(0); 
    } catch (error) {
      console.error("Erro ao gerar flashcards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMnemonic = async (cardId: string) => {
    if (!palace) return;
    const card = palace.flashcards.find(c => c.id === cardId);
    if (!card) return;

    setIsGeneratingMnemonicId(cardId);
    try {
      const mnemonic = await suggestFlashcardMnemonic(card.question, card.answer);
      const updatedCards = palace.flashcards.map(c => 
        c.id === cardId ? { ...c, mnemonic } : c
      );
      onUpdatePalace({ ...palace, flashcards: updatedCards });
    } finally {
      setIsGeneratingMnemonicId(null);
    }
  };

  const updateMnemonicManual = (cardId: string, mnemonic: string) => {
    if (!palace) return;
    const updatedCards = palace.flashcards.map(c => 
      c.id === cardId ? { ...c, mnemonic } : c
    );
    onUpdatePalace({ ...palace, flashcards: updatedCards });
  };

  const rateCard = (quality: number) => {
    if (!currentCard || !palace) return;

    let { interval, repetitions, easeFactor } = currentCard;
    if (quality >= 3) {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      repetitions++;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const now = Date.now();
    const nextReview = now + interval * 24 * 60 * 60 * 1000;

    const updatedCard: Flashcard = {
      ...currentCard,
      lastReview: now,
      nextReview,
      interval,
      repetitions,
      easeFactor
    };

    const updatedFlashcards = palace.flashcards.map(c => c.id === updatedCard.id ? updatedCard : c);
    onUpdatePalace({ ...palace, flashcards: updatedFlashcards });

    setShowAnswer(false);
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
    }
  };

  if (sessionFinished) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] space-y-6 shadow-2xl">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-amber-500">Revisão Concluída!</h2>
          <p className="text-slate-400">Excelente progresso em <strong>{palace.title}</strong>.</p>
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={() => { setSessionFinished(false); setCurrentIndex(0); }} className="bg-slate-800 text-slate-100 px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700">
              Revisar Novamente
            </button>
            <button onClick={onBack} className="bg-amber-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              Concluir Estudo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="text-slate-500 hover:text-white font-bold transition-colors flex items-center group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Voltar
          </button>
          <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
          <nav className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button 
              onClick={() => setActiveTab('study')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'study' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Estudar
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Biblioteca
            </button>
          </nav>
        </div>
        <div className="text-center md:text-right">
          <h2 className="text-xl font-bold text-slate-100">{palace.title}</h2>
          <p className="text-[10px] text-amber-500/70 uppercase font-black tracking-widest">Domínio de Memória</p>
        </div>
      </header>

      {activeTab === 'study' ? (
        <div className="max-w-2xl mx-auto">
          {dueCards.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <div className="space-y-4">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Biblioteca em Dia</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Você revisou todos os cartões deste palácio. Deseja expandir sua rede de conhecimentos?</p>
              </div>

              {conceptsCount < 2 ? (
                <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl text-amber-500 text-xs font-medium leading-relaxed">
                  ⚠️ Ancore pelo menos 2 conceitos no palácio (na área de Estudo) para gerar novos flashcards baseados neles.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                  <div className="flex flex-col items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-black mb-1">Quantidade</label>
                    <input 
                      type="number" min="1" max="50"
                      value={numCards} 
                      onChange={(e) => setNumCards(Number(e.target.value))}
                      className="w-28 bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="pt-5">
                    <button 
                      onClick={handleGenerate} 
                      disabled={isGenerating}
                      className="bg-amber-500 text-slate-950 font-black px-10 py-4 rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 active:scale-95 uppercase tracking-widest text-sm"
                    >
                      {isGenerating ? 'Processando IA...' : 'Gerar Cartões'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso: {currentIndex + 1} / {dueCards.length}</span>
                <div className="h-1.5 flex-1 mx-6 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 ease-out" 
                    style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div 
                onClick={() => !showAnswer && setShowAnswer(true)}
                className={`min-h-[380px] bg-slate-900 border-2 border-slate-800 rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:border-amber-500/30 transition-all relative group shadow-2xl ${showAnswer ? 'border-amber-500/20 bg-slate-800/20' : ''}`}
              >
                <div className="text-2xl font-bold leading-relaxed text-slate-100 max-w-md">
                  {showAnswer ? currentCard.answer : currentCard.question}
                </div>
                
                {showAnswer && currentCard.mnemonic && (
                  <div className="mt-10 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs italic text-amber-200/60 max-w-sm animate-fadeIn relative">
                    <div className="absolute -top-3 left-4 bg-slate-900 px-2 text-[8px] font-black text-amber-500 uppercase tracking-widest">Âncora Visual</div>
                    "{currentCard.mnemonic}"
                  </div>
                )}

                {!showAnswer && (
                  <div className="absolute bottom-12 text-[10px] uppercase font-black text-slate-500 tracking-[0.4em] animate-pulse">
                    Tocar para Revelar
                  </div>
                )}
                
                <div className="absolute top-8 left-8 w-14 h-14 bg-slate-950/50 rounded-2xl flex items-center justify-center border border-slate-800 text-2xl shadow-lg">
                  {showAnswer ? '💡' : '❓'}
                </div>
              </div>

              {showAnswer ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slideUp">
                  {[
                    { label: 'De novo', val: 0, color: 'red', time: '< 1 min' },
                    { label: 'Difícil', val: 3, color: 'orange', time: '2 dias' },
                    { label: 'Bom', val: 4, color: 'blue', time: '4 dias' },
                    { label: 'Fácil', val: 5, color: 'green', time: '7 dias' }
                  ].map((btn) => (
                    <button 
                      key={btn.val}
                      onClick={() => rateCard(btn.val)}
                      className={`flex flex-col items-center py-5 bg-${btn.color}-500/10 border border-${btn.color}-500/30 rounded-2xl hover:bg-${btn.color}-500/20 transition-all group active:scale-95`}
                    >
                      <span className={`text-${btn.color}-400 font-black text-[10px] uppercase tracking-widest`}>{btn.label}</span>
                      <span className={`text-[9px] text-${btn.color}-500/60 font-bold uppercase mt-1 tracking-tighter`}>{btn.time}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-[92px]"></div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-100">Biblioteca de Cartões ({palace.flashcards?.length || 0})</h3>
            <button onClick={handleGenerate} disabled={isGenerating} className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-6 py-3 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              {isGenerating ? 'Gerando...' : '+ Adicionar Novos'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {palace.flashcards.map((card) => (
              <div key={card.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-lg hover:border-slate-700 transition-all relative group">
                <div className="flex-1 space-y-5">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pergunta</span>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed">{card.question}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Resposta</span>
                    <p className="text-sm text-slate-400 leading-relaxed">{card.answer}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">🔗</span> Mnemônico Visual
                      </span>
                      <button 
                        onClick={() => generateMnemonic(card.id)}
                        disabled={isGeneratingMnemonicId === card.id}
                        className="text-[9px] font-black text-slate-500 hover:text-amber-500 uppercase tracking-widest transition-colors"
                      >
                        {isGeneratingMnemonicId === card.id ? 'Materializando...' : 'Auto-Gerar ✨'}
                      </button>
                    </div>
                    <textarea 
                      value={card.mnemonic || ''}
                      onChange={(e) => updateMnemonicManual(card.id, e.target.value)}
                      placeholder="Sem mnemônico. Clique em 'Auto-Gerar' para criar uma cena visual bizarra..."
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-400 italic resize-none focus:outline-none focus:border-amber-500/30 transition-all min-h-[80px] shadow-inner"
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex gap-6">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">SRS Intervalo</span>
                        <span className="text-[10px] font-bold text-slate-400">{card.interval}d</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Ease Factor</span>
                        <span className="text-[10px] font-bold text-slate-400">{card.easeFactor.toFixed(2)}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => onUpdatePalace({ ...palace, flashcards: palace.flashcards.filter(c => c.id !== card.id) })}
                    className="text-slate-600 hover:text-red-500 transition-colors p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {palace.flashcards.length === 0 && (
            <div className="py-24 text-center bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[3.5rem]">
              <div className="text-5xl opacity-20 mb-4">🎴</div>
              <p className="text-slate-500 italic max-w-xs mx-auto">Sua biblioteca está vazia. Gere flashcards automáticos clicando no botão acima.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
