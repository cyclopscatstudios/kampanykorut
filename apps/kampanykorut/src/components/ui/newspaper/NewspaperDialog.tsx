import { t } from "i18next";
import { useEffect, useState } from "react";
import { NewspaperEditionView } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { NewspaperFrontPage } from "./NewspaperFrontPage";

// "arrival": a new edition opened by itself, answered with "read" or
// "no more pop-ups". "archive": opened from the map button, pages back
// through every edition so far.
export type NewspaperDialogMode = "arrival" | "archive";

export function NewspaperDialog({
  open,
  mode,
  editions,
  year,
  onRead,
  onOptOut,
  onClose,
}: {
  open: boolean;
  mode: NewspaperDialogMode;
  editions: NewspaperEditionView[];
  year?: string | number;
  onRead: () => void;
  onOptOut: () => void;
  onClose: () => void;
}) {
  const last = editions.length - 1;
  const [index, setIndex] = useState(last);
  const [openedAt, setOpenedAt] = useState(open ? last : -1);

  // Every opening starts on the newest edition.
  if (open && openedAt !== last) {
    setOpenedAt(last);
    setIndex(last);
  } else if (!open && openedAt !== -1) {
    setOpenedAt(-1);
  }

  const dismiss = mode === "arrival" ? onRead : onClose;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, dismiss]);

  const edition = editions[Math.min(Math.max(index, 0), last)];
  if (!open || !edition) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(2,6,23,0.86)] p-3 backdrop-blur-sm md:p-6"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label={edition.paper.name}
      data-testid="newspaperDialog"
    >
      <div
        className="relative my-auto flex w-full max-w-[780px] flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "archive" && (
          <div className="flex w-full justify-end">
            <Button
              variant="tertiary"
              iconOnly
              aria-label={t("newspaper.close")}
              onClick={onClose}
              testId="newspaperClose"
            >
              <Button.Icon name="x-lg" />
            </Button>
          </div>
        )}

        <div className="w-full md:-rotate-[0.6deg]">
          <NewspaperFrontPage edition={edition} year={year} />
        </div>

        {mode === "arrival" ? (
          <div className="flex w-full flex-col items-center gap-2">
            <Button
              size="lg"
              onClick={onRead}
              className="w-full md:w-auto md:min-w-[240px]"
              testId="newspaperRead"
            >
              <Button.Text>{t("newspaper.read")}</Button.Text>
            </Button>
            <Button
              variant="link"
              onClick={onOptOut}
              className="min-h-11 px-2"
              testId="newspaperOptOut"
            >
              <Button.Text>{t("newspaper.optOut")}</Button.Text>
            </Button>
          </div>
        ) : (
          editions.length > 1 && (
            <nav
              aria-label={t("newspaper.paging")}
              className="flex items-center gap-4"
            >
              <Button
                variant="tertiary"
                iconOnly
                aria-label={t("newspaper.previous")}
                disabled={index <= 0}
                onClick={() => setIndex((i) => i - 1)}
                testId="newspaperPrevious"
              >
                <Button.Icon name="chevron-left" />
              </Button>
              <span className="min-w-16 text-center text-sm font-semibold text-slate-300">
                {t("newspaper.position", {
                  current: index + 1,
                  total: editions.length,
                })}
              </span>
              <Button
                variant="tertiary"
                iconOnly
                aria-label={t("newspaper.next")}
                disabled={index >= last}
                onClick={() => setIndex((i) => i + 1)}
                testId="newspaperNext"
              >
                <Button.Icon name="chevron-right" />
              </Button>
            </nav>
          )
        )}
      </div>
    </div>
  );
}
