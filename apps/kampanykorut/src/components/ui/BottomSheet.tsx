import classNames from "classnames";
import { type ReactNode, useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  hideTitle?: boolean;
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  hideTitle,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={title}
        className={classNames(
          "fixed inset-x-0 bottom-0 z-41 max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-[#22355a] px-4.5 pt-2.5 pb-[calc(34px+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.4)]",
          "transition-[transform,visibility] duration-280 ease-[cubic-bezier(.32,.72,0,1)]",
          open ? "translate-y-0" : "translate-y-full invisible",
        )}
      >
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-white/20" />
        {!hideTitle && (
          <div className="mb-3 text-base font-extrabold text-slate-50">
            {title}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
