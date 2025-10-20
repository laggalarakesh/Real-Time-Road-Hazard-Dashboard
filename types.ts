export enum HazardType {
  Pothole = 'Pothole',
  Debris = 'Debris',
  StalledVehicle = 'Stalled Vehicle',
  SpeedBreaker = 'Speed Breaker',
  Flooding = 'Flooding',
}

export enum Severity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Hazard {
  id: string;
  type: HazardType;
  severity: Severity;
  location: {
    lat: number; // Represents Y coordinate on the map (0-100)
    lng: number; // Represents X coordinate on the map (0-100)
  };
  timestamp: Date;
  confidence: number;
  imageUrl?: string; // Anonymized image from backend
}

export interface Filters {
  type: HazardType | 'all';
  severity: Severity | 'all';
}

export interface Cluster {
  id: string;
  count: number;
  location: { lat: number; lng: number };
  hazards: Hazard[];
}
