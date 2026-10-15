import classNames from "classnames";
import { Link } from "react-router-dom";
import { Icon } from "@/shared/ui";
import { useTranslate } from "@/shared/logic/hooks";
import { WIZARD_STEPS } from "./wizardSteps";

export function WizardSidebar({ currentIndex }: { currentIndex: number }) {
  const t = useTranslate();

  return (
    <nav className="w-[260px] shrink-0 border-r border-slate-100 px-6 py-8">
      <ol className="relative flex flex-col">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="relative pb-8 last:pb-0">
              {index < WIZARD_STEPS.length - 1 && (
                <span className="absolute left-4 top-8 h-full w-px bg-slate-200" />
              )}
              <Link
                to={step.path}
                className={classNames(
                  "relative -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5",
                  isCurrent && "bg-brand-50",
                )}
              >
                <span
                  className={classNames(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isCompleted && "bg-emerald-500 text-white",
                    isCurrent && "bg-brand-700 text-white",
                    !isCompleted &&
                      !isCurrent &&
                      "border-2 border-slate-200 text-slate-400",
                  )}
                >
                  {isCompleted ? (
                    <Icon
                      name="check-lg"
                      color="currentColor"
                      className="text-white"
                      size="xs"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={classNames(
                    "text-[15px] font-semibold",
                    isCurrent && "text-brand-700",
                    isCompleted && "text-slate-900",
                    !isCompleted && !isCurrent && "text-slate-400",
                  )}
                >
                  {t(step.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
