import React from 'react';
import { AppMode } from '../types';

interface MainMenuProps {
  onModeSelect: (mode: AppMode) => void;
}

const MenuButton: React.FC<{ onClick: () => void; title: string; description: string }> = ({ onClick, title, description }) => (
  <button
    onClick={onClick}
    className="bg-gray-800 hover:bg-gray-700 hover:shadow-blue-400/20 text-left p-6 rounded-2xl w-full transition-all duration-300 shadow-lg border border-gray-700"
  >
    <h3 className="text-xl font-bold text-blue-400">{title}</h3>
    <p className="text-gray-400 mt-1 text-sm">{description}</p>
  </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onModeSelect }) => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-bold text-blue-400 tracking-wider">
          Playbook Menu
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Choose your training mode.
        </p>
      </header>

      <div className="w-full space-y-4">
        <MenuButton 
          onClick={() => onModeSelect('generator')}
          title="Play Generator"
          description="Generate and view a complete, random offensive play."
        />
        <MenuButton 
          onClick={() => onModeSelect('study')}
          title="Study Room"
          description="Browse and learn individual routes and concepts."
        />
         <MenuButton 
          onClick={() => onModeSelect('quizPlaycall')}
          title="Quiz: Guess the Playcall"
          description="See a play diagram and guess the correct playcall."
        />
        <MenuButton 
          onClick={() => onModeSelect('quizDiagram')}
          title="Quiz: Guess the Routes"
          description="Read a playcall and visualize the routes."
        />
      </div>
    </div>
  );
};