import { groqAi } from "@/services"

export const getAiResponse = async (message: string) => {
  const response = await groqAi(message);
  const aiReply = response.aiReply;
  return {
    original: message,
    ...response
  }
}
