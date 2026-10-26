import { useCampaignDraft } from "../CampaignBundleContext";
import { useFocusHash } from "../useFocusHash";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  id: string;
}) {
  const className =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea
          id={id}
          className={className}
          rows={5}
          maxLength={20000}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={className}
          maxLength={200}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function CandidateStep() {
  useFocusHash();
  const { draft, updateDraft } = useCampaignDraft();
  const update = (patch: Partial<typeof draft.candidate>) =>
    updateDraft({ candidate: { ...draft.candidate, ...patch } });
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Jelölt
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          A játszható oldal és jelölt
        </h1>
        <p className="mt-2 text-slate-600">
          A sablon választási rendszere és azonosítói zároltak. A játékosnak
          megjelenő szövegeket szerkesztheted.
        </p>
      </div>
      <section className="grid gap-5 rounded-2xl border border-slate-200 p-8 shadow-sm">
        <Field
          id="side-label"
          label="Párt megjelenő neve"
          value={draft.candidate.sideLabel}
          onChange={(sideLabel) => update({ sideLabel })}
        />
        <Field
          id="side-description"
          label="Párt bemutatása"
          multiline
          value={draft.candidate.sideDescription}
          onChange={(sideDescription) => update({ sideDescription })}
        />
        <Field
          id="candidate-label"
          label="Jelölt neve"
          value={draft.candidate.candidateLabel}
          onChange={(candidateLabel) => update({ candidateLabel })}
        />
        <Field
          id="candidate-description"
          label="Jelölt bemutatása"
          multiline
          value={draft.candidate.candidateDescription}
          onChange={(candidateDescription) => update({ candidateDescription })}
        />
      </section>
    </div>
  );
}
