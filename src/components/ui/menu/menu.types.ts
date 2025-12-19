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
};