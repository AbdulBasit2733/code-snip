// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import SnippetList from '../components/snippets/SnippetList';

const Dashboard = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch snippets (in a real app, this would call your API)
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setSnippets([
            {
              id: '1',
              title: 'React Component Example',
              language: 'javascript',
              description: 'A simple React functional component',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            },
            {
              id: '2',
              title: 'Python Data Processing',
              language: 'python',
              description: 'Script for processing CSV data',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            },
            {
              id: '3',
              title: 'CSS Animation',
              language: 'css',
              description: 'CSS animation examples',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            },
            {
              id: '4',
              title: 'API Router',
              language: 'javascript',
              description: 'Express.js API router setup',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            },
            {
              id: '5',
              title: 'HTML Template',
              language: 'html',
              description: 'Basic HTML5 template with semantic elements',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            },
            {
              id: '6',
              title: 'C++ Algorithm',
              language: 'cpp',
              description: 'Implementation of quicksort algorithm',
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
            },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching snippets:', error);
        setLoading(false);
      }
    };

    fetchSnippets();
  }, []);

  // Filter snippets based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSnippets(snippets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.language.toLowerCase().includes(query)
    );

    setFilteredSnippets(filtered);
  }, [searchQuery, snippets]);

  // Create a new snippet
  const handleCreateSnippet = async () => {
    try {
      // In a real app, this would create a new snippet via API
      // For now, just navigate to a new ID
      const newId = Math.random().toString(36).substr(2, 9);
      navigate(`/editor/${newId}`);
    } catch (error) {
      console.error('Error creating snippet:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">My Snippets</h1>
        
        <button
          onClick={handleCreateSnippet}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary/80 text-primary-foreground"
        >
          <Plus size={16} />
          <span>New Snippet</span>
        </button>
      </div>
      
      {/* Search bar */}
      <div className="px-6 py-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search snippets..."
        />
      </div>
      
      {/* Snippet list */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-secondary-foreground">Loading snippets...</div>
          </div>
        ) : filteredSnippets.length > 0 ? (
          <SnippetList snippets={filteredSnippets} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Search size={48} className="text-secondary mb-4" />
            <h2 className="text-xl font-medium mb-2">No snippets found</h2>
            <p className="text-secondary-foreground">
              {searchQuery
                ? "We couldn't find any snippets matching your search."
                : "You don't have any snippets yet. Create one to get started!"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;