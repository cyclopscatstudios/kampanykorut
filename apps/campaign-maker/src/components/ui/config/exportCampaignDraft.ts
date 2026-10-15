import { CampaignDraft, OTHER_PARTY_ID } from "./CampaignDraftContext";
import { slugify } from "./slugify";

export function downloadCampaignDraft(draft: CampaignDraft) {
  const baseResults = draft.baseResultModifiers.reduce<Record<string, number>>(
    (acc, modifier) => {
      const party = draft.parties.find((p) => p.id === modifier.partyId);
      if (party) acc[party.id] = modifier.delta;
      return acc;
    },
    {},
  );

  const payload = {
    title: draft.title,
    year: draft.year,
    listSeats: draft.listSeats,
    allSeats: draft.allSeats,
    thresholdPercent: draft.thresholdPercent,
    districtBoost: draft.districtBoost,
    baseResults,
    parties: draft.parties
      .filter((party) => party.id !== OTHER_PARTY_ID)
      .map(({ id, name, color }) => ({ id, name, color })),
    partyListVotes: Object.fromEntries(
      draft.parties.map((party) => [party.id, party.votes]),
    ),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(draft.title) || "election_config"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
