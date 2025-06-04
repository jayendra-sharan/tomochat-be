import { claudeAi, groqAi } from "@/services";
import { AiResponse, supportedLanguage } from "@/services/types";

const isProduction = process.env.NODE_ENV === "production";

export const getAiResponse = async (
  message: string,
  languageCode: supportedLanguage
): Promise<AiResponse> => {
  // const aiService = isProduction ? claudeAi : groqAi;
  const aiService = claudeAi;
  const response = await aiService(message, languageCode);
  return response;
};
