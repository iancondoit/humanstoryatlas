import React from 'react';

interface FilterBarProps {
  filters: {
    publication: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (type: string, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const publications = ['All', 'Washington Post', 'New York Times', 'Chicago Tribune', 'Wall Street Journal', 'CBS News'];
  
  return (
    <div className="flex flex-wrap gap-4 items-center bg-neutral-800/30 p-4 rounded-lg shadow-sm">
      <div>
        <label htmlFor="publication" className="block text-sm font-medium mb-1 text-neutral-300">
          Publication
        </label>
        <select 
          id="publication" 
          className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.publication}
          onChange={(e) => onFilterChange('publication', e.target.value)}
        >
          {publications.map(pub => (
            <option key={pub} value={pub.toLowerCase() === 'all' ? '' : pub}>
              {pub}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium mb-1 text-neutral-300">
          From
        </label>
        <input 
          type="date" 
          id="startDate"
          className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium mb-1 text-neutral-300">
          To
        </label>
        <input 
          type="date" 
          id="endDate"
          className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterBar; 