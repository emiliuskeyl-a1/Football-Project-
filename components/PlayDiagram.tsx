import React from 'react';
import { Play, Point } from '../types.ts';
import { FORMATIONS } from '../constants.ts';

interface PlayDiagramProps {
  play: Play;
}

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 600;
const YARD_SCALE = FIELD_HEIGHT / 53.3; // Standard field width

const Player: React.FC<{ position: Point; label: string }> = ({ position, label }) => {
  const isOffense = ['W', 'S', 'H', 'Z', 'QB'].includes(label);
  const isCenter = label === 'C';

  let symbol;
  if (isCenter) {
    symbol = <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#374151" />;
  } else if (isOffense) {
    symbol = <circle cx="0" cy="0" r="14" fill="white" stroke="#3b82f6" strokeWidth="4" />;
  } else { // Generic or defense
    symbol = <path d="M -10 -10 L 10 10 M -10 10 L 10 -10" stroke="#ef4444" strokeWidth="4" />;
  }

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {symbol}
      <text x="0" y="5" textAnchor="middle" fill={isCenter ? "white" : "#1f2937"} fontSize="14" fontWeight="bold">
        {label}
      </text>
    </g>
  );
};

const RoutePath: React.FC<{ startPos: Point; path: Point[]; color: string; routeName: string }> = ({ startPos, path, color, routeName }) => {
  if (!path || path.length === 0) return null;

  const pathData = path
    .map((p, i) => {
      const x = startPos.x + p.x * YARD_SCALE;
      const y = startPos.y - p.y * YARD_SCALE;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  const hasArrow = routeName !== 'Block';

  return (
    <path
      d={pathData}
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd={hasArrow ? `url(#arrowhead-${color})` : "none"}
    />
  );
};

export const PlayDiagram: React.FC<PlayDiagramProps> = ({ play }) => {
  const { formationName, routes } = play;
  const formation = FORMATIONS[formationName];

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f97316", "#8b5cf6"];

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden relative shadow-inner">
      <svg
        viewBox={`0 50 ${FIELD_WIDTH} ${FIELD_HEIGHT - 100}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          {colors.map(color => (
            <marker
                key={color}
                id={`arrowhead-${color}`}
                markerWidth="8"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
              <polygon points="0 0, 8 3, 0 6" fill={color} />
            </marker>
          ))}
        </defs>
        
        {/* Background */}
        <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="white" />

        {/* Field Markings */}
        <g stroke="#d1d5db" strokeOpacity="0.8" strokeWidth="2">
          {/* Horizontal Yard lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const y = (FIELD_HEIGHT / 11) * i;
             if (i > 0) {
                return <line key={`line-${i}`} x1="0" y1={y} x2={FIELD_WIDTH} y2={y} />;
             }
             return null;
          })}
          {/* Vertical Hash marks */}
          <line x1={FIELD_WIDTH / 3} y1="0" x2={FIELD_WIDTH / 3} y2={FIELD_HEIGHT} strokeDasharray="2 6" />
          <line x1={(FIELD_WIDTH * 2) / 3} y1="0" x2={(FIELD_WIDTH * 2) / 3} y2={FIELD_HEIGHT} strokeDasharray="2 6" />
        </g>
        
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
              <RoutePath startPos={startPos} path={routeInfo.path} color={colors[index % colors.length]} routeName={routeInfo.routeName} />
              <Player position={startPos} label={receiver} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};