import { useTranslate } from "@/shared/logic/hooks";
import { WIZARD_STEPS } from "./wizardSteps";

export function WizardStepEyebrow({ stepIndex }: { stepIndex: number }) {
  const t = useTranslate();
  const step = WIZARD_STEPS[stepIndex];

  return (
    <div className="text-sm font-bold uppercase tracking-wide text-brand-700">
      {t("wizard.stepEyebrow", {
        current: stepIndex + 1,
        total: WIZARD_STEPS.length,
        label: t(step.labelKey),
      })}
    </div>
  );
}
