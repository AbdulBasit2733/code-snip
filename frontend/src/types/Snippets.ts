import type { User } from "./User";

interface collaborators {
  _id:string;
  permission:"view" | "edit",
  user:User
}
interface collection {
  _id:string
  name:string;
  description:string;

}

interface ActiveUsers {
  _id:string
}

interface LiveSession {
  isLive:boolean;
  activeUsers: ActiveUsers[]
}
export interface Snippet {
  _id: string;
  title: string;
  content: string;
  language: string;
  liveSession: LiveSession | null;
  authorId: string;
  collection?: collection | null ;
  collaborators: collaborators[] | [];
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

interface Collab {
  user: String;
  permission: "view" | "edit";
}

export interface ShareSnippetData {
  id: string;
  collaborators: Collab[] | [];
}
