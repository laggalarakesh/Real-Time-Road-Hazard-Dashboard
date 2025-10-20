import { HazardType, Severity } from './types';

export const HAZARD_TYPES = Object.values(HazardType);
export const SEVERITY_LEVELS = Object.values(Severity);

export const SEVERITY_COLORS: { [key in Severity]: string } = {
  [Severity.Low]: 'bg-green-500 border-green-400',
  [Severity.Medium]: 'bg-yellow-500 border-yellow-400',
  [Severity.High]: 'bg-red-500 border-red-400',
};

export const SEVERITY_TEXT_COLORS: { [key in Severity]: string } = {
    [Severity.Low]: 'text-green-300',
    [Severity.Medium]: 'text-yellow-300',
    [Severity.High]: 'text-red-300',
  };

export const MOCK_HAZARD_IMAGES: { [key in HazardType]: string } = {
    [HazardType.Pothole]: 'https://picsum.photos/seed/pothole/300/200',
    [HazardType.Debris]: 'https://picsum.photos/seed/debris/300/200',
    [HazardType.StalledVehicle]: 'https://picsum.photos/seed/stalled/300/200',
    [HazardType.SpeedBreaker]: 'https://picsum.photos/seed/speedbreaker/300/200',
    [HazardType.Flooding]: 'https://picsum.photos/seed/flooding/300/200'
};

export const MAP_MIN_ZOOM = 0.5;
export const MAP_MAX_ZOOM = 3;
export const MAP_ZOOM_STEP = 0.2;
