// src/contexts/WebSocketContext.jsx

import { createContext, useEffect, useState, useCallback } from 'react';
import socketManager from '../lib/socket';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  
  // Connect to the WebSocket server when the component mounts
  useEffect(() => {
    // Set up listener for connection status
    const disconnectListener = socketManager.addListener('disconnect', () => {
      setConnected(false);
    });
    
    const connectListener = socketManager.addListener('connect', () => {
      setConnected(true);
    });
    
    // Set up listener for collaborator updates
    const collaboratorsListener = socketManager.addListener('collaborators', (data) => {
      if (data.users) {
        setCollaborators(data.users);
      }
    });
    
    // Connect to the WebSocket server
    socketManager.connect();
    
    // Clean up listeners when the component unmounts
    return () => {
      disconnectListener();
      connectListener();
      collaboratorsListener();
    };
  }, []);
  
  // Join a snippet's collaboration session
  const joinSnippet = useCallback((snippetId) => {
    socketManager.joinSnippet(snippetId);
  }, []);
  
  // Send code changes for a snippet
  const sendCodeChange = useCallback((snippetId, code) => {
    socketManager.sendCodeChange(snippetId, code);
  }, []);
  
  // Add a listener for a specific message type
  const addListener = useCallback((type, callback) => {
    return socketManager.addListener(type, callback);
  }, []);
  
  return (
    <WebSocketContext.Provider
      value={{
        connected,
        collaborators,
        joinSnippet,
        sendCodeChange,
        addListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};