import axios from "axios";
import dotenv from "dotenv";
import { AiResponse, supportedLanguage } from "./types";
import { getSystemPrompt } from "./getSystemPrompt";

dotenv.config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const BASE_URL =
  process.env.CLAUDE_BASE_URL || "https://api.anthropic.com/v1/messages";

export async function getAIResponse(
  message: string,
  languageCode: supportedLanguage
): Promise<AiResponse> {
  const messages = [{ role: "user", content: message }];

  const MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: MODEL,
        max_tokens: 1024,
        temperature: 0,
        messages: messages,
        system: getSystemPrompt(languageCode),
      },
      {
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data?.content?.[0]?.text;

    if (!text) throw new Error("Empty response from Claude");

    const result: AiResponse = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("Claude API error:", error?.response?.data || error.message);
    throw error;
  }
}
