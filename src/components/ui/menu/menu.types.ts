import type { IconSource } from "../Icon";

export enum MenuItemId {
  NewGame = "newGame",
  ModMaker = "modMaker",
  Settings = "settings",
  CampaignMode = "campaignMode",
  ClassicMode = "classicMode",
  Back = "back",
}

export type MenuItem = {
  id: MenuItemId;
  text: string;
  icon?: string;
  iconSource?: IconSource;
};
