import { useLocation } from "react-router-dom";
import { Icon } from "@/shared/ui";
import { useTranslate } from "@/shared/logic/hooks";
import { FormField } from "../../form/FormField";
import { NumberInput } from "../../form/NumberInput";
import { TextInput } from "../../form/TextInput";
import {
  type DraftParty,
  OTHER_PARTY_ID,
  useCampaignDraft,
} from "../CampaignBundleContext";
import { slugify } from "../slugify";
import { getStepIndexFromPath } from "../wizardSteps";
import { WizardStepEyebrow } from "../WizardStepEyebrow";
import { useFocusHash } from "../useFocusHash";

const DEFAULT_PARTY_COLOR = "#4285F4";

function getUniqueId(base: string, takenIds: Set<string>): string {
  if (!base || !takenIds.has(base)) return base;
  let suffix = 2;
  while (takenIds.has(`${base}_${suffix}`)) suffix++;
  return `${base}_${suffix}`;
}

export function PartiesStep() {
  useFocusHash();
  const { draft, updateDraft } = useCampaignDraft();
  const t = useTranslate();
  const location = useLocation();
  const stepIndex = getStepIndexFromPath(location.pathname);

  const otherIds = (index: number) =>
    new Set(draft.parties.filter((_, i) => i !== index).map((p) => p.id));

  const addParty = () => {
    updateDraft({
      parties: [
        ...draft.parties,
        {
          id: "",
          name: "",
          color: DEFAULT_PARTY_COLOR,
          votes: 0,
          isIdCustom: false,
        },
      ],
    });
  };

  const updateParty = (index: number, patch: Partial<DraftParty>) => {
    const previous = draft.parties[index];
    const next = { ...previous, ...patch };

    // keep references to the party in sync when its id changes
    const baseResultModifiers =
      next.id === previous.id
        ? draft.baseResultModifiers
        : draft.baseResultModifiers.map((m) =>
            m.partyId === previous.id ? { ...m, partyId: next.id } : m,
          );

    updateDraft({
      parties: draft.parties.map((p, i) => (i === index ? next : p)),
      baseResultModifiers,
    });
  };

  const updateName = (index: number, name: string) => {
    const party = draft.parties[index];
    updateParty(index, {
      name,
      ...(party.isIdCustom
        ? {}
        : { id: getUniqueId(slugify(name), otherIds(index)) }),
    });
  };

  const removeParty = (index: number) => {
    const { id } = draft.parties[index];
    updateDraft({
      parties: draft.parties.filter((_, i) => i !== index),
      baseResultModifiers: draft.baseResultModifiers.filter(
        (m) => m.partyId !== id,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <WizardStepEyebrow stepIndex={stepIndex} />
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          {t("wizard.parties.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          {t("wizard.parties.description")}
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 p-8 shadow-sm">
        {draft.parties.length > 0 && (
          <div className="flex flex-col gap-4">
            {draft.parties.map((party, index) => {
              const isOther = party.id === OTHER_PARTY_ID;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl border border-slate-100 px-4 py-4"
                >
                  {!isOther && (
                    <div className="w-40 shrink-0">
                      <FormField label={t("wizard.parties.fields.color.label")}>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-8 w-8 shrink-0 rounded-full border border-slate-200"
                            style={{ backgroundColor: party.color }}
                          />
                          <TextInput
                            id={`party-${index}-color`}
                            value={party.color}
                            onChange={(color) => updateParty(index, { color })}
                            placeholder={DEFAULT_PARTY_COLOR}
                          />
                        </div>
                      </FormField>
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    {!isOther && (
                      <FormField label={t("wizard.parties.fields.name.label")}>
                        <TextInput
                          id={`party-${index}-name`}
                          value={party.name}
                          onChange={(name) => updateName(index, name)}
                          placeholder={t(
                            "wizard.parties.fields.name.placeholder",
                          )}
                        />
                      </FormField>
                    )}
                    <FormField
                      label={t("wizard.parties.fields.id.label")}
                      hint={t(
                        isOther
                          ? "wizard.parties.fields.id.lockedHint"
                          : "wizard.parties.fields.id.hint",
                      )}
                    >
                      <TextInput
                        value={party.id}
                        disabled
                        onChange={(id) =>
                          updateParty(index, { id, isIdCustom: true })
                        }
                      />
                    </FormField>
                  </div>

                  <div className="w-48 shrink-0">
                    <FormField label={t("wizard.parties.fields.votes.label")}>
                      <NumberInput
                        id={`party-votes-${party.id}`}
                        value={party.votes}
                        onChange={(votes) => updateParty(index, { votes })}
                      />
                    </FormField>
                  </div>

                  {isOther ? (
                    <div className="w-9 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-7 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      onClick={() => removeParty(index)}
                    >
                      <Icon name="x" color="currentColor" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          disabled
          onClick={addParty}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-brand-700 hover:border-brand-300 hover:bg-brand-50"
        >
          {t("wizard.parties.addButton")}
        </button>
      </section>
    </div>
  );
}
