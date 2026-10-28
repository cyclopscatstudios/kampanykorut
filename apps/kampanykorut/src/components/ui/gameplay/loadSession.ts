import { t } from "i18next";
import { container } from "tsyringe";
import {
  type SavedCampaignSessionInfo,
  StateEngine,
} from "@/logic/application";
import { toaster } from "./toaster";

export function loadSession(session: SavedCampaignSessionInfo | null) {
  if (!container.resolve(StateEngine).loadState(session)) {
    toaster(t("loadSavedGamesMenu.loadFailed"), "Error");
  }
}
