
import React from 'react';
import { TestResult, Palace } from '../types';

interface PerformanceViewProps {
  history: TestResult[];
  palaces: Palace[];
  onBack: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ history, palaces, onBack }) => {
  const avgScore = history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
  const totalLoci = palaces.reduce((a, b) => a + b.loci.filter(l => l.concept).length, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <header className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-400 hover:text-white font-bold">← Voltar</button>
        <h2 className="text-4xl font-bold">Seu Desempenho</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Média de Acertos</div>
          <div className="text-4xl font-black text-amber-500">{avgScore}%</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Conceitos Mapeados</div>
          <div className="text-4xl font-black text-amber-500">{totalLoci}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Testes Realizados</div>
          <div className="text-4xl font-black text-amber-500">{history.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold">Histórico Recente</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
          {history.length === 0 ? (
            <div className="p-10 text-center text-slate-500">Nenhum teste registrado ainda.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Itens</th>
                  <th className="px-6 py-4">Tempo</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((res) => (
                  <tr key={res.id} className="text-sm">
                    <td className="px-6 py-4 text-slate-500">{new Date(res.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">{res.type}</td>
                    <td className="px-6 py-4">{res.itemCount}</td>
                    <td className="px-6 py-4">{res.timeTaken}s</td>
                    <td className={`px-6 py-4 font-bold ${res.score >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{res.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
