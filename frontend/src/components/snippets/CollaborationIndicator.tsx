// src/components/snippets/CollaborationIndicator.jsx

import { Users, Wifi, WifiOff, Edit } from 'lucide-react';

const CollaborationIndicator = ({ connected, collaborators = [], isTyping = false }) => {
  // Filter out the current user (if present in the collaborators list)
  // This assumes your backend sends the user ID with each collaborator
  const otherCollaborators = collaborators.filter(c => !c.isSelf);
  
  return (
    <div className="flex items-center gap-3">
      {/* Display typing indicator */}
      {isTyping && (
        <div className="flex items-center text-xs text-green-400">
          <Edit size={14} className="mr-1" />
          <span>Editing...</span>
        </div>
      )}
      
      {/* Display connection status */}
      <div className="flex items-center">
        {connected ? (
          <Wifi size={16} className="text-green-400" />
        ) : (
          <WifiOff size={16} className="text-red-400" />
        )}
      </div>
      
      {/* Display collaborator count and avatars */}
      {otherCollaborators.length > 0 && (
        <div className="flex items-center">
          <Users size={16} className="text-blue-400 mr-1" />
          <span className="text-xs text-secondary-foreground">
            {otherCollaborators.length}
          </span>
          
          <div className="flex -space-x-2 ml-2">
            {otherCollaborators.slice(0, 3).map((collaborator, index) => (
              <div 
                key={index}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground border border-background"
                title={collaborator.name || `User ${index + 1}`}
              >
                {(collaborator.name || 'U')[0].toUpperCase()}
              </div>
            ))}
            
            {otherCollaborators.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-secondary-foreground border border-background">
                +{otherCollaborators.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationIndicator;