import React from 'react';

export const DateRangePicker: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-400 mb-1">
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          disabled
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-500 cursor-not-allowed"
        />
      </div>
      <div>
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-400 mb-1">
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          disabled
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-500 cursor-not-allowed"
        />
         <p className="text-xs text-gray-500 mt-1">Date range filtering is not yet implemented.</p>
      </div>
    </div>
  );
};
