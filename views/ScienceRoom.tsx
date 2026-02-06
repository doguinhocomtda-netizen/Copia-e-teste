
import React from 'react';
import { SCIENCE_TIPS, MEMORY_TECHNIQUES, MNEMONIC_CHECKLIST } from '../constants';

export const ScienceRoom: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-fadeIn pb-20">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Ciência da Aprendizagem</h2>
        <p className="text-slate-400 text-lg">
          O "Pulo do Gato": O cérebro retém informações ancoradas em conhecimentos pré-existentes.
        </p>
      </header>

      {/* Seção 1: O Princípio da Elaboração */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-amber-500 flex items-center">
          <span className="mr-3">🧠</span> 1. O Princípio da Elaboração
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCIENCE_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-amber-500/30 transition-all">
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h4 className="font-bold mb-2 text-slate-100">{tip.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{tip.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 2: Ranking de Técnicas */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-amber-500 flex items-center">
          <span className="mr-3">📊</span> 2. Técnicas (Rankeadas por Eficácia)
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Técnica</th>
                  <th className="px-6 py-4">Melhor Uso</th>
                  <th className="px-6 py-4">Como Fazer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {MEMORY_TECHNIQUES.map((tech, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-amber-400 flex items-center">
                      <span className="mr-2">{tech.icon}</span> {tech.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{tech.use}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs leading-relaxed">{tech.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Seção 3: Checklist Científico */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-amber-500 flex items-center">
          <span className="mr-3">✅</span> 3. Checklist para um Mnemônico Forte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MNEMONIC_CHECKLIST.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 font-black">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm mb-1">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="p-8 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] text-center">
        <h3 className="text-xl font-bold mb-3 text-amber-500">Nota Crítica</h3>
        <p className="text-slate-400 text-sm italic max-w-2xl mx-auto leading-relaxed">
          "Mnemônicos ajudam na recuperação da informação, mas não substituem a compreensão. 
          Certifique-se de entender a lógica do conteúdo antes de ancorá-lo visualmente."
        </p>
      </div>
    </div>
  );
};
