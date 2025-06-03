export type supportedLanguage =
  | "nl-NL"
  | "es-ES"
  | "uk-UA"
  | "el-GR"
  | "hi-IN"
  | "fa-IR"
  | "it-IT"
  | "de-DE"
  | "fr-FR"
  | "pl-PL"
  | "ro-RO"
  | "pt-PT";

export type AiResponse = {
  isMessageOk: boolean;
  original: string;
  fixedMessage?: string;
  fixLogic?: string;
  translated?: string;
};
