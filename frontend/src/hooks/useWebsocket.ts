import { useContext, useEffect, useState } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

/**
 * Custom hook for using WebSocket functionality in components
 * @param {string} snippetId - Optional snippet ID to join on mount
 * @returns {Object} WebSocket functions and state
 */
export function useWebSocket(snippetId = null) {
  const context = useContext(WebSocketContext);
  const [codeUpdates, setCodeUpdates] = useState(null);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  const { connected, collaborators, joinSnippet, sendCodeChange, addListener } = context;
  
  useEffect(() => {
    if (snippetId) {
      joinSnippet(snippetId);
      
      // Listen for code updates for this snippet
      const removeListener = addListener('code-update', (data) => {
        setCodeUpdates(data.code);
      });
      
      return () => {
        removeListener();
      };
    }
  }, [snippetId, joinSnippet, addListener]);
  
  return {
    connected,
    collaborators,
    joinSnippet,
    sendCodeChange,
    codeUpdates,
    addListener,
  };
}