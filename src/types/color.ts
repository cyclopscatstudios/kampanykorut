export type Colors = "emerald" | "red" | "blue";

export enum PartyName {
  EllenzekiOsszefogas = "ellenzeki_osszefogas",
  Fidesz = "fidesz",
  Mkkp = "mkkp",
  MiHazank = "mi_hazank",
  MegoldasMozgalom = "megoldas_mozgalom",
  NormalisElet = "normalis_elet",
  Munkaspart = "munkaspart",
  Fuggetlen = "fuggetlen",
}

export const partyColors: Record<PartyName, string> = {
  [PartyName.EllenzekiOsszefogas]: "#20b2aa",
  [PartyName.Fidesz]: "#ff6a00",
  [PartyName.MiHazank]: "#688d1b",
  [PartyName.Mkkp]: "#6A994E",
  [PartyName.MegoldasMozgalom]: "#577590",
  [PartyName.NormalisElet]: "#9D4EDD",
  [PartyName.Munkaspart]: "#B7094C",
  [PartyName.Fuggetlen]: "#6C757D",
};
