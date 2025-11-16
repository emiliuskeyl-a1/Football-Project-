import React from 'react';
import { Play, Point } from '../types';

interface PlayDiagramProps {
  play: Play;
}

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 600;
const YARD_SCALE = FIELD_HEIGHT / 53.3; // Standard field width

const Player: React.FC<{ position: Point; label: string }> = ({ position, label }) => {
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <circle cx="0" cy="0" r="14" fill="#fef08a" stroke="#4b5563" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">
        {label}
      </text>
    </g>
  );
};

const RoutePath: React.FC<{ startPos: Point; path: Point[]; color: string }> = ({ startPos, path, color }) => {
  if (!path || path.length === 0) return null;

  const pathData = path
    .map((p, i) => {
      const x = startPos.x + p.x * YARD_SCALE; // Scale horizontal movement (FIXED: removed 0.7 multiplier)
      const y = startPos.y - p.y * YARD_SCALE; // Y goes up
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <path
      d={pathData}
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd="url(#arrowhead)"
    />
  );
};

export const PlayDiagram: React.FC<PlayDiagramProps> = ({ play }) => {
  const { formationName, routes } = play;
  const formation = FORMATIONS[formationName];

  const colors = ["#6ee7b7", "#f87171", "#60a5fa", "#facc15", "#c084fc"];

  return (
    <div className="w-full h-full bg-[#1e40af] rounded-lg overflow-hidden relative">
      <svg
        viewBox={`0 50 ${FIELD_WIDTH} ${FIELD_HEIGHT - 100}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="4"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#fef08a" />
          </marker>
        </defs>

        {/* Field Markings */}
        <g stroke="#FFF" strokeOpacity="0.5" strokeWidth="2">
          {/* Horizontal Yard lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const y = (FIELD_HEIGHT / 11) * i;
             if (i > 0) {
                return <line key={`line-${i}`} x1="0" y1={y} x2={FIELD_WIDTH} y2={y} />;
             }
             return null;
          })}
          {/* Vertical Hash marks */}
          <line x1={FIELD_WIDTH / 3} y1="0" x2={FIELD_WIDTH / 3} y2={FIELD_HEIGHT} strokeDasharray="4 8" />
          <line x1={(FIELD_WIDTH * 2) / 3} y1="0" x2={(FIELD_WIDTH * 2) / 3} y2={FIELD_HEIGHT} strokeDasharray="4 8" />
        </g>

        {/* Center Field Logo */}
        <text
          x={FIELD_WIDTH / 2}
          y={FIELD_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e3a8a"
          stroke="#facc15"
          strokeWidth="3"
          fontSize="120"
          fontWeight="900"
          letterSpacing="0.05em"
          opacity="0.35"
          style={{ pointerEvents: 'none' }}
        >
            RUTLAND
        </text>
        
        {/* Center & QB */}
        <Player position={{x: FIELD_WIDTH / 2, y: (FIELD_HEIGHT * 80) / 100}} label="C" />
        <Player position={{x: FIELD_WIDTH / 2, y: (FIELD_HEIGHT * 84) / 100}} label="QB" />

        {/* Receivers and Routes */}
        {Object.keys(routes).map((receiver, index) => {
          const routeInfo = routes[receiver];
          if (!formation[receiver] || !routeInfo) return null;
          
          const startPos = {
            x: (FIELD_WIDTH * formation[receiver].x) / 100,
            y: (FIELD_HEIGHT * formation[receiver].y) / 100,
          };

          return (
            <g key={receiver}>
              <RoutePath startPos={startPos} path={routeInfo.path} color={colors[index % colors.length]} />
              <Player position={startPos} label={receiver} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// We need to define FORMATIONS here as well for the component to use it
// In a larger app, this might come from a shared context or props
import { FORMATIONS } from '../constants';