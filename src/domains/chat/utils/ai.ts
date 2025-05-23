import { groqAi } from "@/services"
type AIResponse = {
  issues: string[];
  improved: string;
  english: string;
  aiReply: string;
  original: string;
}
export const getAiResponse = async (message: string): Promise<AIResponse> => {
  const response = await groqAi(message);
  return {
    original: message,
    ...response
  }
}
