// @todo export types
// Use in FE: domains/shared/types/index.ts

import { AiResponse } from "@/services/types";

export type Sender = {
  id: string;
  displayName: string;
};

export type Suggestion = AiResponse

export type Message = {
  id: string;
  content: string;
  sender: Sender;
  suggestion: Suggestion | null;
  createdAt: string;
};
