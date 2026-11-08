import { supportedLanguages } from "./languages";

export type LanguageId = (typeof supportedLanguages)[number]["id"];

export interface GameSettings {
  showAdvisorFeedback: boolean;
  language: LanguageId;
  analyticsEnabled?: boolean;
  // false once the player asked not to have new editions open by themselves.
  newspaperAutoOpen?: boolean;
}
