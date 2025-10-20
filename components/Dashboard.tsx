import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Hazard, Filters, Cluster, Severity } from '../types';
import { getInitialHazards, subscribeToHazards } from '../services/hazardService';
import { Map } from './Map';
import { HazardList } from './HazardList';
import { FilterControls } from './FilterControls';
import { Notification } from './Notification';
import { Modal } from './Modal';
import { DateRangePicker } from './DateRangePicker';
import { MAP_MAX_ZOOM } from '../constants';

export const Dashboard: React.FC = () => {
  const [allHazards, setAllHazards] = useState<Hazard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: 'all', severity: 'all' });
  const [notification, setNotification] = useState<Hazard | null>(null);
  const [selectedItem, setSelectedItem] = useState<Hazard | Cluster | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [latestHazardId, setLatestHazardId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHazards = async () => {
      setIsLoading(true);
      const initialHazards = await getInitialHazards();
      setAllHazards(initialHazards.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setIsLoading(false);
    };

    fetchHazards();

    const unsubscribe = subscribeToHazards(newHazard => {
      setAllHazards(prevHazards => 
        [newHazard, ...prevHazards].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
      setLatestHazardId(newHazard.id);
      
      // Trigger notification for high severity hazards
      if (newHazard.severity === Severity.High) {
        setNotification(newHazard);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const filteredHazards = useMemo(() => {
    return allHazards.filter(hazard => {
      const typeMatch = filters.type === 'all' || hazard.type === filters.type;
      const severityMatch = filters.severity === 'all' || hazard.severity === filters.severity;
      return typeMatch && severityMatch;
    });
  }, [allHazards, filters]);

  const handleMarkerClick = (item: Hazard | Cluster) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };
  
  const handleZoomToCluster = () => {
    if (selectedItem && 'count' in selectedItem) { // isCluster check
        setZoom(prev => Math.min(MAP_MAX_ZOOM, prev + 0.5));
        setMapCenter(selectedItem.location);
    }
    setSelectedItem(null);
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">
                Real-Time Road Hazard Dashboard
            </h1>
            <p className="text-sm text-gray-400">Monitoring road conditions with AI-powered dashcam analysis</p>
        </header>

        {/* Main Content */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-100px)]">
            {/* Left Panel: Map */}
            <section className="lg:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
                <h2 className="text-xl font-semibold mb-3 text-gray-300">Hazard Map</h2>
                <div className="flex-grow">
                  <Map 
                    hazards={filteredHazards} 
                    zoom={zoom} 
                    setZoom={setZoom} 
                    onMarkerClick={handleMarkerClick}
                    mapCenter={mapCenter}
                    latestHazardId={latestHazardId}
                  />
                </div>
            </section>
            
            {/* Right Panel: Controls & List */}
            <section className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-4 overflow-hidden">
                <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-300">Filters</h2>
                    <FilterControls filters={filters} onFilterChange={handleFilterChange} />
                    <div className="mt-4">
                      <DateRangePicker />
                    </div>
                </div>
                <div className="flex flex-col flex-grow overflow-hidden">
                    <h2 className="text-xl font-semibold mb-3 text-gray-300">Recent Hazards</h2>
                    <div className="flex-grow overflow-y-auto pr-1">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full text-gray-500">Loading hazards...</div>
                      ) : (
                        <HazardList hazards={filteredHazards} />
                      )}
                    </div>
                </div>
            </section>
        </main>
        
        {/* Modals and Notifications */}
        {selectedItem && <Modal content={selectedItem} onClose={handleCloseModal} onZoom={handleZoomToCluster}/>}
        {notification && <Notification hazard={notification} onClose={() => setNotification(null)} />}
    </div>
  );
};