import React, { useState, useMemo } from 'react';
import { PlayDiagram } from './PlayDiagram';
import { Play, ConceptLibrary, RouteLibrary, RoutePath, MotionLibrary } from '../types';
import { FORMATIONS } from '../constants';

interface StudyViewProps {
  conceptLibrary: ConceptLibrary;
  routeLibrary: RouteLibrary;
  motionLibrary: MotionLibrary;
  onBackToMenu: () => void;
}

type StudyMode = 'routes' | 'concepts' | 'motions';

const getMirroredPath = (path: RoutePath): RoutePath => {
    return path.map(point => ({ x: -point.x, y: point.y }));
};

export const StudyView: React.FC<StudyViewProps> = ({ conceptLibrary, routeLibrary, motionLibrary, onBackToMenu }) => {
  const [studyMode, setStudyMode] = useState<StudyMode>('routes');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const sortedRoutes = useMemo(() => Object.keys(routeLibrary).sort(), [routeLibrary]);
  const sortedConcepts = useMemo(() => Object.keys(conceptLibrary).sort(), [conceptLibrary]);
  const sortedMotions = useMemo(() => Object.keys(motionLibrary).sort(), [motionLibrary]);

  // Set default selection when mode changes
  React.useEffect(() => {
    if (studyMode === 'routes') {
      setSelectedItem(sortedRoutes[0] || '');
    } else if (studyMode === 'concepts') {
      setSelectedItem(sortedConcepts[0] || '');
    } else {
      setSelectedItem(sortedMotions[0] || '');
    }
  }, [studyMode, sortedRoutes, sortedConcepts, sortedMotions]);

  const studyPlay: Play | null = useMemo(() => {
    if (!selectedItem) return null;

    if (studyMode === 'routes') {
      const path = routeLibrary[selectedItem];
      if (!path) return null;
      return {
        playcall: `Route: ${selectedItem}`,
        formationName: 'Spread', // Use a default formation for display
        routes: {
          'Z': { routeName: selectedItem, path: path }
        },
        motions: [],
      };
    }

    if (studyMode === 'concepts') {
      const concept = conceptLibrary[selectedItem];
      if (!concept) return null;
      
      let formationName = 'Spread';
      const assignments: Play['routes'] = {};

      if (concept.category === 'three') {
        formationName = 'Tri';
        const triReceivers = ['Z', 'H', 'S']; // The 3 receivers on the right in Tri, ordered right-to-left
        concept.routes.forEach((routeName, i) => {
            const receiver = triReceivers[i];
            if (receiver && routeName && routeLibrary[routeName]) {
                // All receivers are on the right, so no mirroring needed.
                assignments[receiver] = { routeName, path: routeLibrary[routeName] };
            }
        });
      } else {
        // Default logic for 1, 2, and 4 receiver concepts using Spread
        formationName = 'Spread';
        const spreadReceivers = ['Z', 'H', 'S', 'W']; // Right to left
        concept.routes.forEach((routeName, i) => {
            const receiver = spreadReceivers[i];
            if (receiver && routeName && routeLibrary[routeName]) {
                let path = routeLibrary[routeName];
                // Mirror for left-side receivers (S and W)
                if (receiver === 'S' || receiver === 'W') {
                    path = getMirroredPath(path);
                }
                assignments[receiver] = { routeName, path };
            }
        });
      }
      
      return {
        playcall: `Concept: ${selectedItem}`,
        formationName: formationName,
        routes: assignments,
        motions: [],
      };
    }

    if (studyMode === 'motions') {
        const motion = motionLibrary[selectedItem];
        if (!motion) return null;

        return {
            playcall: `Motion: ${selectedItem}`,
            formationName: 'Spread',
            routes: {},
            motions: [{
                receiver: motion.receiver,
                motionName: selectedItem,
                path: motion.path
            }]
        }
    }

    return null;
  }, [selectedItem, studyMode, routeLibrary, conceptLibrary, motionLibrary]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(e.target.value);
  };
  
  const options = studyMode === 'routes' ? sortedRoutes : studyMode === 'concepts' ? sortedConcepts : sortedMotions;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <header className="w-full max-w-5xl text-center mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          <div className="w-1/3 flex justify-start">
            <button onClick={onBackToMenu} className="bg-gray-700 hover:bg-gray-600 text-yellow-300 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">
              &larr; Main Menu
            </button>
          </div>
          <div className="w-1/3">
            <h1 className="text-3xl md:text-5xl font-bold text-blue-400 tracking-wider">
              Study Room
            </h1>
          </div>
          <div className="w-1/3"></div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="w-full md:w-2/3 lg:w-1/2 bg-gray-900 p-3 rounded-lg mb-4 flex items-center space-x-4">
          <div className="flex-1">
             <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                <button onClick={() => setStudyMode('routes')} className={`w-full py-2 rounded-md text-sm font-bold transition-colors ${studyMode === 'routes' ? 'bg-blue-500 text-white' : 'text-white hover:bg-gray-600'}`}>
                    Routes
                </button>
                <button onClick={() => setStudyMode('concepts')} className={`w-full py-2 rounded-md text-sm font-bold transition-colors ${studyMode === 'concepts' ? 'bg-blue-500 text-white' : 'text-white hover:bg-gray-600'}`}>
                    Concepts
                </button>
                 <button onClick={() => setStudyMode('motions')} className={`w-full py-2 rounded-md text-sm font-bold transition-colors ${studyMode === 'motions' ? 'bg-blue-500 text-white' : 'text-white hover:bg-gray-600'}`}>
                    Motions
                </button>
             </div>
          </div>
          <div className="flex-1">
            <select
                value={selectedItem}
                onChange={handleSelectionChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 h-full"
            >
                {options.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="w-full flex-grow aspect-[16/10] md:aspect-[16/9] relative">
          {studyPlay ? (
            <PlayDiagram play={studyPlay} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <p>Select an item to view.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};