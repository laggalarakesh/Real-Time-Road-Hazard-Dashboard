import React, { useState, MouseEvent } from 'react';
import { Hazard, Severity } from '../types';
import { SEVERITY_COLORS } from '../constants';

interface HazardMarkerProps {
  hazard: Hazard;
  isNew: boolean;
  onMouseDown: () => void;
}

const HazardIcon: React.FC<{ type: Hazard['type'] }> = ({ type }) => {
  const icons: { [key: string]: React.ReactNode } = {
    'Pothole': <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l3-3m0 0l3 3m-3-3v9a2 2 0 002 2h6a2 2 0 002-2v-9m-9 3l3-3m0 0l3 3M6 6h12" />,
    'Debris': <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    'Stalled Vehicle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    'Speed Breaker': <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />,
    'Flooding': <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
      {icons[type] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};


export const HazardMarker: React.FC<HazardMarkerProps> = ({ hazard, isNew, onMouseDown }) => {
  const colorClass = SEVERITY_COLORS[hazard.severity];
  const [isHovered, setIsHovered] = useState(false);

  const scale = isHovered ? 1.5 : 1;

  const markerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${hazard.location.lat}%`,
    left: `${hazard.location.lng}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transition: 'transform 0.2s ease-in-out',
    zIndex: isHovered ? 20 : 1,
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent map panning when clicking a marker
    onMouseDown();
  }
  
  // Determine the appropriate visual effect based on novelty and severity
  let effectClass = '';
  if (isNew) {
    // A new high-severity hazard gets a more urgent red pulse
    effectClass = hazard.severity === Severity.High ? 'animate-pulse-high-sev' : 'animate-pulse-new';
  } else if (hazard.severity === Severity.High) {
    // Existing high-severity hazards get a static glow
    effectClass = 'shadow-high-sev';
  }

  return (
    <div
      style={markerStyle}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      <style>{`
        @keyframes pulse-new {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(56, 189, 248, 0);
          }
        }
        .animate-pulse-new {
          animation: pulse-new 1.5s ease-out;
        }

        @keyframes pulse-high-sev {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        .animate-pulse-high-sev {
            animation: pulse-high-sev 1.5s ease-out;
        }
        .shadow-high-sev {
            box-shadow: 0 0 8px 1px rgba(239, 68, 68, 0.6);
        }
      `}</style>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClass} shadow-lg cursor-pointer ${effectClass}`}>
        <HazardIcon type={hazard.type} />
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 text-white text-xs rounded-md py-1 px-2 shadow-xl z-20 pointer-events-none">
        <p className="font-bold">{hazard.type}</p>
        <p>Severity: {hazard.severity}</p>
        <p>Confidence: {hazard.confidence}%</p>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
      </div>
    </div>
  );
};