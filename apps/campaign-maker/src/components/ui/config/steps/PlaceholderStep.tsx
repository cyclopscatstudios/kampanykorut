import { useLocation } from "react-router-dom";
import { useTranslate } from "@/shared/logic/hooks";
import { getStepIndexFromPath, WIZARD_STEPS } from "../wizardSteps";
import { WizardStepEyebrow } from "../WizardStepEyebrow";

export function PlaceholderStep() {
  const location = useLocation();
  const t = useTranslate();
  const index = getStepIndexFromPath(location.pathname);
  const step = WIZARD_STEPS[index];

  return (
    <div className="flex flex-col gap-4">
      <WizardStepEyebrow stepIndex={index} />
      <h1 className="text-3xl font-extrabold text-slate-900">
        {t(step.labelKey)}
      </h1>
      <p className="max-w-2xl text-slate-500">
        {t("wizard.placeholder.comingSoon")}
      </p>
    </div>
  );
}
