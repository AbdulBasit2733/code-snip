// src/components/snippets/SnippetList.jsx

import { useState } from 'react';
import SnippetCard from './SnippetCard';

const SnippetList = ({ snippets, onEditSnippet  }) => {
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Sort snippets based on current sort settings
  const sortedSnippets = [...snippets].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Convert dates to timestamps for comparison
    if (sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    const modifier = sortOrder === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex justify-end mb-2">
        <div className="flex items-center space-x-2 text-xs text-secondary-foreground">
          <span>Sort by:</span>
          <button
            onClick={() => handleSortChange('title')}
            className={`px-2 py-1 rounded ${
              sortBy === 'title' ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50'
            }`}
          >
            Name {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('updatedAt')}
            className={`px-2 py-1 rounded ${
              sortBy === 'updatedAt' ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50'
            }`}
          >
            Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('language')}
            className={`px-2 py-1 rounded ${
              sortBy === 'language' ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50'
            }`}
          >
            Language {sortBy === 'language' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Grid of snippet cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSnippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} onEdit={() => onEditSnippet(snippet)} />
        ))}
      </div>
    </div>
  );
};

export default SnippetList;