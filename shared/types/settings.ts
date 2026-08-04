import { supportedLanguages } from "./languages";

export type LanguageId = (typeof supportedLanguages)[number]["id"];

export interface GameSettings {
  showAdvisorFeedback: boolean;
  language: LanguageId;
}
