// src/components/snippets/SnippetCard.jsx

import { useNavigate } from 'react-router-dom';
import { MoreVertical, ExternalLink, Clock, Code } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Language icon map
const languageIcons = {
  javascript: 'JS',
  python: 'PY',
  html: 'HTML',
  css: 'CSS',
  cpp: 'C++',
};

const SnippetCard = ({ snippet }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Navigate to editor when card is clicked
  const handleCardClick = () => {
    navigate(`/editor/${snippet.id}`);
  };

  // Handle menu toggle
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-secondary rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center font-mono text-xs">
            {languageIcons[snippet.language] || <Code size={16} />}
          </div>
          <span className="font-medium truncate">{snippet.title}</span>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-md hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-background border border-border z-10">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/snippet/${snippet.id}`);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-secondary"
                >
                  <ExternalLink size={14} className="mr-2" />
                  <span>Copy share link</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, this would call your API
                    console.log('Delete snippet:', snippet.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-secondary"
                >
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Card body */}
      <div className="px-4 py-3">
        <p className="text-sm text-secondary-foreground line-clamp-2 h-10">
          {snippet.description || 'No description'}
        </p>
      </div>
      
      {/* Card footer */}
      <div className="flex items-center px-4 py-2 text-xs text-secondary-foreground border-t border-border">
        <Clock size={12} className="mr-1" />
        <span>Updated {formatDate(snippet.updatedAt)}</span>
      </div>
    </div>
  );
};

export default SnippetCard;