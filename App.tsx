import React, { useState, useEffect, useCallback } from 'react';
import { ConceptManager } from './components/ConceptManager.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { GeneratorView } from './components/GeneratorView.tsx';
import { StudyView } from './components/StudyView.tsx';
import { Play, ConceptLibrary, ConceptDefinition, AppMode } from './types.ts';
import { generatePlay } from './services/playbookService.ts';
import { CONCEPT_ROUTES, ROUTE_LIBRARY } from './constants.ts';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('mainMenu');
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [conceptLibrary, setConceptLibrary] = useState<ConceptLibrary>(() => {
    try {
      const savedConcepts = localStorage.getItem('footballConcepts');
      return savedConcepts ? JSON.parse(savedConcepts) : CONCEPT_ROUTES;
    } catch (error) {
      console.error("Failed to load concepts from localStorage", error);
      return CONCEPT_ROUTES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('footballConcepts', JSON.stringify(conceptLibrary));
    } catch (error) {
      console.error("Failed to save concepts to localStorage", error);
    }
  }, [conceptLibrary]);

  const handleOpenManagerClick = () => {
    setPasswordInput(''); // Reset input on open
    setPasswordError('');   // Reset error on open
    setIsPasswordPromptOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'coach') {
        setIsManagerOpen(true);
        setIsPasswordPromptOpen(false);
    } else {
        setPasswordError('Incorrect password. Please try again.');
    }
  };


  const handleAddConcept = (name: string, concept: ConceptDefinition) => {
    if (!name.trim()) {
        alert('Concept name cannot be empty.');
        return;
    }
    if (conceptLibrary[name]) {
        alert(`Concept name "${name}" already exists!`);
        return;
    }
    const newLibrary = { ...conceptLibrary, [name]: concept };
    setConceptLibrary(newLibrary);
    alert(`Concept "${name}" added successfully!`);
  };

  const handleDeleteConcept = (name: string) => {
      if (window.confirm(`Are you sure you want to delete the concept "${name}"? This cannot be undone.`)) {
          const newLibrary = { ...conceptLibrary };
          delete newLibrary[name];
          setConceptLibrary(newLibrary);
      }
  };

  const renderContent = () => {
    switch (appMode) {
      case 'generator':
        return <GeneratorView conceptLibrary={conceptLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="both" />;
      case 'quizDiagram':
        return <GeneratorView conceptLibrary={conceptLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="playcallOnly" />;
       case 'quizPlaycall':
        return <GeneratorView conceptLibrary={conceptLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="diagramOnly" />;
      case 'study':
        return <StudyView conceptLibrary={conceptLibrary} routeLibrary={ROUTE_LIBRARY} onBackToMenu={() => setAppMode('mainMenu')} />;
      case 'mainMenu':
      default:
        return <MainMenu onModeSelect={setAppMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-800 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {renderContent()}
      
      {isPasswordPromptOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Password</h2>
            <p className="text-gray-600 mb-6">Access to the Concept Manager is restricted.</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 mb-2 transition-colors"
                placeholder="Password..."
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsPasswordPromptOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-md hover:shadow-lg">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConceptManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        concepts={conceptLibrary}
        allRoutes={Object.keys(ROUTE_LIBRARY)}
        onAddConcept={handleAddConcept}
        onDeleteConcept={handleDeleteConcept}
      />
    </div>
  );
};

export default App;