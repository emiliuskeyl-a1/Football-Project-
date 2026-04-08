
import React from 'react';
import { Play, Point, RoutePath } from '../types';
import { FORMATIONS, LINE_OF_SCRIMMAGE_Y } from '../constants';

interface PlayDiagramProps {
  play: Play;
}

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 600;
const YARD_SCALE = FIELD_HEIGHT / 53.3; // Standard field width

const Player: React.FC<{ position: Point; label: string; color?: string; radius?: number }> = ({ position, label, color = "#fef08a", radius = 14 }) => {
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <circle cx="0" cy="0" r={radius} fill={color} stroke="#4b5563" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">
        {label}
      </text>
    </g>
  );
};

const PathLine: React.FC<{ 
  startPos: Point; 
  path: RoutePath; 
  color: string; 
  isMotion?: boolean; 
  hasArrow?: boolean;
  isBlock?: boolean;
}> = ({ startPos, path, color, isMotion = false, hasArrow = true, isBlock = false }) => {
  if (!path || path.length === 0) return null;

  const points = path.map(p => ({
    x: startPos.x + p.x * YARD_SCALE,
    y: startPos.y - p.y * YARD_SCALE
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  
  // Calculate blocking bar if requested and we have at least 2 points
  let blockBarData = "";
  if (isBlock && points.length >= 2) {
    const pEnd = points[points.length - 1];
    const pPrev = points[points.length - 2];
    
    // Direction vector
    const dx = pEnd.x - pPrev.x;
    const dy = pEnd.y - pPrev.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0.1) {
      const barSize = 16; // Slightly larger T-bar for better visibility
      // Perpendicular vector
      const px = (-dy / len) * (barSize / 2);
      const py = (dx / len) * (barSize / 2);
      
      blockBarData = `M ${pEnd.x - px} ${pEnd.y - py} L ${pEnd.x + px} ${pEnd.y + py}`;
    }
  }
  
  return (
    <g>
      <path
        d={pathData}
        stroke={color}
        strokeWidth={isMotion ? "3" : "4"}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isMotion ? "8 8" : "none"}
        markerEnd={hasArrow ? "url(#arrowhead)" : "none"}
      />
      {isBlock && blockBarData && (
        <path
          d={blockBarData}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

export const PlayDiagram: React.FC<PlayDiagramProps> = ({ play }) => {
  const { formationName, routes, motions, protectionPaths } = play;
  const formation = FORMATIONS[formationName];

  const colors = ["#6ee7b7", "#f87171", "#60a5fa", "#facc15", "#c084fc"];
  
  const centerX = FIELD_WIDTH / 2;
  const centerY = (FIELD_HEIGHT * LINE_OF_SCRIMMAGE_Y) / 100;
  const linemanSpacing = 2.2 * YARD_SCALE;

  const renderLineman = (label: string, basePos: Point) => {
    const path = protectionPaths?.[label];
    return (
      <g key={label}>
        {/* Protection path is drawn from the static lineman position */}
        {path && <PathLine startPos={basePos} path={path} color="#cbd5e1" hasArrow={false} isBlock={true} />}
        {/* Lineman stays at the basePos (Line of Scrimmage) */}
        <Player position={basePos} label={label} radius={12} />
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-[#1e40af] rounded-lg overflow-hidden relative">
      <svg
        viewBox={`0 50 ${FIELD_WIDTH} ${FIELD_HEIGHT - 100}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="4" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#fef08a" />
          </marker>
        </defs>

        <g stroke="#FFF" strokeOpacity="0.5" strokeWidth="2">
          {Array.from({ length: 12 }).map((_, i) => {
            const y = (FIELD_HEIGHT / 11) * i;
            return i > 0 ? <line key={`line-${i}`} x1="0" y1={y} x2={FIELD_WIDTH} y2={y} /> : null;
          })}
          <line x1={FIELD_WIDTH / 3} y1="0" x2={FIELD_WIDTH / 3} y2={FIELD_HEIGHT} strokeDasharray="4 8" />
          <line x1={(FIELD_WIDTH * 2) / 3} y1="0" x2={(FIELD_WIDTH * 2) / 3} y2={FIELD_HEIGHT} strokeDasharray="4 8" />
        </g>
        
        {/* Offensive Line - Static at LOS */}
        {renderLineman("C", {x: centerX, y: centerY})}
        {renderLineman("LG", {x: centerX - linemanSpacing, y: centerY})}
        {renderLineman("LT", {x: centerX - ( linemanSpacing * 2), y: centerY})}
        {renderLineman("RG", {x: centerX + linemanSpacing, y: centerY})}
        {renderLineman("RT", {x: centerX + (linemanSpacing * 2), y: centerY})}

        {/* Backfield - QB moved back to 5 yards from LOS */}
        <Player position={{x: centerX, y: centerY + (5 * YARD_SCALE)}} label="QB" />

        {/* Receivers */}
        {Object.keys(formation).map((receiver, index) => {
          const routeInfo = routes[receiver];
          const motionInfo = motions.find(m => m.receiver === receiver);
          if (!formation[receiver]) return null;
          
          const startPos = {
            x: (FIELD_WIDTH * formation[receiver].x) / 100,
            y: (FIELD_HEIGHT * formation[receiver].y) / 100,
          };
          
          let finalPos = { ...startPos };
          if (motionInfo) {
              const endPoint = motionInfo.path[motionInfo.path.length - 1];
              finalPos.x = startPos.x + (endPoint.x * (FIELD_WIDTH / 106.6)); 
              finalPos.y = startPos.y - (endPoint.y * YARD_SCALE);
          }

          return (
            <g key={receiver}>
              {motionInfo && <PathLine startPos={startPos} path={motionInfo.path} color={"#9ca3af"} isMotion={true} hasArrow={false} />}
              {routeInfo && <PathLine startPos={finalPos} path={routeInfo.path} color={colors[index % colors.length]} hasArrow={routeInfo.routeName !== 'Block'} />}
              <Player position={startPos} label={receiver} />
               {motionInfo && <Player position={finalPos} label={receiver} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
