import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  downloadText,
  parseCampaignBundle,
} from "../../../logic/bundle/campaignBundle";
import {
  DRAFT_PREFIX,
  hydrateCampaignDraft,
  makeStoredDraft,
  parseStoredDraft,
} from "../config/CampaignBundleContext";

interface DraftEntry {
  id: string;
  title: string;
  year: string;
  corrupt: boolean;
  raw?: string;
}

function listDrafts(): { drafts: DraftEntry[]; error: string | null } {
  const result: DraftEntry[] = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(DRAFT_PREFIX)) continue;
      const raw = localStorage.getItem(key) ?? "";
      try {
        const draft = parseStoredDraft(raw).draft;
        result.push({
          id: key.slice(DRAFT_PREFIX.length),
          title: draft.title || "Névtelen kampány",
          year: draft.year,
          corrupt: false,
        });
      } catch {
        result.push({
          id: key.slice(DRAFT_PREFIX.length),
          title: "Sérült vázlat – helyreállítás szükséges",
          year: "",
          corrupt: true,
          raw,
        });
      }
    }
    return { drafts: result, error: null };
  } catch {
    return {
      drafts: result,
      error:
        "A böngésző megtagadta a helyi vázlatok olvasását. Engedélyezd a webhely tárhelyét, majd próbáld újra.",
    };
  }
}

export function MainMenu() {
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const listing = useMemo(listDrafts, [revision]);
  const drafts = listing.drafts;
  const remove = (draft: DraftEntry) => {
    if (
      window.confirm(`Biztosan végleg törlöd ezt a vázlatot: „${draft.title}”?`)
    ) {
      localStorage.removeItem(`${DRAFT_PREFIX}${draft.id}`);
      setRevision((value) => value + 1);
    }
  };
  const importNew = async (file: File) => {
    const result = parseCampaignBundle(await file.text());
    if (
      !result.bundle ||
      result.diagnostics.some((item) => item.severity === "error")
    ) {
      setMessage(
        `Az import nem történt meg: ${result.diagnostics[0]?.message ?? "érvénytelen csomag"}`,
      );
      return;
    }
    const id = crypto.randomUUID();
    const draft = hydrateCampaignDraft(result.bundle);
    localStorage.setItem(
      `${DRAFT_PREFIX}${id}`,
      JSON.stringify(makeStoredDraft(draft, 1)),
    );
    window.location.assign(
      `${import.meta.env.BASE_URL}new-campaign/${id}/basics`,
    );
  };
  return (
    <main className="size-full overflow-y-auto p-6 md:p-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Nyilvános béta előkészítés
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Kampánykészítő</h1>
        <p className="mt-4 text-slate-600">
          A vázlatok csak ebben a böngészőben maradnak. Rendszeresen exportálj
          biztonsági másolatot. A sablon választási rendszere és képei zároltak;
          itt a történetet és a játszható jelöltet szerkesztheted.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-xl bg-brand-700 px-5 py-3 font-bold text-white"
            to="new-campaign"
          >
            Új kampány a sablonból
          </Link>
          <input
            ref={input}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importNew(file);
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            className="rounded-xl border px-5 py-3 font-bold"
            onClick={() => input.current?.click()}
          >
            Import új vázlatként
          </button>
        </div>
        {message && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 text-red-900"
          >
            {message}
          </p>
        )}
        {listing.error && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 text-red-900"
          >
            {listing.error}{" "}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => setRevision((value) => value + 1)}
            >
              Olvasás újrapróbálása
            </button>
          </div>
        )}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Helyi vázlatok</h2>
          {drafts.length === 0 ? (
            <p className="mt-3 text-slate-500">Még nincs mentett vázlat.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      {draft.corrupt ? (
                        <strong className="text-red-800">{draft.title}</strong>
                      ) : (
                        <Link
                          className="font-bold text-brand-700 underline"
                          to={`/new-campaign/${draft.id}/basics`}
                        >
                          {draft.title} {draft.year && `(${draft.year})`}
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {draft.corrupt && draft.raw !== undefined && (
                        <button
                          type="button"
                          className="rounded-lg border px-3 py-2 text-sm font-bold"
                          onClick={() =>
                            downloadText(
                              draft.raw ?? "",
                              `serult-vazlat-${draft.id}.json`,
                            )
                          }
                        >
                          Nyers adat letöltése
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                        onClick={() => remove(draft)}
                      >
                        {draft.corrupt ? "Sérült adat törlése" : "Törlés"}
                      </button>
                    </div>
                  </div>
                  {draft.corrupt && (
                    <p className="mt-2 text-sm text-red-800">
                      A helyreállítás nem módosítja az adatot. Előbb töltsd le
                      nyersen; újrakezdéshez töröld, majd készíts új vázlatot.
                    </p>
                  )}
                  {draft.corrupt && (
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-sm font-bold"
                      onClick={() => {
                        if (
                          window.confirm(
                            "A sérült adat törlődik, és új vázlat indul a sablonból. Előbb letöltötted a nyers helyreállítási példányt?",
                          )
                        ) {
                          localStorage.removeItem(`${DRAFT_PREFIX}${draft.id}`);
                          window.location.assign(
                            `${import.meta.env.BASE_URL}new-campaign`,
                          );
                        }
                      }}
                    >
                      Visszaállítás a sablonból
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-10 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Béta:</strong> a szerkesztés Chromium és Firefox asztali
          böngészőkre készül. Mobil szerkesztés nem támogatott. A kampány
          tartalma nem kerül feltöltésre.
        </p>
      </div>
    </main>
  );
}
