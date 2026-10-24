import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { RawParty } from "@/shared/types";
import type { Diagnostic } from "@/shared/validation/campaignValidator";
import { type CampaignBundle, parseCampaignBundle, serializeCampaignBundle } from "../../../logic/bundle/campaignBundle";
import { loadStarterBundle } from "../../../logic/bundle/starterBundle";

export const DRAFT_PREFIX = "kampanykorut_maker_draft_v1-";
const ELECTION = "election_config.json";
const QUESTIONS = "tisza/magyar_peter/2026_tisza_questions.json";
const EFFECTS = "tisza/magyar_peter/2026_tisza_answer_effects.json";
const FEEDBACK = "tisza/magyar_peter/2026_tisza_advisor_feedback.json";
const ENDINGS = "tisza/magyar_peter/end_results.json";
export const OTHER_PARTY_ID = "_other";

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("A sablon szerkezete nem támogatott.");
  return value as Json;
};
const arr = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) throw new Error("A sablon szerkezete nem támogatott.");
  return value;
};
const str = (value: unknown) => typeof value === "string" ? value : "";
const num = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;

export interface BaseResultModifier { id: string; partyId: string; delta: number }
export interface DraftParty extends RawParty { votes: number; isIdCustom: boolean }
export interface DraftAnswer { id: string; label: string; feedback: string; effects: Record<string, number> }
export interface DraftQuestion { id: string; title: string; question: string; answers: DraftAnswer[] }
export interface DraftEnding { title: string; subtitle: string; description: string }
export interface CampaignDraft {
  bundle: CampaignBundle;
  title: string;
  year: string;
  listSeats: number;
  allSeats: number;
  thresholdPercent: number;
  districtBoost: boolean;
  baseResultModifiers: BaseResultModifier[];
  parties: DraftParty[];
  candidate: { sideLabel: string; sideDescription: string; candidateLabel: string; candidateDescription: string };
  questions: DraftQuestion[];
  endings: Record<"playerSideVictory" | "playerSideDefeat" | "deadlock", DraftEnding>;
}

export function hydrateCampaignDraft(bundle: CampaignBundle): CampaignDraft {
  const election = obj(bundle.files[ELECTION]);
  const side = obj(arr(election.playableSides)[0]);
  const candidate = obj(arr(side.mainCandidates)[0]);
  const feedback = new Map(arr(bundle.files[FEEDBACK]).map((value) => { const item = obj(value); return [str(item.questionId), item] as const }));
  const effects = new Map(arr(bundle.files[EFFECTS]).map((value) => { const item = obj(value); return [str(item.id), item] as const }));
  const questions = arr(bundle.files[QUESTIONS]).map((value) => {
    const question = obj(value);
    const id = str(question.id);
    return {
      id,
      title: str(question.title),
      question: str(question.question),
      answers: arr(question.possibleAnswers).map((answerValue) => {
        const answer = obj(answerValue);
        const answerId = str(answer.id);
        const feedbackAnswer = arr(feedback.get(id)?.answers ?? []).map(obj).find((item) => item.answerId === answerId);
        const effectAnswer = arr(effects.get(id)?.answers ?? []).map(obj).find((item) => item.id === answerId);
        const uniform = arr(effectAnswer?.effects ?? []).map(obj).find((item) => item.type === "uniform-swing");
        return { id: answerId, label: str(answer.label), feedback: str(feedbackAnswer?.text), effects: Object.fromEntries(Object.entries(uniform ? obj(uniform.params) : {}).map(([party, amount]) => [party, num(amount)])) };
      }),
    };
  });
  const baseResults = obj(election.baseResults);
  const sideResults = obj(baseResults[str(side.id)] ?? baseResults);
  const votes = obj(election.partyListVotes);
  const endingData = obj(bundle.files[ENDINGS]);
  const ending = (key: "playerSideVictory" | "playerSideDefeat" | "deadlock") => {
    const value = obj(endingData[key]);
    return { title: str(value.title), subtitle: str(value.subtitle), description: str(value.description) };
  };
  const parties = arr(election.parties).map((value) => {
    const party = obj(value);
    const id = str(party.id);
    return { id, name: str(party.name), color: str(party.color), votes: num(votes[id]), isIdCustom: true };
  });
  parties.push({ id: OTHER_PARTY_ID, name: "Egyéb", color: "#6C757D", votes: num(votes[OTHER_PARTY_ID]), isIdCustom: true });
  return {
    bundle, title: str(election.title), year: str(election.year), listSeats: num(election.listSeats), allSeats: num(election.allSeats), thresholdPercent: num(election.thresholdPercent), districtBoost: election.districtBoost === true,
    baseResultModifiers: Object.entries(sideResults).map(([partyId, amount]) => ({ id: partyId, partyId, delta: num(amount) })), parties,
    candidate: { sideLabel: str(side.label), sideDescription: str(side.description), candidateLabel: str(candidate.label), candidateDescription: str(candidate.description) },
    questions, endings: { playerSideVictory: ending("playerSideVictory"), playerSideDefeat: ending("playerSideDefeat"), deadlock: ending("deadlock") },
  };
}

export function assembleCampaignBundle(draft: CampaignDraft): CampaignBundle {
  const files = structuredClone(draft.bundle.files);
  const election = obj(files[ELECTION]);
  const side = obj(arr(election.playableSides)[0]);
  const candidate = obj(arr(side.mainCandidates)[0]);
  Object.assign(side, { label: draft.candidate.sideLabel, description: draft.candidate.sideDescription });
  Object.assign(candidate, { label: draft.candidate.candidateLabel, description: draft.candidate.candidateDescription });
  Object.assign(election, {
    title: draft.title,
    year: draft.year,
    parties: draft.parties.filter((party) => party.id !== OTHER_PARTY_ID).map(({ id, name, color }) => ({ id, name, color })),
    partyListVotes: Object.fromEntries(draft.parties.map((party) => [party.id, party.votes])),
    baseResults: { [str(side.id)]: Object.fromEntries(draft.baseResultModifiers.map((modifier) => [modifier.partyId, modifier.delta])) },
  });
  files[QUESTIONS] = draft.questions.map((question) => ({ id: question.id, title: question.title, question: question.question, possibleAnswers: question.answers.map(({ id, label }) => ({ id, label })) }));
  files[EFFECTS] = draft.questions.map((question) => ({ id: question.id, answers: question.answers.map((answer) => ({ id: answer.id, effects: [{ type: "uniform-swing", params: answer.effects }] })) }));
  files[FEEDBACK] = draft.questions.map((question) => ({ questionId: question.id, answers: question.answers.map((answer) => ({ answerId: answer.id, text: answer.feedback })) }));
  const oldEndings = obj(files[ENDINGS]);
  files[ENDINGS] = Object.fromEntries(Object.entries(draft.endings).map(([key, value]) => [key, { ...obj(oldEndings[key]), ...value }]));
  return { ...draft.bundle, files };
}

type SaveStatus = "loading" | "saved" | "failed";
interface ContextValue {
  draft: CampaignDraft | null;
  error: string | null;
  saveStatus: SaveStatus;
  diagnostics: Diagnostic[];
  updateDraft: (patch: Partial<CampaignDraft>) => void;
  replaceFromText: (text: string) => boolean;
  exportText: () => string | null;
}
const Context = createContext<ContextValue | null>(null);

export function CampaignDraftProvider({ draftId, children }: { draftId: string; children: React.ReactNode }) {
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const loaded = useRef(false);
  useEffect(() => {
    let active = true;
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
    void (async () => {
      try {
        const next = raw ? JSON.parse(raw) as CampaignDraft : hydrateCampaignDraft(await loadStarterBundle());
        if (active) { setDraft(next); setSaveStatus("saved"); loaded.current = true; }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "A vázlat nem tölthető be."); }
    })();
    return () => { active = false };
  }, [draftId]);
  useEffect(() => {
    if (!draft || !loaded.current) return;
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(draft)); setSaveStatus("saved") }
      catch { setSaveStatus("failed") }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draft, draftId]);
  const updateDraft = useCallback((patch: Partial<CampaignDraft>) => { setSaveStatus("loading"); setDraft((old) => old ? { ...old, ...patch } : old) }, []);
  const replaceFromText = useCallback((text: string) => {
    const result = parseCampaignBundle(text);
    setDiagnostics(result.diagnostics);
    if (!result.bundle || result.diagnostics.some((item) => item.severity === "error")) return false;
    setDraft(hydrateCampaignDraft(result.bundle));
    return true;
  }, []);
  const exportText = useCallback(() => {
    if (!draft) return null;
    const text = serializeCampaignBundle(assembleCampaignBundle(draft));
    const result = parseCampaignBundle(text);
    setDiagnostics(result.diagnostics);
    return result.diagnostics.some((item) => item.severity === "error") ? null : text;
  }, [draft]);
  const value = useMemo(() => ({ draft, error, saveStatus, diagnostics, updateDraft, replaceFromText, exportText }), [draft, error, saveStatus, diagnostics, updateDraft, replaceFromText, exportText]);
  if (error) return <div role="alert" className="m-8 rounded-xl border border-red-300 bg-red-50 p-6 text-red-900">{error}</div>;
  if (!draft) return <div role="status" className="p-8">A kezdősablon betöltése…</div>;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCampaignDraft() {
  const value = useContext(Context);
  if (!value?.draft) throw new Error("CampaignDraftProvider is required");
  return { ...value, draft: value.draft };
}
