import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CampaignDraft } from "../config/CampaignBundleContext";
import { DRAFT_PREFIX } from "../config/CampaignBundleContext";

interface DraftEntry { id: string; title: string; year: string }

function listDrafts(): DraftEntry[] {
  const result: DraftEntry[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const draft = JSON.parse(localStorage.getItem(key) ?? "") as CampaignDraft;
      result.push({ id: key.slice(DRAFT_PREFIX.length), title: draft.title || "Névtelen kampány", year: draft.year });
    } catch { result.push({ id: key.slice(DRAFT_PREFIX.length), title: "Sérült vázlat – helyreállítás szükséges", year: "" }) }
  }
  return result;
}

export function MainMenu() {
  const [revision, setRevision] = useState(0);
  const drafts = useMemo(listDrafts, [revision]);
  return <main className="size-full overflow-y-auto p-6 md:p-12">
    <div className="mx-auto max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-brand-700">Nyilvános béta előkészítés</p><h1 className="mt-2 text-4xl font-extrabold">Kampánykészítő</h1><p className="mt-4 text-slate-600">A vázlatok csak ebben a böngészőben maradnak. Rendszeresen exportálj biztonsági másolatot. A sablon választási rendszere és képei zároltak; itt a történetet és a játszható jelöltet szerkesztheted.</p>
      <Link className="mt-7 inline-flex rounded-xl bg-brand-700 px-5 py-3 font-bold text-white" to="new-campaign">Új kampány a sablonból</Link>
      <section className="mt-10"><h2 className="text-xl font-extrabold">Helyi vázlatok</h2>{drafts.length === 0 ? <p className="mt-3 text-slate-500">Még nincs mentett vázlat.</p> : <ul className="mt-4 space-y-3">{drafts.map((draft) => <li key={draft.id} className="flex items-center justify-between rounded-xl border p-4"><Link className="font-bold text-brand-700 underline" to={`/new-campaign/${draft.id}/basics`}>{draft.title} {draft.year && `(${draft.year})`}</Link><button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700" onClick={() => { if (window.confirm(`Biztosan törlöd ezt a vázlatot: „${draft.title}”?`)) { localStorage.removeItem(`${DRAFT_PREFIX}${draft.id}`); setRevision((value) => value + 1) } }}>Törlés</button></li>)}</ul>}</section>
      <p className="mt-10 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><strong>Béta:</strong> a szerkesztés Chromium és Firefox asztali böngészőkre készül. Mobil szerkesztés nem támogatott. A kampány tartalma nem kerül feltöltésre.</p>
    </div>
  </main>;
}
