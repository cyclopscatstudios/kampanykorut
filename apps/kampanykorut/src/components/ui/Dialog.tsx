import { type ReactNode, useEffect } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  panelClassName?: string;
};

export function Dialog({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  panelClassName = "",
}: DialogProps) {
  useEffect(() => {
    if (!closeOnEsc) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, closeOnEsc]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`md:min-w-[400px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-[#161e30] rounded-xl border border-[#4462aa] shadow-xl ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-[#4462aa] p-3 text-center">{children}</div>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#1d2840] flex justify-between p-3 rounded-b-xl">
      {children}
    </div>
  );
}
