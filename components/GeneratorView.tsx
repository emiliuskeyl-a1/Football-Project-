import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayDiagram } from './PlayDiagram.tsx';
import { Play, ConceptLibrary } from '../types.ts';
import { generatePlay } from '../services/playbookService.ts';
import { ROUTE_LIBRARY } from '../constants.ts';

interface GeneratorViewProps {
  conceptLibrary: ConceptLibrary;
  onOpenManager: () => void;
  onBackToMenu: () => void;
  displayMode: 'both' | 'diagramOnly' | 'playcallOnly';
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ conceptLibrary, onOpenManager, onBackToMenu, displayMode }) => {
  const [currentPlay, setCurrentPlay] = useState<Play | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [quizStatus, setQuizStatus] = useState<'idle' | 'submitted'>('idle');
  const [answerDetails, setAnswerDetails] = useState<Array<{
    receiver: string;
    userSelection: string;
    correctRoute: string;
    isMatch: boolean;
  }> | null>(null);

  const allRoutes = useMemo(() => Object.keys(ROUTE_LIBRARY).sort(), []);

  const handleGeneratePlay = useCallback(() => {
    setIsLoading(true);
    setIsRevealed(false);
    setQuizStatus('idle');
    setAnswerDetails(null);

    // Give a brief moment for the loader to feel responsive
    setTimeout(() => {
      const newPlay = generatePlay(conceptLibrary);
      setCurrentPlay(newPlay);

      const initialSelections = Object.keys(newPlay.routes).reduce((acc, receiver) => {
          acc[receiver] = '';
          return acc;
      }, {} as Record<string, string>);
      setUserSelections(initialSelections);

      setIsLoading(false);
    }, 300);
  }, [conceptLibrary]);

  useEffect(() => {
    handleGeneratePlay();
  }, [handleGeneratePlay]);
  
  const handleCheckAnswer = () => {
    if (!currentPlay) return;

    const details = Object.keys(currentPlay.routes).sort().map(receiver => {
        const userSelection = userSelections[receiver] || 'No Selection';
        const correctRoute = currentPlay.routes[receiver].routeName;
        return { receiver, userSelection, correctRoute, isMatch: userSelection === correctRoute };
    });

    setAnswerDetails(details);
    setQuizStatus('submitted');
  };

  const isQuizCorrect = useMemo(() => answerDetails?.every(d => d.isMatch) ?? false, [answerDetails]);

  const getTitle = () => {
      if (displayMode === 'diagramOnly') return 'Quiz: Name the Play';
      if (displayMode === 'playcallOnly') return 'Quiz: Draw the Play';
      return 'Play Generator';
  }

  const renderInteractiveQuiz = () => {
    if (quizStatus === 'submitted' && answerDetails && currentPlay) {
      // Results View
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h3 className={`text-3xl font-bold mb-4 text-center ${isQuizCorrect ? 'text-blue-600' : 'text-red-600'}`}>
              {isQuizCorrect ? 'Perfect Execution!' : 'Time for Film Review'}
            </h3>
            <ul className="space-y-3 w-full max-w-md text-center">
              {answerDetails.map(({ receiver, userSelection, correctRoute, isMatch }) => (
                <li key={receiver} className={`p-3 rounded-lg border-2 ${isMatch ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-bold text-lg text-gray-800">{receiver}</p>
                  {isMatch ? (
                    <p className="text-blue-700 font-medium">Correct: {userSelection}</p>
                  ) : (
                    <>
                      <p className="text-red-700 line-through">Your Pick: {userSelection}</p>
                      <p className="text-gray-600">Correct Route: <span className="font-bold text-blue-700">{correctRoute}</span></p>
                    </>
                  )}
                </li>
              ))}
            </ul>
        </div>
      );
    }
    
    // Asking View
    return (
      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-gray-800">
        <h3 className="text-xl font-semibold mb-6 text-center">Assign the correct route to each receiver:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8 w-full max-w-2xl">
          {Object.keys(userSelections).sort().map(receiver => (
            <div key={receiver} className="flex items-center space-x-3">
              <label htmlFor={`route-select-${receiver}`} className="font-bold text-gray-800 text-lg w-10 text-right">{receiver}:</label>
              <select
                id={`route-select-${receiver}`}
                value={userSelections[receiver]}
                onChange={(e) => setUserSelections(prev => ({ ...prev, [receiver]: e.target.value }))}
                className="flex-grow bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Route...</option>
                {allRoutes.map(route => <option key={route} value={route}>{route}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={handleCheckAnswer} className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg">
          Check Answer
        </button>
      </div>
    );
  };
  
  const showPlaycall = displayMode !== 'diagramOnly' || isRevealed;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col" style={{height: 'calc(100vh - 2rem)'}}>
       <header className="w-full text-center mb-4 flex justify-between items-center flex-shrink-0">
         <button onClick={onBackToMenu} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            &larr; Menu
         </button>
         <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {getTitle()}
        </h1>
        <button onClick={onOpenManager} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Manage
        </button>
      </header>

      <main className="w-full flex-grow flex flex-col items-center bg-gray-50 rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="w-full bg-gray-800 p-3 rounded-lg text-center min-h-[60px] flex items-center justify-center mb-4 shadow-md">
            {!currentPlay ? (
                <p className="text-lg font-mono text-yellow-300">Generating play...</p>
            ) : displayMode === 'diagramOnly' && !isRevealed ? (
                 <button onClick={() => setIsRevealed(true)} className="text-yellow-300 font-bold text-lg hover:text-yellow-200 transition-colors animate-pulse">
                    Click to Reveal Playcall
                 </button>
            ) : (
                 <h2 className="text-lg md:text-xl font-mono tracking-tighter text-yellow-300 break-words px-4">
                    {currentPlay.playcall}
                </h2>
            )}
        </div>

        <div className="w-full flex-grow relative">
           {isLoading || !currentPlay ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              {displayMode === 'playcallOnly' ? (
                <div className="absolute inset-0">
                  {renderInteractiveQuiz()}
                </div>
              ) : (
                <PlayDiagram play={currentPlay} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="w-full mt-4 flex-shrink-0">
        <button
          onClick={handleGeneratePlay}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
        >
          {isLoading ? 'Generating...' : 'Next Play'}
        </button>
      </footer>
    </div>
  );
};