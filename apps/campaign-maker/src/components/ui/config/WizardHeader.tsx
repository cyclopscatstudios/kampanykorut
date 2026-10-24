import { useRef } from "react";
import { downloadText } from "../../../logic/bundle/campaignBundle";
import { useCampaignDraft } from "./CampaignBundleContext";
import { slugify } from "./slugify";

export function WizardHeader() {
  const { draft, saveStatus, replaceFromText, exportText, retrySave } =
    useCampaignDraft();
  const input = useRef<HTMLInputElement>(null);
  const exportDraft = () => {
    const text = exportText();
    if (text)
      downloadText(text, `${slugify(draft.title) || "kampany"}.kampany.json`);
  };
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 font-extrabold text-white">
          K
        </div>
        <div className="truncate text-lg font-extrabold">
          Kampány<span className="text-brand-700">körút</span>
        </div>
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-500 lg:inline">
          Béta szerkesztő
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          role="status"
          aria-live="polite"
          className={
            saveStatus === "failed" || saveStatus === "conflict"
              ? "text-sm font-bold text-red-700"
              : "text-sm text-slate-500"
          }
        >
          {saveStatus === "saved"
            ? "Mentve helyben"
            : saveStatus === "failed"
              ? "Mentés sikertelen"
              : saveStatus === "conflict"
                ? "Újabb mentés van egy másik lapon – ez a lap nem ír felül"
                : "Mentés…"}
        </span>
        {saveStatus === "failed" && (
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm font-bold"
            onClick={retrySave}
          >
            Mentés újra
          </button>
        )}
        {saveStatus === "conflict" && (
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm font-bold"
            onClick={() => window.location.reload()}
          >
            Újabb változat betöltése
          </button>
        )}
        <input
          ref={input}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (
              file &&
              window.confirm(
                `A(z) „${draft.title}” vázlat tartalmát lecseréled az importált csomagra?`,
              )
            )
              void file.text().then(replaceFromText);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-bold"
          onClick={() => input.current?.click()}
        >
          Import
        </button>
        <button
          type="button"
          className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-bold text-white"
          onClick={exportDraft}
        >
          Export
        </button>
      </div>
    </header>
  );
}
