
import React, { useState, useEffect } from 'react';
import { generateTestItems } from '../services/geminiService';
import { TestResult } from '../types';

interface TestsViewProps {
  onSaveResult: (res: TestResult) => void;
  onBack: () => void;
}

export const TestsView: React.FC<TestsViewProps> = ({ onSaveResult, onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'memo' | 'test' | 'result'>('setup');
  const [type, setType] = useState<'words' | 'numbers'>('words');
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let interval: any;
    if (phase === 'memo') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const startTest = async () => {
    setIsGenerating(true);
    try {
      const data = await generateTestItems(type, count);
      setItems(data);
      setUserInputs(new Array(count).fill(''));
      setTimer(0);
      setPhase('memo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishMemo = () => setPhase('test');

  const handleSubmitTest = () => {
    let correct = 0;
    items.forEach((item, idx) => {
      if (item.toLowerCase().trim() === userInputs[idx].toLowerCase().trim()) correct++;
    });
    const score = (correct / count) * 100;
    const result: TestResult = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      itemCount: count,
      timeTaken: timer,
      score,
      date: Date.now()
    };
    onSaveResult(result);
    setPhase('result');
  };

  const isCorrect = (index: number) => {
    return items[index].toLowerCase().trim() === userInputs[index].toLowerCase().trim();
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-bold transition-colors">← Menu</button>
        <h2 className="text-3xl font-bold">Arena de Memória</h2>
      </header>

      {phase === 'setup' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-6 shadow-xl">
          <h3 className="text-xl font-bold">Configurar Desafio</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setType('words')} 
              className={`p-4 rounded-xl border transition-all ${type === 'words' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}
            >
              Palavras
            </button>
            <button 
              onClick={() => setType('numbers')} 
              className={`p-4 rounded-xl border transition-all ${type === 'numbers' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}
            >
              Números
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Quantidade de Itens</label>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))} 
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
            />
            <div className="text-center font-bold text-amber-500 mt-2">{count} itens</div>
          </div>
          <button 
            onClick={startTest} 
            disabled={isGenerating} 
            className="w-full py-4 bg-amber-500 text-slate-950 font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isGenerating ? 'Preparando...' : 'Iniciar Memorização'}
          </button>
        </div>
      )}

      {phase === 'memo' && (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="text-4xl font-mono text-amber-500 font-bold bg-slate-900/50 py-4 rounded-2xl border border-slate-800 inline-block px-8">
            {Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] grid grid-cols-2 md:grid-cols-3 gap-4 shadow-xl">
            {items.map((it, i) => <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm font-bold text-slate-200">{it}</div>)}
          </div>
          <button 
            onClick={handleFinishMemo} 
            className="bg-amber-500 text-slate-950 px-10 py-4 rounded-2xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Pronto para o Teste
          </button>
        </div>
      )}

      {phase === 'test' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-center text-slate-200 uppercase tracking-widest">O que você memorizou?</h3>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-3 shadow-xl max-h-[60vh] overflow-y-auto custom-scrollbar">
            {items.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-500 font-mono w-6 text-right text-xs">{i+1}.</span>
                <input 
                  type="text" 
                  autoFocus={i === 0}
                  value={userInputs[i]} 
                  onChange={(e) => {
                    const next = [...userInputs]; 
                    next[i] = e.target.value; 
                    setUserInputs(next);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none focus:border-amber-500 text-slate-100 transition-all"
                  placeholder={`Item ${i+1}`}
                />
              </div>
            ))}
          </div>
          <button 
            onClick={handleSubmitTest} 
            className="w-full bg-amber-500 text-slate-950 py-4 rounded-2xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest"
          >
            Verificar Resultados
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-6 animate-fadeIn pb-10">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2rem] text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className={`text-7xl font-black ${items.every((it, i) => it.toLowerCase() === userInputs[i].toLowerCase()) ? 'text-green-500' : 'text-amber-500'}`}>
              {Math.round((items.filter((it, i) => it.toLowerCase().trim() === userInputs[i].toLowerCase().trim()).length / count) * 100)}%
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Tempo de memorização: <strong className="text-slate-200">{timer} segundos</strong></p>
              <p className="text-slate-400 text-sm">Itens corretos: <strong className="text-slate-200">{items.filter((it, i) => it.toLowerCase().trim() === userInputs[i].toLowerCase().trim()).length} / {count}</strong></p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-slate-200">Revisão Detalhada</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Compare sua memória com o gabarito</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Original</th>
                    <th className="px-6 py-3">Sua Resposta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {items.map((item, idx) => {
                    const correct = isCorrect(idx);
                    return (
                      <tr key={idx} className={`text-sm ${correct ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{item}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={correct ? 'text-green-400' : 'text-red-400'}>
                              {userInputs[idx] || <span className="italic opacity-30">Vazio</span>}
                            </span>
                            {correct ? (
                              <span className="text-green-500 text-xs">✓</span>
                            ) : (
                              <span className="text-red-500 text-xs">✗</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setPhase('setup');
                setItems([]);
                setUserInputs([]);
              }} 
              className="bg-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
            >
              Novo Desafio
            </button>
            <button 
              onClick={onBack} 
              className="bg-amber-500 text-slate-950 py-4 rounded-2xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Menu Inicial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
