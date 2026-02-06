
import React, { useState } from 'react';
import { generatePalaceImage, extractLociFromImage } from '../services/geminiService';
import { Palace, Locus } from '../types';
import { PLACEHOLDER_PALACES } from '../constants';

interface CreatorProps {
  onSave: (palace: Palace) => void;
}

export const Creator: React.FC<CreatorProps> = ({ onSave }) => {
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleGenerate = async () => {
    if (!theme || !description) {
      alert("Por favor, preencha o tema e a descrição.");
      return;
    }

    setIsGenerating(true);
    setLoadingStep('Materializando arquitetura visual...');
    
    try {
      // 1. Generate the visual palace first
      const imageUrl = await generatePalaceImage(description);
      
      // 2. Use vision to see what's actually in the generated image
      setLoadingStep('Escaneando imagem para identificar Lóci reais...');
      const objects = await extractLociFromImage(imageUrl);
      
      const newLoci: Locus[] = objects.map((obj) => ({
        id: Math.random().toString(36).substr(2, 9),
        objectName: obj,
        concept: ''
      }));

      const newPalace: Palace = {
        id: Math.random().toString(36).substr(2, 9),
        title: theme,
        theme: theme.split(' ')[0] || 'Estudos',
        description: description,
        imageUrl: imageUrl,
        loci: newLoci,
        flashcards: [],
        createdAt: Date.now(),
        nextReview: Date.now() + (24 * 60 * 60 * 1000),
        reviewLevel: 0
      };

      onSave(newPalace);
    } catch (error) {
      console.error(error);
      alert("Erro na geração. Tente descrever um ambiente mais específico.");
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const useRandomPrompt = () => {
    const random = PLACEHOLDER_PALACES[Math.floor(Math.random() * PLACEHOLDER_PALACES.length)];
    setDescription(random);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Novo Domínio Mental</h2>
        <p className="text-slate-400 text-lg">
          Onde o conhecimento abstrato ganha forma física.
        </p>
      </div>

      <div className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]"></div>
            <h3 className="text-xl font-bold text-white mb-2">{loadingStep}</h3>
            <p className="text-slate-400 text-sm animate-pulse">A IA está processando complexidades espaciais...</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">O que você vai estudar?</label>
          <input 
            type="text" 
            placeholder="Ex: Direito Penal, Verbos Irregulares, Anatomia..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all text-lg"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descreva o Palácio da Memória</label>
          <textarea 
            rows={4}
            placeholder="Ex: Uma catedral gótica submersa com vitrais de luz roxa e estátuas de bronze..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-between mt-3">
            <button 
              type="button"
              onClick={useRandomPrompt}
              className="text-amber-500 text-xs font-bold hover:text-amber-400 transition-colors uppercase tracking-tighter"
            >
              🎲 Sugestão de Ambiente
            </button>
            <span className="text-[10px] text-slate-600 font-medium">Use detalhes como texturas, cores e objetos específicos.</span>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-5 rounded-2xl font-black text-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] uppercase tracking-widest"
        >
          Materializar Estrutura
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🏛️', title: 'Concreto', desc: 'Evite o vago. Prefira "escrivaninha de mogno" a "móveis".' },
          { icon: '🗺️', title: 'Lógico', desc: 'A imagem servirá como mapa visual fixo para suas revisões.' },
          { icon: '🕯️', title: 'Vívido', desc: 'Cores e luzes fortes ajudam o cérebro a criar âncoras.' }
        ].map((item, i) => (
          <div key={i} className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h4 className="font-bold text-amber-500 text-sm mb-1 uppercase">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
