import { CampaignDraft } from "./CampaignDraftContext";

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
    parties: draft.parties,
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
