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
    return () => window.removeEventListener("keydown", handler);
  }, [open, dismiss]);

  const edition = editions[Math.min(Math.max(index, 0), last)];
  if (!open || !edition) {
    return null;
  }

  const inkLink = "text-[#3a352c]! hover:text-[#1c1a17]!";

  // No backdrop: like a newspaper dropped on the desk, the page covers part
  // of the map while the rest stays in view.
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      data-testid="newspaperDialog"
    >
      <div
        role="dialog"
        aria-label={edition.paper.name}
        className="pointer-events-auto relative max-h-full w-full max-w-[540px] overflow-y-auto md:-rotate-[0.6deg]"
      >
        <NewspaperFrontPage
          edition={edition}
          year={year}
          footer={
            mode === "arrival" ? (
              <div className="flex flex-col items-center gap-1">
                <Button
                  onClick={onRead}
                  className="w-full md:w-auto md:min-w-[220px]"
                  testId="newspaperRead"
                >
                  <Button.Text>{t("newspaper.read")}</Button.Text>
                </Button>
                <Button
                  variant="link"
                  onClick={onOptOut}
                  className={`min-h-10 px-2 underline underline-offset-2 ${inkLink}`}
                  testId="newspaperOptOut"
                >
                  <Button.Text>{t("newspaper.optOut")}</Button.Text>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <nav
                  aria-label={t("newspaper.paging")}
                  className="flex items-center gap-2"
                >
                  <Button
                    variant="link"
                    iconOnly
                    aria-label={t("newspaper.previous")}
                    disabled={index <= 0}
                    onClick={() => setIndex((i) => i - 1)}
                    testId="newspaperPrevious"
                    className={index <= 0 ? "opacity-40" : inkLink}
                  >
                    <Button.Icon name="chevron-left" color="currentColor" />
                  </Button>
                  <span className="min-w-12 text-center font-[Montserrat,sans-serif] text-sm font-semibold text-[#3a352c]">
                    {t("newspaper.position", {
                      current: index + 1,
                      total: editions.length,
                    })}
                  </span>
                  <Button
                    variant="link"
                    iconOnly
                    aria-label={t("newspaper.next")}
                    disabled={index >= last}
                    onClick={() => setIndex((i) => i + 1)}
                    testId="newspaperNext"
                    className={index >= last ? "opacity-40" : inkLink}
                  >
                    <Button.Icon name="chevron-right" color="currentColor" />
                  </Button>
                </nav>
                <Button
                  onClick={onClose}
                  className="min-w-[140px]"
                  testId="newspaperClose"
                >
                  <Button.Text>{t("newspaper.close")}</Button.Text>
                </Button>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
