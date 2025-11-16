import React, { useState, useMemo } from 'react';
import { PlayDiagram } from './PlayDiagram.tsx';
import { Play, ConceptLibrary, RouteLibrary } from '../types.ts';
import { FORMATIONS } from '../constants.ts';

interface StudyViewProps {
  conceptLibrary: ConceptLibrary;
  routeLibrary: RouteLibrary;
  onBackToMenu: () => void;
}

type StudyMode = 'routes' | 'concepts';

export const StudyView: React.FC<StudyViewProps> = ({ conceptLibrary, routeLibrary, onBackToMenu }) => {
  const [studyMode, setStudyMode] = useState<StudyMode>('routes');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const sortedRoutes = useMemo(() => Object.keys(routeLibrary).sort(), [routeLibrary]);
  const sortedConcepts = useMemo(() => Object.keys(conceptLibrary).sort(), [conceptLibrary]);

  React.useEffect(() => {
    setSelectedItem(studyMode === 'routes' ? sortedRoutes[0] || '' : sortedConcepts[0] || '');
  }, [studyMode, sortedRoutes, sortedConcepts]);

  const studyPlay: Play | null = useMemo(() => {
    if (!selectedItem) return null;

    if (studyMode === 'routes') {
      const path = routeLibrary[selectedItem];
      if (!path) return null;
      return {
        playcall: `Route: ${selectedItem}`,
        formationName: 'Spread',
        routes: { 'Z': { routeName: selectedItem, path: path } }
      };
    }

    if (studyMode === 'concepts') {
      const concept = conceptLibrary[selectedItem];
      if (!concept) return null;
      
      const formation = FORMATIONS['Spread'];
      // Use the number of routes defined in the concept to determine receivers
      const numReceivers = concept.routes.length;
      const receivers = ['Z', 'H', 'S', 'W'].slice(0, numReceivers); 
      const assignments: Play['routes'] = {};
      
      receivers.forEach((receiver, i) => {
        const routeName = concept.routes[i];
        if (routeName && routeLibrary[routeName]) {
          // Display all routes as if on the right side for simplicity
          assignments[receiver] = { routeName, path: routeLibrary[routeName] };
        }
      });
      
      return {
        playcall: `Concept: ${selectedItem}`,
        formationName: 'Spread',
        routes: assignments
      };
    }
    return null;
  }, [selectedItem, studyMode, routeLibrary, conceptLibrary]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(e.target.value);
  };
  
  const options = studyMode === 'routes' ? sortedRoutes : sortedConcepts;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col" style={{height: 'calc(100vh - 2rem)'}}>
       <header className="w-full text-center mb-4 flex justify-between items-center flex-shrink-0">
         <button onClick={onBackToMenu} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            &larr; Menu
         </button>
         <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Study Room
        </h1>
        <div className="w-24"></div>
      </header>

      <main className="w-full flex-grow flex flex-col items-center bg-gray-50 rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="w-full max-w-lg bg-gray-100 p-2 rounded-xl mb-4 flex items-center space-x-2 border border-gray-200">
           <div className="flex-1">
             <div className="flex space-x-1 bg-gray-300 rounded-lg p-1">
                <button onClick={() => setStudyMode('routes')} className={`w-full py-2 rounded-md text-sm font-bold transition-all ${studyMode === 'routes' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    Routes
                </button>
                <button onClick={() => setStudyMode('concepts')} className={`w-full py-2 rounded-md text-sm font-bold transition-all ${studyMode === 'concepts' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    Concepts
                </button>
             </div>
          </div>
          <div className="flex-1">
            <select
                value={selectedItem}
                onChange={handleSelectionChange}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 h-full transition-colors"
            >
                {options.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="w-full flex-grow relative">
          {studyPlay ? (
            <PlayDiagram play={studyPlay} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Select an item to view.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};