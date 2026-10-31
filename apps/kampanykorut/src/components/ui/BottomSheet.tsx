import classNames from "classnames";
import { t } from "i18next";
import { type ReactNode, useEffect, useRef } from "react";
import { Icon } from "../../../../../shared/ui/Icon";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  hideTitle?: boolean;
  fitContent?: boolean;
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  hideTitle,
  fitContent,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={classNames(
          "fixed inset-0 z-40 bg-black/45 transition-opacity duration-250",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={title}
        className={classNames(
          "fixed inset-x-0 bottom-0 z-41 flex max-h-[70dvh] flex-col overflow-hidden rounded-t-[20px] bg-[#22355a] pt-2.5 shadow-[0_-12px_40px_rgba(0,0,0,0.4)]",
          !fitContent && "h-[420px]",
          "transition-[transform,visibility] duration-280 ease-[cubic-bezier(.32,.72,0,1)]",
          open ? "translate-y-0" : "translate-y-full invisible",
        )}
      >
        <div className="mx-auto h-1 w-9 shrink-0 rounded-full bg-white/20" />
        {!hideTitle && (
          <div className="flex shrink-0 items-center gap-3 px-4.5 py-2">
            <div className="min-w-0 flex-1 text-base font-extrabold text-slate-50">
              {title}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("bottomSheet.close")}
              className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <Icon name="x-lg" size={18} color="currentColor" />
            </button>
          </div>
        )}
        <div
          className={classNames(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4.5 pb-[calc(16px+env(safe-area-inset-bottom))]",
            hideTitle && "pt-3",
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
