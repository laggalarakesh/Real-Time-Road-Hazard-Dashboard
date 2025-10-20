import React from 'react';
import { Hazard } from '../types';
import { SEVERITY_COLORS, SEVERITY_TEXT_COLORS } from '../constants';

interface HazardListItemProps {
  hazard: Hazard;
}

const TimeAgo: React.FC<{ date: Date }> = ({ date }) => {
    const [timeString, setTimeString] = React.useState('');

    React.useEffect(() => {
        const update = () => {
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) {
                setTimeString(`${Math.floor(interval)} years ago`);
                return;
            }
            interval = seconds / 2592000;
            if (interval > 1) {
                setTimeString(`${Math.floor(interval)} months ago`);
                return;
            }
            interval = seconds / 86400;
            if (interval > 1) {
                setTimeString(`${Math.floor(interval)} days ago`);
                return;
            }
            interval = seconds / 3600;
            if (interval > 1) {
                setTimeString(`${Math.floor(interval)} hours ago`);
                return;
            }
            interval = seconds / 60;
            if (interval > 1) {
                setTimeString(`${Math.floor(interval)} minutes ago`);
                return;
            }
            setTimeString(`${Math.floor(seconds)} seconds ago`);
        };
        update();
        const timer = setInterval(update, 5000); // update every 5 seconds
        return () => clearInterval(timer);
    }, [date]);

    return <span className="text-gray-500 text-xs">{timeString}</span>;
}


export const HazardListItem: React.FC<HazardListItemProps> = ({ hazard }) => {
  const severityColor = SEVERITY_COLORS[hazard.severity].split(' ')[0];
  const severityTextColor = SEVERITY_TEXT_COLORS[hazard.severity];

  return (
    <li className="bg-gray-700/50 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 flex overflow-hidden">
      <div className={`w-1.5 flex-shrink-0 ${severityColor}`}></div>
      <div className="flex items-start space-x-3 p-3 flex-grow">
        {hazard.imageUrl && (
            <img 
                src={hazard.imageUrl} 
                alt={hazard.type} 
                className="w-20 h-16 object-cover rounded-md border-2 border-gray-600" 
            />
        )}
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-200">{hazard.type}</h3>
                <TimeAgo date={hazard.timestamp} />
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm">
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${severityColor}`}>
                    {hazard.severity}
                </span>
                <span className="text-gray-400">
                    Confidence: <span className={`${severityTextColor} font-medium`}>{hazard.confidence}%</span>
                </span>
            </div>
             <p className="text-xs text-gray-500 mt-2">ID: {hazard.id}</p>
        </div>
      </div>
    </li>
  );
};