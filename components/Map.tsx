import React, { useMemo, useState, useRef, MouseEvent, WheelEvent, useEffect } from 'react';
import { Hazard, Cluster } from '../types';
import { HazardMarker } from './HazardMarker';
import { ClusterMarker } from './ClusterMarker';
import { MAP_MIN_ZOOM, MAP_MAX_ZOOM, MAP_ZOOM_STEP } from '../constants';


interface MapProps {
  hazards: Hazard[];
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onMarkerClick: (item: Hazard | Cluster) => void;
  mapCenter: { lat: number; lng: number } | null;
  latestHazardId: string | null;
}

// Helper function to calculate the distance between two points
const calculateDistance = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number => {
  const dx = p1.lng - p2.lng;
  const dy = p1.lat - p2.lat;
  return Math.sqrt(dx * dx + dy * dy);
};

export const Map: React.FC<MapProps> = ({ hazards, zoom, setZoom, onMarkerClick, mapCenter, latestHazardId }) => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  
  // Effect to handle panning and zooming to a specific cluster location
  useEffect(() => {
    if (!mapCenter || !mapRef.current) return;

    const { clientWidth, clientHeight } = mapRef.current;
    if (clientWidth === 0) return;

    // Center of the viewport
    const viewportCenterX = clientWidth / 2;
    const viewportCenterY = clientHeight / 2;

    // Target coordinates in map space (0-100) are converted to pixel space of the unzoomed map
    const targetPixelX = (mapCenter.lng / 100) * clientWidth;
    const targetPixelY = (mapCenter.lat / 100) * clientHeight;

    // Calculate the required pan offset to center the target point in the viewport
    // The transform is T(pan.x, pan.y) * S(zoom). A point p becomes p*zoom + pan.
    // We want target*zoom + pan = viewportCenter. So, pan = viewportCenter - target*zoom.
    const newPanX = viewportCenterX - targetPixelX * zoom;
    const newPanY = viewportCenterY - targetPixelY * zoom;

    const pannableContainer = mapRef.current?.querySelector('.pannable-container');
    if (pannableContainer instanceof HTMLElement) {
      // Add a temporary transition for a smooth animated effect
      pannableContainer.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      setPanOffset({ x: newPanX, y: newPanY });

      // Remove the transition after it completes so manual panning isn't animated
      const timeoutId = setTimeout(() => {
        pannableContainer.style.transition = '';
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [mapCenter, zoom]);


  const handleZoom = (newZoom: number, mouseX: number, mouseY: number) => {
    newZoom = Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, newZoom));
    if (newZoom === zoom) return;

    // Standard zoom-to-cursor logic
    const oldZoom = zoom;
    // Find the map point under the cursor before zoom
    const mapPointX = (mouseX - panOffset.x) / oldZoom;
    const mapPointY = (mouseY - panOffset.y) / oldZoom;

    // Calculate the new pan offset to keep the same map point under the cursor after zoom
    const newPanX = mouseX - mapPointX * newZoom;
    const newPanY = mouseY - mapPointY * newZoom;
    
    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };
  
  const handleZoomIn = () => {
    if (mapRef.current) {
        const { clientWidth, clientHeight } = mapRef.current;
        handleZoom(zoom + MAP_ZOOM_STEP, clientWidth / 2, clientHeight / 2); // Zoom to viewport center
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
        const { clientWidth, clientHeight } = mapRef.current;
        handleZoom(zoom - MAP_ZOOM_STEP, clientWidth / 2, clientHeight / 2); // Zoom to viewport center
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isPanning) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newZoom = e.deltaY < 0 ? zoom + MAP_ZOOM_STEP : zoom - MAP_ZOOM_STEP;
        handleZoom(newZoom, mouseX, mouseY);
    }
  };

  // Memoized clustering logic
  const { clusters, individualHazards } = useMemo(() => {
    // As we zoom in (zoom gets bigger), the radius gets smaller, causing clusters to break apart.
    const CLUSTER_RADIUS = 15 / zoom; 
    const tempClusters: { id: string, hazards: Hazard[], location: {lat: number, lng: number} }[] = [];
    const clusteredHazardIds = new Set<string>();

    for (const hazard of hazards) {
      if (clusteredHazardIds.has(hazard.id)) continue;

      let foundCluster = false;
      for (const cluster of tempClusters) {
        if (calculateDistance(hazard.location, cluster.location) < CLUSTER_RADIUS) {
          const totalPoints = cluster.hazards.length + 1;
          cluster.location.lat = (cluster.location.lat * cluster.hazards.length + hazard.location.lat) / totalPoints;
          cluster.location.lng = (cluster.location.lng * cluster.hazards.length + hazard.location.lng) / totalPoints;
          cluster.hazards.push(hazard);
          clusteredHazardIds.add(hazard.id);
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        tempClusters.push({
          id: `cluster-${hazard.id}`,
          hazards: [hazard],
          location: { ...hazard.location },
        });
        clusteredHazardIds.add(hazard.id);
      }
    }
    
    const finalClusters: Cluster[] = [];
    const individuals: Hazard[] = [];

    for (const cluster of tempClusters) {
      if (cluster.hazards.length > 1) {
        finalClusters.push({
          id: cluster.id,
          count: cluster.hazards.length,
          location: cluster.location,
          hazards: cluster.hazards,
        });
      } else {
        individuals.push(cluster.hazards[0]);
      }
    }

    return { clusters: finalClusters, individualHazards: individuals };
  }, [hazards, zoom]);

  return (
    <div 
      ref={mapRef}
      className={`w-full h-full bg-gray-900 rounded-md relative overflow-hidden border-2 border-gray-600 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
    >
      <div 
        className="w-full h-full pannable-container"
        style={{
          backgroundColor: '#111827',
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1px, transparent 1px), linear-gradient(rgba(34, 211, 238, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.07) 1px, transparent 1px)`,
          backgroundSize: `120px 120px, 120px 120px, 24px 24px, 24px 24px`,
          backgroundPosition: `-1px -1px, -1px -1px, -1px -1px, -1px -1px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {individualHazards.map(hazard => (
          <HazardMarker 
            key={hazard.id} 
            hazard={hazard} 
            isNew={hazard.id === latestHazardId}
            onMouseDown={() => onMarkerClick(hazard)} 
          />
        ))}
        {clusters.map(cluster => (
            <ClusterMarker
                key={cluster.id}
                cluster={cluster}
                onMouseDown={() => onMarkerClick(cluster)}
            />
        ))}
      </div>
      <div className="absolute bottom-2 right-2 bg-gray-900/70 text-gray-400 text-xs px-2 py-1 rounded pointer-events-none">
        Map Simulation - Not a real map service
       </div>
       {/* Zoom Controls */}
       <div className="absolute bottom-2 left-2 flex flex-col space-y-1 z-10">
        <button 
          onClick={handleZoomIn} 
          className="w-8 h-8 bg-gray-900/70 text-gray-300 rounded-md flex items-center justify-center hover:bg-gray-800 transition text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Zoom in"
          disabled={zoom >= MAP_MAX_ZOOM}
        >
          +
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-8 h-8 bg-gray-900/70 text-gray-300 rounded-md flex items-center justify-center hover:bg-gray-800 transition text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Zoom out"
          disabled={zoom <= MAP_MIN_ZOOM}
        >
          -
        </button>
       </div>
    </div>
  );
};