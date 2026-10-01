import classNames from "classnames";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Icon } from "@/shared/ui";
import { useTranslate } from "@/shared/logic/hooks";
import { FormField } from "../../form/FormField";
import { NumberInput } from "../../form/NumberInput";
import { TextInput } from "../../form/TextInput";
import { Toggle } from "../../form/Toggle";
import { useCampaignDraft } from "../CampaignDraftContext";
import { getStepIndexFromPath } from "../wizardSteps";
import { WizardStepEyebrow } from "../WizardStepEyebrow";

export function BasicsStep() {
  const { draft, updateDraft } = useCampaignDraft();
  const t = useTranslate();
  const location = useLocation();
  const stepIndex = getStepIndexFromPath(location.pathname);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <WizardStepEyebrow stepIndex={stepIndex} />
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          {t("wizard.basics.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          {t("wizard.basics.description")}
        </p>
      </div>

      <section className="grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 p-8 shadow-sm">
        <FormField
          label={t("wizard.basics.fields.title.label")}
          hint={t("wizard.basics.fields.title.hint")}
        >
          <TextInput
            value={draft.title}
            onChange={(title) => updateDraft({ title })}
            placeholder={t("wizard.basics.fields.title.placeholder")}
          />
        </FormField>

        <FormField label={t("wizard.basics.fields.year.label")}>
          <TextInput
            value={draft.year}
            onChange={(year) => updateDraft({ year })}
            placeholder={t("wizard.basics.fields.year.placeholder")}
          />
        </FormField>

        <FormField label={t("wizard.basics.fields.listSeats.label")}>
          <NumberInput
            value={draft.listSeats}
            onChange={(listSeats) => updateDraft({ listSeats })}
          />
        </FormField>

        <FormField label={t("wizard.basics.fields.allSeats.label")}>
          <NumberInput
            value={draft.allSeats}
            onChange={(allSeats) => updateDraft({ allSeats })}
          />
        </FormField>

        <FormField label={t("wizard.basics.fields.thresholdPercent.label")}>
          <NumberInput
            value={draft.thresholdPercent}
            onChange={(thresholdPercent) => updateDraft({ thresholdPercent })}
            suffix="%"
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {t("wizard.basics.fields.districtBoost.label")}
          </span>
          <div className="flex items-center gap-3 pt-1">
            <Toggle
              checked={draft.districtBoost}
              onChange={(value) => updateDraft({ districtBoost: value })}
            />
            <span className="text-sm text-slate-500">
              {t("wizard.basics.fields.districtBoost.status", {
                status: draft.districtBoost
                  ? t("wizard.common.enabled")
                  : t("wizard.common.disabled"),
              })}
            </span>
          </div>
        </div>
      </section>

      <BaseResultModifiers />
    </div>
  );
}

function BaseResultModifiers() {
  const { draft, updateDraft } = useCampaignDraft();
  const t = useTranslate();
  const hasParties = draft.parties.length > 0;
  const canAddMore = draft.baseResultModifiers.length < draft.parties.length;

  const addModifier = () => {
    const usedIds = new Set(draft.baseResultModifiers.map((m) => m.partyId));
    const nextParty = draft.parties.find((p) => !usedIds.has(p.id));
    if (!nextParty) return;
    updateDraft({
      baseResultModifiers: [
        ...draft.baseResultModifiers,
        { id: uuidv4(), partyId: nextParty.id, delta: 0 },
      ],
    });
  };

  const updateModifier = (id: string, delta: number) => {
    updateDraft({
      baseResultModifiers: draft.baseResultModifiers.map((m) =>
        m.id === id ? { ...m, delta } : m,
      ),
    });
  };

  const removeModifier = (id: string) => {
    updateDraft({
      baseResultModifiers: draft.baseResultModifiers.filter((m) => m.id !== id),
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          {t("wizard.basics.modifiers.title")}
        </h2>
        <span className="text-sm text-slate-400">
          · {t("wizard.basics.modifiers.optionalBadge")}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {t("wizard.basics.modifiers.description")}
      </p>

      {draft.baseResultModifiers.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {draft.baseResultModifiers.map((modifier) => {
            const party = draft.parties.find((p) => p.id === modifier.partyId);
            if (!party) return null;
            return (
              <div
                key={modifier.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3"
              >
                <Icon
                  name="grip-vertical"
                  color="currentColor"
                  className="text-slate-300"
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
                <span className="flex-1 text-[15px] font-medium text-slate-800">
                  {party.name}
                </span>
                <div className="flex items-center rounded-lg border border-slate-200">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
                    onClick={() =>
                      updateModifier(modifier.id, modifier.delta - 1)
                    }
                  >
                    <Icon name="dash" color="currentColor" size="sm" />
                  </button>
                  <span className="flex h-9 w-12 items-center justify-center text-sm font-semibold text-slate-800">
                    {modifier.delta > 0 ? `+${modifier.delta}` : modifier.delta}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
                    onClick={() =>
                      updateModifier(modifier.id, modifier.delta + 1)
                    }
                  >
                    <Icon name="plus" color="currentColor" size="sm" />
                  </button>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  onClick={() => removeModifier(modifier.id)}
                >
                  <Icon name="x" color="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={!hasParties || !canAddMore}
        onClick={addModifier}
        className={classNames(
          "mt-4 w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold",
          hasParties && canAddMore
            ? "text-brand-700 hover:border-brand-300 hover:bg-brand-50"
            : "cursor-not-allowed text-slate-300",
        )}
      >
        {hasParties
          ? t("wizard.basics.modifiers.addButton")
          : t("wizard.basics.modifiers.addButtonDisabledHint", {
              step: t("wizard.steps.parties"),
            })}
      </button>
    </section>
  );
}
