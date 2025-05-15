class SocketManager {
    constructor() {
      this.socket = null;
      this.listeners = new Map();
      this.snippetId = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 1000;
    }
  
    /**
     * Connect to the WebSocket server
     */
    connect() {
      if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
        return;
      }
  
      // Replace with your actual WebSocket server URL in production
      const wsUrl = import.meta.env.PROD 
        ? `wss://${window.location.host}` 
        : 'ws://localhost:5000';
      
      this.socket = new WebSocket(wsUrl);
  
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        
        // If we were previously connected to a snippet, rejoin it
        if (this.snippetId) {
          this.joinSnippet(this.snippetId);
        }
        
        this.notifyListeners('connect', { connected: true });
      };
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
  
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        this.notifyListeners('disconnect', { 
          code: event.code,
          reason: event.reason
        });
  
        // Try to reconnect unless the connection was closed intentionally
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
          
          setTimeout(() => this.connect(), delay);
        }
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', { error });
      };
    }
  
    /**
     * Join a specific snippet for collaboration
     * @param {string} snippetId - The ID of the snippet to join
     */
    joinSnippet(snippetId) {
      if (!snippetId) return;
      
      this.snippetId = snippetId;
      
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({
          type: 'join',
          snippetId
        });
      }
    }
  
    /**
     * Send a code change to the server for a specific snippet
     * @param {string} snippetId - The ID of the snippet being edited
     * @param {string} code - The updated code content
     */
    sendCodeChange(snippetId, code) {
      this.send({
        type: 'code-change',
        snippetId,
        code
      });
    }
  
    /**
     * Send data through the WebSocket connection
     * @param {Object} data - The data to send
     */
    send(data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
      } else {
        console.warn('Cannot send data: WebSocket is not connected');
        this.connect(); // Try to reconnect
      }
    }
  
    /**
     * Register a listener for specific message types
     * @param {string} type - The message type to listen for
     * @param {Function} callback - Function to call when messages arrive
     */
    addListener(type, callback) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type).add(callback);
      
      return () => this.removeListener(type, callback);
    }
  
    /**
     * Remove a listener for a specific message type
     * @param {string} type - The message type
     * @param {Function} callback - The callback to remove
     */
    removeListener(type, callback) {
      if (this.listeners.has(type)) {
        this.listeners.get(type).delete(callback);
      }
    }
  
    /**
     * Notify all listeners of a specific message type
     * @param {string} type - The message type
     * @param {Object} data - The message data
     */
    notifyListeners(type, data) {
      if (this.listeners.has(type)) {
        this.listeners.get(type).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in ${type} listener:`, error);
          }
        });
      }
    }
  
    /**
     * Close the WebSocket connection
     */
    disconnect() {
      if (this.socket) {
        this.socket.close(1000, 'User disconnected');
        this.socket = null;
      }
    }
  }
  
  // Create a singleton instance
  const socketManager = new SocketManager();
  
  export default socketManager;