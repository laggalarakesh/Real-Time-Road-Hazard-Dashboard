import { Hazard, HazardType, Severity } from '../types';
import { MOCK_HAZARD_IMAGES } from '../constants';

// --- Mock Data Generation ---

const HAZARD_TYPES_ARRAY = Object.values(HazardType);
const SEVERITY_LEVELS_ARRAY = Object.values(Severity);

const createMockHazard = (): Hazard => {
  const type = HAZARD_TYPES_ARRAY[Math.floor(Math.random() * HAZARD_TYPES_ARRAY.length)];
  const severity = SEVERITY_LEVELS_ARRAY[Math.floor(Math.random() * SEVERITY_LEVELS_ARRAY.length)];
  
  return {
    id: `haz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    location: {
      lat: Math.random() * 90 + 5, // Avoid edges for better clustering
      lng: Math.random() * 90 + 5,
    },
    timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7), // within the last 7 days
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    imageUrl: MOCK_HAZARD_IMAGES[type],
  };
};

const initialHazards: Hazard[] = Array.from({ length: 50 }, createMockHazard);

// --- Real-time Service Simulation ---

type HazardListener = (newHazard: Hazard) => void;

let listeners: HazardListener[] = [];
// Fix: Cannot find namespace 'NodeJS'. Use ReturnType<typeof setInterval> for browser compatibility.
let intervalId: ReturnType<typeof setInterval> | null = null;

// This function simulates a real-time subscription (like Firestore's onSnapshot)
export const subscribeToHazards = (onNewHazard: HazardListener): (() => void) => {
  listeners.push(onNewHazard);

  // Start the simulation if it's not already running
  if (!intervalId) {
    intervalId = setInterval(() => {
      const newHazard = createMockHazard();
      // Notify all listeners
      listeners.forEach(listener => listener(newHazard));
    }, 5000 + Math.random() * 5000); // Add a new hazard every 5-10 seconds
  }
  
  // Return an unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== onNewHazard);
    if (listeners.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

// This function simulates fetching the initial data load
export const getInitialHazards = (): Promise<Hazard[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...initialHazards]);
    }, 500); // Simulate network delay
  });
};
