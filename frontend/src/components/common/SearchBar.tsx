// src/components/common/SearchBar.jsx

import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={16} className="text-secondary-foreground" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-secondary border border-border rounded-md py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        placeholder={placeholder}
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X size={16} className="text-secondary-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;