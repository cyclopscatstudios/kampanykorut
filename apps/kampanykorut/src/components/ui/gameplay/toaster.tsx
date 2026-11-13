import classNames from "classnames";
import { t } from "i18next";
import { toast, type ToastOptions } from "react-hot-toast";
import type { PoliticalFocus } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";

export type ToastType = "Success" | "Error" | "Normal" | "Focus";

export const toaster = (
  label: string,
  type?: ToastType,
  options?: ToastOptions,
) => {
  switch (type) {
    case "Focus":
      return focusToast({ title: label }, options);
    case "Success":
      return toast.success(label, options);
    case "Error":
      return toast.error(label, options);
    case "Normal":
      return toast(label, options);
    default:
      return toast(label, options);
  }
};

export const focusToast = (
  focus: Pick<PoliticalFocus, "title"> &
    Partial<Pick<PoliticalFocus, "summary" | "icon">>,
  options?: ToastOptions,
) =>
  toast.custom(
    (current) => (
      <div
        role="status"
        className={classNames(
          "pointer-events-auto flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 overflow-hidden rounded-xl border border-blue-400/40 bg-linear-to-r from-[#1c2a4d] to-[#161e30] p-3 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300",
          current.visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0",
        )}
      >
        <span className="relative inline-flex shrink-0">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-blue-500/35 text-blue-50 shadow-[inset_0_0_0_3px_#54a2ff]">
            <Icon
              name={focus.icon ?? "signpost-split-fill"}
              size={focus.icon?.startsWith("/") ? 48 : 22}
              color="currentColor"
              className="rounded-full"
            />
          </span>
          <span className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-amber-300 text-slate-900 shadow-[0_0_0_2px_#161e30]">
            <Icon name="flag-fill" size={10} color="currentColor" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-amber-300">
            {t("toaster.focusSelectedEyebrow")}
          </p>
          <p className="m-0 text-base font-bold leading-snug text-slate-50">
            {focus.title}
          </p>
          {focus.summary && (
            <p className="m-0 mt-0.5 text-sm leading-snug text-slate-300">
              {focus.summary}
            </p>
          )}
        </div>
      </div>
    ),
    { duration: 3000, ...options },
  );
