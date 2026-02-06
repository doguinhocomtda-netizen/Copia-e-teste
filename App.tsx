
import React, { useState, useEffect } from 'react';
import { AppView, Palace, TestResult } from './types';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './views/Dashboard';
import { Creator } from './views/Creator';
import { ScienceRoom } from './views/ScienceRoom';
import { StudyRoom } from './views/StudyRoom';
import { FlashcardsView } from './views/FlashcardsView';
import { TestsView } from './views/TestsView';
import { PerformanceView } from './views/PerformanceView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [selectedPalaceId, setSelectedPalaceId] = useState<string | null>(null);

  useEffect(() => {
    const savedPalaces = localStorage.getItem('mnemosine_palaces');
    const savedHistory = localStorage.getItem('mnemosine_history');
    if (savedPalaces) setPalaces(JSON.parse(savedPalaces));
    if (savedHistory) setTestHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('mnemosine_palaces', JSON.stringify(palaces));
    localStorage.setItem('mnemosine_history', JSON.stringify(testHistory));
  }, [palaces, testHistory]);

  const handleUpdatePalace = (updated: Palace) => {
    setPalaces(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addTestResult = (result: TestResult) => {
    setTestHistory(prev => [result, ...prev]);
  };

  const selectedPalace = palaces.find(p => p.id === selectedPalaceId) || null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              palaces={palaces} 
              testHistory={testHistory}
              onStudy={(p) => { setSelectedPalaceId(p.id); setCurrentView(AppView.STUDY); }}
              onDelete={(id) => setPalaces(prev => prev.filter(p => p.id !== id))}
              onCreate={() => setCurrentView(AppView.CREATE)}
              onOpenTests={() => setCurrentView(AppView.TESTS)}
              onOpenPerformance={() => setCurrentView(AppView.PERFORMANCE)}
            />
          )}
          {currentView === AppView.CREATE && (
            <Creator onSave={(p) => { setPalaces([p, ...palaces]); setCurrentView(AppView.DASHBOARD); }} />
          )}
          {currentView === AppView.STUDY && selectedPalace && (
            <StudyRoom 
              palace={selectedPalace} 
              onUpdate={handleUpdatePalace}
              onBack={() => setCurrentView(AppView.DASHBOARD)}
              onFlashcards={() => setCurrentView(AppView.FLASHCARDS)}
            />
          )}
          {currentView === AppView.FLASHCARDS && (
            <FlashcardsView 
              palace={selectedPalace}
              allPalaces={palaces}
              onSelectPalace={(p) => setSelectedPalaceId(p.id)}
              onUpdatePalace={handleUpdatePalace}
              onBack={() => setCurrentView(selectedPalace ? AppView.STUDY : AppView.DASHBOARD)}
            />
          )}
          {currentView === AppView.TESTS && (
            <TestsView onSaveResult={addTestResult} onBack={() => setCurrentView(AppView.DASHBOARD)} />
          )}
          {currentView === AppView.PERFORMANCE && (
            <PerformanceView history={testHistory} palaces={palaces} onBack={() => setCurrentView(AppView.DASHBOARD)} />
          )}
          {currentView === AppView.SCIENCE && <ScienceRoom />}
        </div>
      </main>
      <MobileNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
