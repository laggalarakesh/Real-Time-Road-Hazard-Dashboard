import React, { useEffect } from 'react';
import { Hazard, Cluster, Severity } from '../types';
import { SEVERITY_COLORS, SEVERITY_TEXT_COLORS } from '../constants';

interface ModalProps {
  content: Hazard | Cluster;
  onClose: () => void;
  onZoom?: () => void;
}

// Helper to check if the content is a Cluster
function isCluster(content: Hazard | Cluster): content is Cluster {
  return 'count' in content && 'hazards' in content;
}

const TimeAgo: React.FC<{ date: Date }> = ({ date }) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return <span>{Math.floor(interval)} years ago</span>;
    interval = seconds / 2592000;
    if (interval > 1) return <span>{Math.floor(interval)} months ago</span>;
    interval = seconds / 86400;
    if (interval > 1) return <span>{Math.floor(interval)} days ago</span>;
    interval = seconds / 3600;
    if (interval > 1) return <span>{Math.floor(interval)} hours ago</span>;
    interval = seconds / 60;
    if (interval > 1) return <span>{Math.floor(interval)} minutes ago</span>;
    return <span>{Math.floor(seconds)} seconds ago</span>;
}

const HazardDetails: React.FC<{ hazard: Hazard }> = ({ hazard }) => {
    const severityColor = SEVERITY_COLORS[hazard.severity].split(' ')[0];
    const severityTextColor = SEVERITY_TEXT_COLORS[hazard.severity];
    return (
        <>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">{hazard.type} Details</h3>
            {hazard.imageUrl && (
                <img src={hazard.imageUrl} alt={hazard.type} className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-gray-600"/>
            )}
            <div className="space-y-2 text-gray-300">
                <p><strong>Severity:</strong> <span className={`font-bold px-2 py-1 rounded-full text-xs text-white ${severityColor}`}>{hazard.severity}</span></p>
                <p><strong>Confidence:</strong> <span className={`${severityTextColor} font-semibold`}>{hazard.confidence}%</span></p>
                <p><strong>Detected:</strong> <TimeAgo date={hazard.timestamp} /></p>
                <p className="text-xs text-gray-500 pt-2">ID: {hazard.id}</p>
            </div>
        </>
    );
};

const ClusterDetails: React.FC<{ cluster: Cluster, onZoom?: () => void }> = ({ cluster, onZoom }) => {
    // Count occurrences of each hazard type in the cluster
    const hazardTypeCounts = cluster.hazards.reduce((acc, hazard) => {
        acc[hazard.type] = (acc[hazard.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Cluster Summary</h3>
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-lg text-gray-200 mb-3">This area contains <strong className="text-cyan-400">{cluster.count}</strong> hazards:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {Object.entries(hazardTypeCounts).map(([type, count]) => (
                        <li key={type}>{type}: <span className="font-semibold">{count}</span></li>
                    ))}
                </ul>
            </div>
            {onZoom && (
                <button
                    onClick={onZoom}
                    className="mt-6 w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                >
                    Zoom to Area
                </button>
            )}
        </>
    );
};

export const Modal: React.FC<ModalProps> = ({ content, onClose, onZoom }) => {
  // Handle Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 border border-gray-700 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-200 transition"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {isCluster(content) ? (
          <ClusterDetails cluster={content} onZoom={onZoom} />
        ) : (
          <HazardDetails hazard={content} />
        )}
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
