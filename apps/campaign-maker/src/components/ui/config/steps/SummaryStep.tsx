import { useState } from "react";
import { Link } from "react-router-dom";
import type { Diagnostic } from "@/shared/validation/campaignValidator";
import { useCampaignDraft } from "../CampaignBundleContext";
import { parseCampaignBundle } from "../../../../logic/bundle/campaignBundle";

const KEYS = ["playerSideVictory", "playerSideDefeat", "deadlock"] as const;
const LABELS = {
  playerSideVictory: "Győzelem",
  playerSideDefeat: "Vereség",
  deadlock: "Patthelyzet",
};

export function SummaryStep() {
  const { draftId, draft, updateDraft, diagnostics, exportText } =
    useCampaignDraft();
  const [validated, setValidated] = useState(false);
  const validate = () => {
    exportText();
    setValidated(true);
  };
  const preview = () => {
    const text = exportText();
    if (!text) return;
    const result = parseCampaignBundle(text);
    if (!result.bundle) return;
    const id = crypto.randomUUID();
    localStorage.setItem(
      `kampanykorut_maker_preview_v1-${id}`,
      JSON.stringify({
        expiresAt: Date.now() + 30 * 60 * 1000,
        bundle: result.bundle,
        returnUrl: `${window.location.origin}${import.meta.env.BASE_URL}new-campaign/${draftId}/summary`,
      }),
    );
    window.open(`/maker-preview/${id}`, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Befejezés és ellenőrzés
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Eredményszövegek</h1>
        <p className="mt-2 text-slate-600">
          A képek a sablonból változatlanul megmaradnak. Export előtt a teljes
          csomagot ugyanaz az ellenőrző vizsgálja, mint a szállított
          kampányokat.
        </p>
      </div>
      {KEYS.map((key) => {
        const ending = draft.endings[key];
        const update = (patch: Partial<typeof ending>) =>
          updateDraft({
            endings: { ...draft.endings, [key]: { ...ending, ...patch } },
          });
        return (
          <fieldset key={key} className="rounded-2xl border p-6">
            <legend className="px-2 font-bold">{LABELS[key]}</legend>
            <div className="grid gap-3">
              <input
                aria-label={`${LABELS[key]} címe`}
                className="rounded-lg border p-2"
                value={ending.title}
                onChange={(event) => update({ title: event.target.value })}
              />
              <input
                aria-label={`${LABELS[key]} alcíme`}
                className="rounded-lg border p-2"
                value={ending.subtitle}
                onChange={(event) => update({ subtitle: event.target.value })}
              />
              <textarea
                aria-label={`${LABELS[key]} leírása`}
                className="rounded-lg border p-2"
                rows={4}
                value={ending.description}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </div>
          </fieldset>
        );
      })}
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          onClick={validate}
        >
          Kampány ellenőrzése
        </button>
        <button
          type="button"
          className="rounded-xl bg-brand-700 px-5 py-3 font-bold text-white"
          onClick={preview}
        >
          Játékos előnézet
        </button>
      </div>
      <section
        aria-live="polite"
        aria-atomic="true"
        aria-label="Ellenőrzési eredmények"
      >
        {!validated ? (
          <p className="rounded-xl bg-slate-100 p-4 text-slate-800">
            Az aktuális állapot ellenőrzése még nem futott le.
          </p>
        ) : diagnostics.length === 0 ? (
          <p className="rounded-xl bg-emerald-50 p-4 text-emerald-900">
            Az ellenőrzés sikeres: nincs hiba vagy figyelmeztetés.
          </p>
        ) : (
          <ul className="space-y-2">
            {diagnostics.map((item, index) => {
              const target = diagnosticTarget(item);
              return (
                <li
                  key={`${item.code}-${index}`}
                  className={
                    item.severity === "error"
                      ? "rounded bg-red-50 p-3 text-red-900"
                      : "rounded bg-amber-50 p-3 text-amber-900"
                  }
                >
                  <strong>
                    {item.severity === "error" ? "Hiba" : "Figyelmeztetés"}:{" "}
                    {item.code}
                  </strong>{" "}
                  — {item.file}
                  {item.path}: {item.message}{" "}
                  {target ? (
                    <Link
                      className="font-bold underline"
                      to={`../materials#${target}`}
                    >
                      Ugrás a mezőhöz
                    </Link>
                  ) : (
                    <span className="block text-sm">
                      Ez a sablon zárolt részét érinti. Exportáld a vázlatot
                      helyreállításhoz, vagy indíts új vázlatot a sértetlen
                      sablonból.
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function diagnosticTarget(item: Diagnostic) {
  if (
    !item.file.includes("questions") &&
    !item.file.includes("answer_effects") &&
    !item.file.includes("advisor_feedback")
  )
    return null;
  const numbers = item.path.match(/\d+/g)?.map(Number) ?? [];
  const question = numbers[0];
  if (question === undefined) return null;
  const answer = numbers[1];
  if (answer !== undefined)
    return `question-${question}-answer-${answer}-${item.path.includes("/id") ? "id" : "label"}`;
  return `question-${question}-${item.path.includes("/id") ? "id" : item.path.includes("title") ? "title" : "question"}`;
}
