// @todo export types
// Use in FE: domains/shared/types/index.ts

export type Sender = {
  id: string;
  displayName: string;
};

export type Suggestion = {
  original: string;
  aiReply: string;
  english: string;
  improved: string;
  issues?: string[]
}

export type Message = {
  id: string;
  content: string;
  sender: Sender;
  suggestion: Suggestion | null;
  createdAt: string;
};
