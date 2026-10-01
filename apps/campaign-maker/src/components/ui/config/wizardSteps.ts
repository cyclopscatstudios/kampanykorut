import type { ParseKeys } from "i18next";

export interface WizardStep {
  id: string;
  path: string;
  labelKey: ParseKeys;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "basics", path: "basics", labelKey: "wizard.steps.basics" },
  { id: "parties", path: "parties", labelKey: "wizard.steps.parties" },
  { id: "votes", path: "votes", labelKey: "wizard.steps.votes" },
  { id: "candidates", path: "candidates", labelKey: "wizard.steps.candidates" },
  { id: "materials", path: "materials", labelKey: "wizard.steps.materials" },
  { id: "summary", path: "summary", labelKey: "wizard.steps.summary" },
];

export function getStepIndexFromPath(pathname: string): number {
  const index = WIZARD_STEPS.findIndex((step) =>
    pathname.endsWith(`/${step.path}`),
  );
  return index === -1 ? 0 : index;
}
