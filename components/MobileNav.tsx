
import React from 'react';
import { AppView } from '../types';

interface MobileNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Início', icon: '🏛️' },
    { id: AppView.CREATE, label: 'Criar', icon: '✨' },
    { id: AppView.SCIENCE, label: 'Estudo', icon: '📚' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around items-center h-16 z-50 px-4">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center space-y-1 transition-colors ${
            currentView === item.id ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
