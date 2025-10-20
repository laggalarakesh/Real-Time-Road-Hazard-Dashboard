
import React from 'react';
import { Filters, HazardType, Severity } from '../types';
import { HAZARD_TYPES, SEVERITY_LEVELS } from '../constants';

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
}

const selectBaseClasses = "w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-400 mb-1">
          Hazard Type
        </label>
        <select
          id="type-filter"
          className={selectBaseClasses}
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value as HazardType | 'all' })}
        >
          <option value="all">All Types</option>
          {HAZARD_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-400 mb-1">
          Severity
        </label>
        <select
          id="severity-filter"
          className={selectBaseClasses}
          value={filters.severity}
          onChange={(e) => onFilterChange({ severity: e.target.value as Severity | 'all' })}
        >
          <option value="all">All Severities</option>
          {SEVERITY_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
