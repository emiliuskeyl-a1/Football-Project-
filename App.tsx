
import React, { useState, useEffect, useCallback } from 'react';
import { ConceptManager } from './components/ConceptManager';
import { MainMenu } from './components/MainMenu';
import { GeneratorView } from './components/GeneratorView';
import { StudyView } from './components/StudyView';
import { Play, ConceptLibrary, ConceptDefinition, AppMode, MotionLibrary, RoutePath, RouteLibrary, ProtectionLibrary, ProtectionDefinition } from './types';
import { generatePlay } from './services/playbookService';
import { DEFAULT_CONCEPT_LIBRARY, DEFAULT_ROUTE_LIBRARY, DEFAULT_MOTION_LIBRARY, DEFAULT_PROTECTION_LIBRARY } from './constants';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('mainMenu');
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [conceptLibrary, setConceptLibrary] = useState<ConceptLibrary>(() => {
    try {
      const saved = localStorage.getItem('footballConcepts');
      return saved ? JSON.parse(saved) : DEFAULT_CONCEPT_LIBRARY;
    } catch (error) {
      console.error("Failed to load concepts from localStorage", error);
      return DEFAULT_CONCEPT_LIBRARY;
    }
  });

  const [motionLibrary, setMotionLibrary] = useState<MotionLibrary>(() => {
    try {
      const saved = localStorage.getItem('footballMotions');
      return saved ? JSON.parse(saved) : DEFAULT_MOTION_LIBRARY;
    } catch (error) {
      console.error("Failed to load motions from localStorage", error);
      return DEFAULT_MOTION_LIBRARY;
    }
  });

  const [routeLibrary, setRouteLibrary] = useState<RouteLibrary>(() => {
    try {
      const saved = localStorage.getItem('footballRoutes');
      return saved ? JSON.parse(saved) : DEFAULT_ROUTE_LIBRARY;
    } catch (error) {
      console.error("Failed to load routes from localStorage", error);
      return DEFAULT_ROUTE_LIBRARY;
    }
  });

  const [protectionLibrary, setProtectionLibrary] = useState<ProtectionLibrary>(() => {
    try {
      const saved = localStorage.getItem('footballProtections');
      return saved ? JSON.parse(saved) : DEFAULT_PROTECTION_LIBRARY;
    } catch (error) {
      console.error("Failed to load protections from localStorage", error);
      return DEFAULT_PROTECTION_LIBRARY;
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('footballConcepts', JSON.stringify(conceptLibrary));
    } catch (error) {
      console.error("Failed to save concepts to localStorage", error);
    }
  }, [conceptLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem('footballMotions', JSON.stringify(motionLibrary));
    } catch (error) {
      console.error("Failed to save motions to localStorage", error);
    }
  }, [motionLibrary]);

   useEffect(() => {
    try {
      localStorage.setItem('footballRoutes', JSON.stringify(routeLibrary));
    } catch (error) {
      console.error("Failed to save routes to localStorage", error);
    }
  }, [routeLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem('footballProtections', JSON.stringify(protectionLibrary));
    } catch (error) {
      console.error("Failed to save protections to localStorage", error);
    }
  }, [protectionLibrary]);

  const handleOpenManagerClick = () => {
    setPasswordInput('');
    setPasswordError('');
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
    setConceptLibrary(prev => ({ ...prev, [name]: concept }));
    alert(`Concept "${name}" saved successfully!`);
  };

  const handleDeleteConcept = (name: string) => {
      setConceptLibrary(currentLibrary => {
        const { [name]: _, ...newLibrary } = currentLibrary;
        return newLibrary;
      });
  };

  const handleAddMotion = (name: string, path: RoutePath, receiver: string) => {
     if (!name.trim()) {
        alert('Motion name cannot be empty.');
        return;
    }
    setMotionLibrary(prev => ({ ...prev, [name]: { path, receiver } }));
    alert(`Motion "${name}" saved successfully!`);
  }

  const handleDeleteMotion = (name: string) => {
    setMotionLibrary(currentLibrary => {
        const { [name]: _, ...newLibrary } = currentLibrary;
        return newLibrary;
    });
  }

  const handleAddRoute = (name: string, path: RoutePath) => {
    if (!name.trim()) {
        alert('Route name cannot be empty.');
        return;
    }
    setRouteLibrary(prev => ({ ...prev, [name]: path }));
    alert(`Route "${name}" saved successfully!`);
  }

  const handleDeleteRoute = (name: string) => {
    setRouteLibrary(currentLibrary => {
        const { [name]: _, ...newLibrary } = currentLibrary;
        return newLibrary;
    });
  }

  const handleAddProtection = (name: string, protection: ProtectionDefinition) => {
    if (!name.trim()) {
        alert('Protection name cannot be empty.');
        return;
    }
    setProtectionLibrary(prev => ({ ...prev, [name]: protection }));
    alert(`Protection "${name}" saved successfully!`);
  }

  const handleDeleteProtection = (name: string) => {
    setProtectionLibrary(currentLibrary => {
        const { [name]: _, ...newLibrary } = currentLibrary;
        return newLibrary;
    });
  }


  const handleExportConfig = () => {
    try {
      const config = {
        concepts: conceptLibrary,
        motions: motionLibrary,
        routes: routeLibrary,
        protections: protectionLibrary,
      };
      const jsonString = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'playbook-config.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export config", error);
      alert("An error occurred while exporting the configuration.");
    }
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const config = JSON.parse(text);
        
        if (config && typeof config.concepts === 'object' && typeof config.motions === 'object' && typeof config.routes === 'object') {
            setConceptLibrary(config.concepts);
            setMotionLibrary(config.motions);
            setRouteLibrary(config.routes);
            if (config.protections) {
              setProtectionLibrary(config.protections);
            }
            alert("Configuration imported successfully!");
        } else {
          throw new Error("Invalid configuration file format.");
        }
      } catch (error) {
        console.error("Failed to import config", error);
        alert("Failed to import configuration. Please make sure it's a valid playbook file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };


  const renderContent = () => {
    switch (appMode) {
      case 'generator':
        return <GeneratorView conceptLibrary={conceptLibrary} motionLibrary={motionLibrary} routeLibrary={routeLibrary} protectionLibrary={protectionLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="both" />;
      case 'quizDiagram':
        return <GeneratorView conceptLibrary={conceptLibrary} motionLibrary={motionLibrary} routeLibrary={routeLibrary} protectionLibrary={protectionLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="playcallOnly" />;
       case 'quizPlaycall':
        return <GeneratorView conceptLibrary={conceptLibrary} motionLibrary={motionLibrary} routeLibrary={routeLibrary} protectionLibrary={protectionLibrary} onOpenManager={handleOpenManagerClick} onBackToMenu={() => setAppMode('mainMenu')} displayMode="diagramOnly" />;
      case 'study':
        return <StudyView conceptLibrary={conceptLibrary} routeLibrary={routeLibrary} motionLibrary={motionLibrary} onBackToMenu={() => setAppMode('mainMenu')} />;
      case 'mainMenu':
      default:
        return <MainMenu onModeSelect={setAppMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      {renderContent()}
      
      {isPasswordPromptOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-sm:w-full max-w-sm">
            <h2 className="text-xl font-bold text-yellow-300 mb-4">Enter Password</h2>
            <p className="text-gray-400 mb-4">Please enter the password to access the Playbook Manager.</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 mb-2"
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-sm mb-4">{passwordError}</p>}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setIsPasswordPromptOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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
        motions={motionLibrary}
        routes={routeLibrary}
        protections={protectionLibrary}
        onAddConcept={handleAddConcept}
        onDeleteConcept={handleDeleteConcept}
        onAddMotion={handleAddMotion}
        onDeleteMotion={handleDeleteMotion}
        onAddRoute={handleAddRoute}
        onDeleteRoute={handleDeleteRoute}
        onAddProtection={handleAddProtection}
        onDeleteProtection={handleDeleteProtection}
        onExport={handleExportConfig}
        onImport={handleImportConfig}
      />
    </div>
  );
};

export default App;
