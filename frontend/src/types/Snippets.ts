export interface Snippet {
    _id: string;
    title: string;
    content: string;
    language: string;
    isLive: boolean;
    authorId: string;
    collectionId?: string;
    collaborators: string[];
    updatedAt: string;
    createdAt: string;
  }
  
  export interface SnippetResponse {
    success: boolean;
    message?: string;
    data?: Snippet[];
  }
  
  export interface SnippetState {
    snippets: Snippet[];
    currentSnippet: Snippet | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface CreateSnippetData {
    title: string;
    language: string;
    collectionId?: string;
  }
  
  export interface UpdateSnippetData {
    id: string;
    title?: string;
    code?: string;
    language?: string;
    isLive?: boolean;
  }
  
  export interface ShareSnippetData {
    id: string;
    collaboratorIds: string[];
  }