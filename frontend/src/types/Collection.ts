export interface Collection {
    _id: string;
    name: string;
    description?: string;
    ownerId: string;
    snippetIds: string[];
    sharedWith: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CollectionResponse {
    success: boolean;
    message: string;
    data?: Collection | Collection[];
  }
  
  export interface CreateCollectionData {
    name: string;
    description?: string;
  }
  
  export interface UpdateCollectionData {
    id: string;
    name?: string;
    description?: string;
  }
  
  export interface ShareCollectionData {
    id: string;
    userIds: string[];
  }
  
  export interface AddSnippetData {
    id: string;
    snippetId: string;
  }
  
  export interface CollectionState {
    collections: Collection[];
    selectedCollection: Collection | null;
    isLoading: boolean;
    error: string | null;
  }
  
