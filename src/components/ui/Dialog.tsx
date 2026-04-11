import { useEffect, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
};

export function Dialog({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className="min-w-[400px] max-w-[90vw] bg-[#161e30] rounded-xl border border-[#4462aa] shadow-xl"
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
