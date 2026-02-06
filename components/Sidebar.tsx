
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Meus Palácios', icon: '🏛️' },
    { id: AppView.FLASHCARDS, label: 'Revisão (SRS)', icon: '🔄' },
    { id: AppView.TESTS, label: 'Arena de Erros', icon: '🏟️' },
    { id: AppView.PERFORMANCE, label: 'Dashboard Mestre', icon: '📉' },
    { id: AppView.CREATE, label: 'Novo Domínio', icon: '✨' },
    { id: AppView.SCIENCE, label: 'Neurociência', icon: '🧠' },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 h-screen flex flex-col fixed left-0 top-0 z-40 hidden md:flex">
      <div className="p-8 flex-1">
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-10 tracking-tighter">MNEMÓSINE PRO</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all relative group ${
                currentView === item.id 
                  ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
              {currentView === item.id && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-8 border-t border-slate-900">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Cognitivo</div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-2/3 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
          </div>
          <div className="text-[9px] text-amber-500/60 mt-2 font-bold">Foco: Alta Performance</div>
        </div>
      </div>
    </aside>
  );
};
