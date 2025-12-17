import {
  partyActiveColor,
  partyColors,
  partyHoverColor,
  PartyName,
} from "../../types/color";

export function getPartyColor(party: PartyName): string {
  return partyColors[party];
}

export function getPartyHoverColor(party: PartyName): string {
  return partyHoverColor[party];
}

export function getPartyActiveColor(party: PartyName): string {
  return partyActiveColor[party];
}
