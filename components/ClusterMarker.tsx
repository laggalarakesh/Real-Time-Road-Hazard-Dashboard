import React, { useState, MouseEvent } from 'react';
import { Cluster } from '../types';

interface ClusterMarkerProps {
  cluster: Cluster;
  onMouseDown: () => void;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster, onMouseDown }) => {
  const { count, location } = cluster;
  const [isHovered, setIsHovered] = useState(false);

  // Determine size based on count for visual distinction
  const baseSize = count < 10 ? 32 : count < 25 ? 40 : 48;
  const scale = isHovered ? 1.1 : 1;

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${location.lat}%`,
    left: `${location.lng}%`,
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    zIndex: 10, // Ensure clusters are above individual markers
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent map panning when clicking a cluster
    onMouseDown();
  }

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-center rounded-full cursor-pointer
                 bg-sky-900/80 backdrop-blur-sm 
                 border-2 border-sky-400 
                 text-white font-bold 
                 shadow-[0_0_12px_rgba(56,189,248,0.6)] 
                 hover:shadow-[0_0_18px_rgba(56,189,248,0.8)] 
                 transition-colors duration-200"
    >
      {count}
    </div>
  );
};
