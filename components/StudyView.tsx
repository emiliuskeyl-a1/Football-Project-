
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
  const [selectedFormation, setSelectedFormation] = useState<string>('Spread');

  const sortedRoutes = useMemo(() => Object.keys(routeLibrary).sort(), [routeLibrary]);
  const sortedConcepts = useMemo(() => Object.keys(conceptLibrary).sort(), [conceptLibrary]);
  const sortedMotions = useMemo(() => Object.keys(motionLibrary).sort(), [motionLibrary]);

  // Set default selection when mode changes
  React.useEffect(() => {
    if (studyMode === 'routes') {
      setSelectedItem(sortedRoutes[0] || '');
    } else if (studyMode === 'concepts') {
      const firstConcept = sortedConcepts[0] || '';
      setSelectedItem(firstConcept);
      // Default formation for first concept
      if (firstConcept && conceptLibrary[firstConcept]?.compatibleFormations?.length) {
          setSelectedFormation(conceptLibrary[firstConcept].compatibleFormations![0]);
      } else {
          setSelectedFormation('Spread');
      }
    } else {
      setSelectedItem(sortedMotions[0] || '');
    }
  }, [studyMode, sortedRoutes, sortedConcepts, sortedMotions, conceptLibrary]);

  // Update selected formation defaults when concept changes
  const handleConceptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const conceptName = e.target.value;
      setSelectedItem(conceptName);
      if (studyMode === 'concepts') {
          const concept = conceptLibrary[conceptName];
          if (concept && concept.compatibleFormations && concept.compatibleFormations.length > 0) {
              if (!concept.compatibleFormations.includes(selectedFormation)) {
                   setSelectedFormation(concept.compatibleFormations[0]);
              }
          }
      }
  }

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
      
      const formationName = selectedFormation;
      const assignments: Play['routes'] = {};

      const currentFormation = FORMATIONS[formationName] || FORMATIONS['Spread'];
      const receivers = Object.keys(currentFormation);
      
      // Separate receivers by side (Center is 50%)
      const rightReceivers = receivers.filter(r => currentFormation[r].x >= 50).sort((a,b) => currentFormation[b].x - currentFormation[a].x); // Descending (Outside-In)
      const leftReceivers = receivers.filter(r => currentFormation[r].x < 50).sort((a,b) => currentFormation[a].x - currentFormation[b].x); // Ascending (Outside-In)

      let targetReceivers: string[] = [];
      let isRightSide = true;

      // Logic to determine which receivers to highlight based on Concept Category and Formation
      if (concept.category === 'full') {
          // Flatten both sides, but maintain order. Left -> Right usually, but for assignment we usually go Left Out -> Right Out or similar.
          // For visualization simplicity, let's just map 0..3 to whatever 4 receivers we have.
          // BUT, to look nice, we try to grab the 4 widest.
          const allRecs = [...leftReceivers, ...rightReceivers];
          // Simple assignment
          targetReceivers = allRecs;
      } else if (concept.category === 'three') {
          // Prioritize the side with 3 receivers (Trips)
          if (rightReceivers.length >= 3) {
              targetReceivers = rightReceivers.slice(0, 3);
              isRightSide = true;
          } else if (leftReceivers.length >= 3) {
              targetReceivers = leftReceivers.slice(0, 3);
              isRightSide = false;
          } else {
              // Fallback if no 3x1 side exists (e.g. Spread 2x2), just show on right side if possible or mix
               targetReceivers = rightReceivers.concat(leftReceivers).slice(0, 3);
          }
      } else if (concept.category === 'two') {
          // Prioritize Right side default
          if (rightReceivers.length >= 2) {
              targetReceivers = rightReceivers.slice(0, 2);
              isRightSide = true;
          } else if (leftReceivers.length >= 2) {
              targetReceivers = leftReceivers.slice(0, 2);
              isRightSide = false;
          } else {
              targetReceivers = [rightReceivers[0], leftReceivers[0]].filter(Boolean);
          }
      } else {
          // One receiver (ISO)
           targetReceivers = [rightReceivers[0] || leftReceivers[0]];
      }

      concept.routes.forEach((routeName, i) => {
          if (i < targetReceivers.length) {
            const receiver = targetReceivers[i];
            if (receiver && routeName && routeLibrary[routeName]) {
                let path = routeLibrary[routeName];
                const recPos = currentFormation[receiver];
                // Mirror if receiver is on the left OR if we determined the concept is applied to the left side 
                // (Checking actual position is safer)
                if (recPos.x < 50) {
                    path = getMirroredPath(path);
                }
                assignments[receiver] = { routeName, path };
            }
          }
      });
      
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
  }, [selectedItem, studyMode, routeLibrary, conceptLibrary, motionLibrary, selectedFormation]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(e.target.value);
  };
  
  const options = studyMode === 'routes' ? sortedRoutes : studyMode === 'concepts' ? sortedConcepts : sortedMotions;
  
  const availableFormations = useMemo(() => {
      if (studyMode !== 'concepts' || !selectedItem) return [];
      const concept = conceptLibrary[selectedItem];
      if (concept?.compatibleFormations && concept.compatibleFormations.length > 0) {
          return concept.compatibleFormations;
      }
      return Object.keys(FORMATIONS);
  }, [studyMode, selectedItem, conceptLibrary]);

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
        <div className="w-full md:w-3/4 bg-gray-900 p-3 rounded-lg mb-4 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1 w-full">
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
          <div className="flex-1 w-full flex space-x-2">
            <select
                value={selectedItem}
                onChange={handleConceptChange}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            >
                {options.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
             {studyMode === 'concepts' && (
                <select
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.target.value)}
                    className="w-1/3 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    title="Select Formation for Diagram"
                >
                    {availableFormations.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                </select>
            )}
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
