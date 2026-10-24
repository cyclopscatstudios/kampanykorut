import { useCampaignDraft } from "../CampaignBundleContext";
import { parseCampaignBundle } from "../../../../logic/bundle/campaignBundle";

const KEYS = ["playerSideVictory", "playerSideDefeat", "deadlock"] as const;
const LABELS = { playerSideVictory: "Győzelem", playerSideDefeat: "Vereség", deadlock: "Patthelyzet" };

export function SummaryStep() {
  const { draft, updateDraft, diagnostics, exportText } = useCampaignDraft();
  const validate = () => { exportText() };
  const preview = () => {
    const text = exportText();
    if (!text) return;
    const result = parseCampaignBundle(text);
    if (!result.bundle) return;
    const id = crypto.randomUUID();
    localStorage.setItem(`kampanykorut_maker_preview_v1-${id}`, JSON.stringify({ expiresAt: Date.now() + 30 * 60 * 1000, bundle: result.bundle }));
    window.open(`/maker-preview/${id}`, "_blank", "noopener,noreferrer");
  };
  return <div className="flex max-w-4xl flex-col gap-6">
    <div><p className="text-sm font-bold uppercase tracking-wide text-brand-700">Befejezés és ellenőrzés</p><h1 className="mt-2 text-3xl font-extrabold">Eredményszövegek</h1><p className="mt-2 text-slate-600">A képek a sablonból változatlanul megmaradnak. Export előtt a teljes csomagot ugyanaz az ellenőrző vizsgálja, mint a szállított kampányokat.</p></div>
    {KEYS.map((key) => { const ending = draft.endings[key]; const update = (patch: Partial<typeof ending>) => updateDraft({ endings: { ...draft.endings, [key]: { ...ending, ...patch } } }); return <fieldset key={key} className="rounded-2xl border p-6"><legend className="px-2 font-bold">{LABELS[key]}</legend><div className="grid gap-3"><input aria-label={`${LABELS[key]} címe`} className="rounded-lg border p-2" value={ending.title} onChange={(event) => update({ title: event.target.value })} /><input aria-label={`${LABELS[key]} alcíme`} className="rounded-lg border p-2" value={ending.subtitle} onChange={(event) => update({ subtitle: event.target.value })} /><textarea aria-label={`${LABELS[key]} leírása`} className="rounded-lg border p-2" rows={4} value={ending.description} onChange={(event) => update({ description: event.target.value })} /></div></fieldset> })}
    <div className="flex gap-3"><button type="button" className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={validate}>Kampány ellenőrzése</button><button type="button" className="rounded-xl bg-brand-700 px-5 py-3 font-bold text-white" onClick={preview}>Játékos előnézet</button></div>
    <section aria-live="polite" aria-label="Ellenőrzési eredmények">{diagnostics.length === 0 ? <p className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Nincs megjeleníthető hiba. Kattints az ellenőrzésre az aktuális állapot vizsgálatához.</p> : <ul className="space-y-2">{diagnostics.map((item, index) => <li key={`${item.code}-${index}`} className={item.severity === "error" ? "rounded bg-red-50 p-3 text-red-900" : "rounded bg-amber-50 p-3 text-amber-900"}><strong>{item.code}</strong> — {item.file}{item.path}: {item.message}</li>)}</ul>}</section>
  </div>;
}
