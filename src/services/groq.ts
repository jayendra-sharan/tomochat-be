import axios from "axios";
import dotenv from "dotenv";
import { getSystemPrompt } from "./getSystemPrompt";
import { supportedLanguage } from "./types";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions';

export async function getAIResponse(message:string, languageCode: supportedLanguage) {
  const messages = [];
  const systemPrompt = getSystemPrompt(languageCode);

  console.log("System prompt", systemPrompt);

  messages.push({ role: 'system', content: systemPrompt});

  messages.push({ role: 'user', content: message });

  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    )
  
    console.log("AI response", response.data.choices[0].message.content.trim())
    return JSON.parse(response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error(error);
    throw new Error("Error in communicating with Groq");
  }
  
}
