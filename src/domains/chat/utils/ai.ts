import { claudeAi, groqAi } from "@/services"
import { AiResponse, supportedLanguage } from "@/services/types";

export const getAiResponse = async (message: string, languageCode: supportedLanguage): Promise<AiResponse> => {
  // const response = await claudeAi(message, languageCode);
  const response = await groqAi(message, languageCode);
  return response;
}
