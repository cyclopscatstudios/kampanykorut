import { useTranslate } from "@/shared/logic/hooks";
import { Button } from "@/shared/ui/Button";
import { WizardStep } from "./wizardSteps";

interface WizardFooterProps {
  currentIndex: number;
  total: number;
  nextStep?: WizardStep;
  onCancel: () => void;
  onNext: () => void;
}

export function WizardFooter({
  currentIndex,
  total,
  nextStep,
  onCancel,
  onNext,
}: WizardFooterProps) {
  const t = useTranslate();

  const nextLabel = nextStep
    ? t("wizard.footer.next", { label: t(nextStep.labelKey) })
    : t("wizard.footer.export");

  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-8 py-4">
      <Button variant="secondary" size="lg" onClick={onCancel}>
        {t("wizard.footer.cancel")}
      </Button>
      <span className="text-sm font-medium text-slate-400">
        {t("wizard.footer.stepCounter", { current: currentIndex + 1, total })}
      </span>
      <Button variant="primary" size="lg" onClick={onNext}>
        {nextLabel}
      </Button>
    </footer>
  );
}
