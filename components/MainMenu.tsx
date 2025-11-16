import React from 'react';
import { AppMode } from '../types.ts';

interface MainMenuProps {
  onModeSelect: (mode: AppMode) => void;
}

interface MenuButtonProps {
  onClick: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, title, description, icon }) => (
  <button
    onClick={onClick}
    className="bg-white hover:bg-gray-100/80 group text-left p-6 rounded-2xl w-full transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 flex items-center space-x-5"
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {icon}
    </div>
    <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 mt-1 text-sm">{description}</p>
    </div>
  </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onModeSelect }) => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-screen py-10">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          Football<span className="text-blue-400"> Playbook</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Welcome, Coach. Select a module to begin.
        </p>
      </header>

      <div className="w-full space-y-4">
        <MenuButton 
          onClick={() => onModeSelect('generator')}
          title="Play Generator"
          description="Generate and view a complete, random offensive play."
          icon={<IconSparkles />}
        />
        <MenuButton 
          onClick={() => onModeSelect('study')}
          title="Study Room"
          description="Browse and learn individual routes and concepts."
          icon={<IconBook />}
        />
         <MenuButton 
          onClick={() => onModeSelect('quizPlaycall')}
          title="Quiz: Name the Play"
          description="See a play diagram and identify the correct playcall."
          icon={<IconEye />}
        />
        <MenuButton 
          onClick={() => onModeSelect('quizDiagram')}
          title="Quiz: Draw the Play"
          description="Read a playcall and choose the correct routes."
          icon={<IconPencil />}
        />
      </div>
    </div>
  );
};

// --- SVG Icons (Inlined for simplicity) ---

const IconSparkles = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const IconBook = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const IconPencil = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);