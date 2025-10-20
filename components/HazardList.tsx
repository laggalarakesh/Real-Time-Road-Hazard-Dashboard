
import React from 'react';
import { Hazard } from '../types';
import { HazardListItem } from './HazardListItem';

interface HazardListProps {
  hazards: Hazard[];
}

export const HazardList: React.FC<HazardListProps> = ({ hazards }) => {
  if (hazards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hazards match the current filters.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 pr-2">
      {hazards.map(hazard => (
        <HazardListItem key={hazard.id} hazard={hazard} />
      ))}
    </ul>
  );
};
