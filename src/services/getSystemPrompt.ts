import { basePrompt } from "./basePrompt"
import { getSample } from "./samples"
import { supportedLanguage } from "./types"

const languageMap: Record<supportedLanguage, string> = {
  "nl-NL": "Dutch",
  "es-ES": "Spanish",
  "uk-UA": "Ukranian",
  "el-GR": "Greek",
  "hi-IN": "Hindi",
  "fa-IR": "Farsi",
  "it-IT": "Italian",
  "fr-FR": "French",
  "de-DE": "Deutsch"
}


export const getSystemPrompt = (languageCode: supportedLanguage) => {
  const regex = /{{TARGET_LANGUAGE}}/g;
  return basePrompt.replace(regex, languageMap[languageCode]).replace("{{TARGET_LANGUAGE_SAMPLES}}", getSample(languageCode))
}
