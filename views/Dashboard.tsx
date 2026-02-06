
import React from 'react';
import { Palace, TestResult } from '../types';

interface DashboardProps {
  palaces: Palace[];
  testHistory: TestResult[];
  onDelete: (id: string) => void;
  onStudy: (palace: Palace) => void;
  onCreate: () => void;
  onOpenTests: () => void;
  onOpenPerformance: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ palaces, testHistory, onDelete, onStudy, onCreate, onOpenTests, onOpenPerformance }) => {
  const getDueCount = (palace: Palace) => {
    const now = Date.now();
    return (palace.flashcards || []).filter(c => !c.nextReview || c.nextReview <= now).length;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold mb-2">Mnemósine</h2>
          <p className="text-slate-400 max-w-lg">Seu santuário de memória e alta performance.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenPerformance} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-full font-bold transition-all border border-slate-700">📈 Stats</button>
          <button onClick={onOpenTests} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-full font-bold transition-all border border-slate-700">🏟️ Arena</button>
          <button onClick={onCreate} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-amber-500/20">+ Criar</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palaces.map((palace) => {
          const dueCount = getDueCount(palace);
          return (
            <div key={palace.id} className="group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-amber-500/50 transition-all shadow-xl">
              <div className="aspect-video relative overflow-hidden">
                <img src={palace.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {dueCount > 0 && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg">
                    {dueCount} REVISÕES
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{palace.title}</h3>
                <p className="text-slate-500 text-sm mb-4 truncate">{palace.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{palace.loci.filter(l => l.concept).length} conceitos</span>
                  <div className="flex gap-2">
                    <button onClick={() => onDelete(palace.id)} className="text-slate-600 hover:text-red-500 transition-colors">🗑️</button>
                    <button onClick={() => onStudy(palace)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors">Estudar</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {palaces.length === 0 && (
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
          <div className="text-6xl mb-6 opacity-20">🏛️</div>
          <h3 className="text-2xl font-bold mb-3">Nenhum Palácio Encontrado</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Transforme seus estudos em locais físicos memoráveis agora mesmo.</p>
          <button 
            onClick={onCreate}
            className="text-amber-500 font-black uppercase tracking-widest hover:text-amber-400 transition-all"
          >
            Começar Jornada →
          </button>
        </div>
      )}
    </div>
  );
};
