import type { CampaignState } from "@shared/types";
import { useEffect, useState } from "react";
import { useCheatSettings } from "./cheatStore";

export interface WinningLine {
  name: string;
  side: string;
  focuses: string[];
  strategy?: string;
  governments: { partners: string[]; outcome: string }[];
  answers: Record<string, string>;
}

interface WinningPathsFile {
  campaign: string;
  lines: WinningLine[];
}

const files = import.meta.glob<WinningPathsFile>(
  "@shared/validation/winningPaths/*.json",
  { import: "default" },
);

const cache = new Map<string, Promise<WinningLine[]>>();

function loadLines(campaignId: string): Promise<WinningLine[]> {
  const loader = Object.entries(files).find(
    ([path]) =>
      toFileKey(path.split("/").pop()!) === toFileKey(`${campaignId}.json`),
  )?.[1];
  if (!loader) {
    return Promise.resolve([]);
  }
  if (!cache.has(campaignId)) {
    cache.set(
      campaignId,
      loader().then((file) => file.lines),
    );
  }
  return cache.get(campaignId)!;
}

function toFileKey(name: string) {
  return name.replaceAll("-", "_");
}

export function getSideKey(state?: CampaignState) {
  const side = state?.playerSide;
  if (!state || !side) {
    return undefined;
  }
  return `${state.activeCampaignId}|${side.partyId}/${side.candidateId ?? ""}`;
}

export function useSideLines(state?: CampaignState) {
  const [loaded, setLoaded] = useState<{ key: string; lines: WinningLine[] }>();
  const campaignId = state?.activeCampaignId;
  const side = state?.playerSide
    ? `${state.playerSide.partyId}/${state.playerSide.candidateId ?? ""}`
    : undefined;
  const key = campaignId && side ? `${campaignId}|${side}` : undefined;

  useEffect(() => {
    if (!campaignId || !side || !key) {
      return;
    }
    let active = true;
    loadLines(campaignId).then((all) => {
      if (active) {
        setLoaded({ key, lines: all.filter((line) => line.side === side) });
      }
    });
    return () => {
      active = false;
    };
  }, [campaignId, side, key]);

  return loaded && loaded.key === key ? loaded.lines : [];
}

export function useFollowedLine(state?: CampaignState) {
  const settings = useCheatSettings();
  const lines = useSideLines(
    settings.enabled && settings.followPath ? state : undefined,
  );
  const key = getSideKey(state);
  if (!settings.enabled || !settings.followPath || !key) {
    return undefined;
  }
  return lines.find((line) => line.name === settings.selectedLines[key]);
}
