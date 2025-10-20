import React, { useEffect, useState } from 'react';
import { Hazard } from '../types';

interface NotificationProps {
  hazard: Hazard;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ hazard, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start the fade-in animation
    const fadeInTimer = setTimeout(() => {
      setVisible(true);
    }, 100); // Short delay to ensure transition is applied

    // Set a timer to automatically close the notification
    const autoCloseTimer = setTimeout(() => {
      setVisible(false);
      // Call onClose after the fade-out animation completes
      const unmountTimer = setTimeout(onClose, 300);
      return () => clearTimeout(unmountTimer);
    }, 5000); // Notification stays for 5 seconds

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [hazard, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Allow time for fade-out animation before unmounting
  };

  return (
    <div
      className={`fixed top-5 right-5 w-full max-w-sm bg-gray-800 border-l-4 border-red-500 shadow-2xl rounded-lg p-4 z-50 transition-all duration-300 ease-in-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-bold text-red-400">High Severity Alert!</p>
          <p className="mt-1 text-sm text-gray-300">
            A new <span className="font-semibold">{hazard.type}</span> has been detected.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-200 transition"
            aria-label="Close notification"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
