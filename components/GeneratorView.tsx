import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayDiagram } from './PlayDiagram';
import { Play, ConceptLibrary } from '../types';
import { generatePlay } from '../services/playbookService';
import { ROUTE_LIBRARY } from '../constants';

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
  
  // State for interactive quiz
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

    setTimeout(() => {
      const newPlay = generatePlay(conceptLibrary);
      setCurrentPlay(newPlay);

      // Initialize selections for the new play's receivers
      const initialSelections = Object.keys(newPlay.routes).reduce((acc, receiver) => {
          acc[receiver] = '';
          return acc;
      }, {} as Record<string, string>);
      setUserSelections(initialSelections);

      setIsLoading(false);
    }, 200);
  }, [conceptLibrary]);

  useEffect(() => {
    handleGeneratePlay();
  }, [handleGeneratePlay]);
  
  const handleCheckAnswer = () => {
    if (!currentPlay) return;

    const details = Object.keys(currentPlay.routes).sort().map(receiver => {
        const userSelection = userSelections[receiver] || 'No Selection';
        const correctRoute = currentPlay.routes[receiver].routeName;
        return {
            receiver,
            userSelection,
            correctRoute,
            isMatch: userSelection === correctRoute
        };
    });

    setAnswerDetails(details);
    setQuizStatus('submitted');
  };

  const isQuizCorrect = useMemo(() => answerDetails?.every(d => d.isMatch) ?? false, [answerDetails]);

  const getQuizTitle = () => {
      if (displayMode === 'diagramOnly') return 'Quiz: Guess the Playcall';
      if (displayMode === 'playcallOnly') return 'Quiz: Guess the Routes';
      return 'Playbook';
  }

  const renderInteractiveQuiz = () => {
    if (quizStatus === 'submitted' && answerDetails && currentPlay) {
      // Results View
      return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4">
          <div className="flex-grow w-full lg:w-2/3 h-64 lg:h-full">
            <PlayDiagram play={currentPlay} />
          </div>
          <div className="w-full lg:w-1/3 bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className={`text-2xl font-bold mb-4 ${isQuizCorrect ? 'text-blue-400' : 'text-red-400'}`}>
              {isQuizCorrect ? 'Correct!' : 'Review Your Answers'}
            </h3>
            <ul className="space-y-2 w-full text-center">
              {answerDetails.map(({ receiver, userSelection, correctRoute, isMatch }) => (
                <li key={receiver} className={`p-2 rounded-md ${isMatch ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
                  <p className="font-bold text-lg text-yellow-300">{receiver}</p>
                  {isMatch ? (
                    <p className="text-blue-300">Your Answer: {userSelection}</p>
                  ) : (
                    <>
                      <p className="text-red-300 line-through">Your Answer: {userSelection}</p>
                      <p className="text-gray-300">Correct: <span className="font-bold text-blue-300">{correctRoute}</span></p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    
    // Asking View
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center text-white">
        <h3 className="text-xl font-semibold mb-4 text-yellow-300">Assign the correct route to each receiver:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          {Object.keys(userSelections).sort().map(receiver => (
            <div key={receiver} className="flex items-center space-x-2">
              <label htmlFor={`route-select-${receiver}`} className="font-bold text-blue-400 text-lg w-8">{receiver}:</label>
              <select
                id={`route-select-${receiver}`}
                value={userSelections[receiver]}
                onChange={(e) => setUserSelections(prev => ({ ...prev, [receiver]: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 w-48"
              >
                <option value="">Select Route...</option>
                {allRoutes.map(route => <option key={route} value={route}>{route}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={handleCheckAnswer} className="bg-yellow-400 text-gray-900 font-bold py-2 px-6 rounded-lg text-lg hover:bg-yellow-500 transition-colors">
          Check Answer
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
       <header className="w-full max-w-5xl text-center mb-4 md:mb-6">
        <div className="flex justify-between items-center">
           <div className="w-1/3 flex justify-start">
             <button onClick={onBackToMenu} className="bg-gray-700 hover:bg-gray-600 text-yellow-300 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">
                &larr; Main Menu
             </button>
           </div>
           <div className="w-1/3">
             <h1 className="text-3xl md:text-5xl font-bold text-blue-400 tracking-wider">
              {getQuizTitle()}
            </h1>
           </div>
           <div className="w-1/3 flex justify-end">
            <button
                onClick={onOpenManager}
                className="bg-gray-700 hover:bg-gray-600 text-yellow-300 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200"
            >
                Manage Concepts
            </button>
           </div>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="w-full bg-gray-900 p-3 rounded-lg text-center min-h-[60px] flex items-center justify-center mb-4">
            {displayMode === 'diagramOnly' && !isRevealed ? (
                 <button onClick={() => setIsRevealed(true)} className="text-yellow-400 font-bold animate-pulse">Click to Reveal Playcall</button>
            ) : (
                 <h2 className="text-lg md:text-2xl font-mono tracking-tighter text-yellow-300 break-words">
                    {currentPlay?.playcall || 'Generating play...'}
                </h2>
            )}
        </div>

        <div className="w-full flex-grow aspect-[16/10] md:aspect-[16/9] relative">
           {isLoading || !currentPlay ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <>
              {displayMode === 'playcallOnly' ? (
                renderInteractiveQuiz()
              ) : (
                <PlayDiagram play={currentPlay} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl mt-4 md:mt-6">
        <button
          onClick={handleGeneratePlay}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-200 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate New Play'}
        </button>
      </footer>
    </div>
  );
};