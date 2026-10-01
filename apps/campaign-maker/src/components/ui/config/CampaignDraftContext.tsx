import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import { RawParty } from "@/shared/types";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import type { SessionKey } from "../../../logic/application/SessionKey";

export interface BaseResultModifier {
  id: string;
  partyId: string;
  delta: number;
}

export interface CampaignDraft {
  title: string;
  year: string;
  listSeats: number;
  allSeats: number;
  thresholdPercent: number;
  districtBoost: boolean;
  baseResultModifiers: BaseResultModifier[];
  parties: RawParty[];
}

export function createEmptyCampaignDraft(): CampaignDraft {
  return {
    title: "",
    year: String(new Date().getFullYear()),
    listSeats: 93,
    allSeats: 199,
    thresholdPercent: 5,
    districtBoost: true,
    baseResultModifiers: [],
    parties: [],
  };
}

function loadCampaignDraft(
  storage: StorageEngine<SessionKey>,
  draftId: string,
): CampaignDraft | null {
  const raw = storage.getItem("draft", "localStorage", draftId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CampaignDraft;
  } catch {
    return null;
  }
}

interface CampaignDraftContextValue {
  draft: CampaignDraft;
  updateDraft: (patch: Partial<CampaignDraft>) => void;
}

const CampaignDraftContext = createContext<CampaignDraftContextValue | null>(
  null,
);

export function CampaignDraftProvider({
  draftId,
  children,
}: {
  draftId: string;
  children: React.ReactNode;
}) {
  const storage = useMemo(
    () => container.resolve<StorageEngine<SessionKey>>(StorageEngine),
    [],
  );
  const [draft, setDraft] = useState<CampaignDraft>(
    () => loadCampaignDraft(storage, draftId) ?? createEmptyCampaignDraft(),
  );

  useEffect(() => {
    storage.setItem("draft", JSON.stringify(draft), "localStorage", draftId);
  }, [storage, draftId, draft]);

  const value = useMemo<CampaignDraftContextValue>(
    () => ({
      draft,
      updateDraft: (patch) => setDraft((prev) => ({ ...prev, ...patch })),
    }),
    [draft],
  );

  return (
    <CampaignDraftContext.Provider value={value}>
      {children}
    </CampaignDraftContext.Provider>
  );
}

export function useCampaignDraft() {
  const ctx = useContext(CampaignDraftContext);
  if (!ctx) {
    throw new Error(
      "useCampaignDraft must be used within a CampaignDraftProvider",
    );
  }
  return ctx;
}
