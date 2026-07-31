import type { IconSource } from "../Icon";

export enum MenuItemId {
  // kampanykorut
  NewGame = "newGame",
  Settings = "settings",
  CampaignMode = "campaignMode",
  ClassicMode = "classicMode",
  LoadSavedGame = "laodSavedGame",
  SideSelector = "sideSelector",
  // campaign-maker
  CampaignMaker = "campaignMaker",
  // shared
  Back = "back",
}

export type MenuItem = {
  id: MenuItemId;
  text: string;
  path: string;
  icon?: string;
  iconSource?: IconSource;
  description?: string;
  disabled?: boolean;
};
