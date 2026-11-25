import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { CAMPAIGN_SORTS, type CampaignSort } from "./campaignSelector.utils";

const labels = {
  year: {
    full: "campaignSelector.sort.year",
    short: "campaignSelector.sort.yearShort",
  },
  added: {
    full: "campaignSelector.sort.added",
    short: "campaignSelector.sort.addedShort",
  },
} as const satisfies Record<CampaignSort, { full: string; short: string }>;

export function SortMenu({
  value,
  onChange,
}: {
  value: CampaignSort;
  onChange: (sort: CampaignSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="tertiary"
        size="md"
        aria-haspopup="listbox"
        aria-expanded={open}
        testId="campaignSort"
        onClick={() => setOpen((o) => !o)}
        className="px-3"
      >
        <Icon name="sort-down" color="currentColor" size="sm" />
        <span>
          {t("campaignSelector.sort.label")}:{" "}
          <span className="text-blue-50">{t(labels[value].short)}</span>
        </span>
        <Icon name="chevron-down" color="currentColor" size="xs" />
      </Button>
      {open && (
        <div
          role="listbox"
          aria-label={t("campaignSelector.sort.label")}
          className="absolute top-[46px] right-0 z-10 flex w-[230px] flex-col gap-0.5 rounded-md bg-slate-50 p-1 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.5)]"
        >
          {CAMPAIGN_SORTS.map((sort) => {
            const active = sort === value;
            return (
              <button
                key={sort}
                type="button"
                role="option"
                aria-selected={active}
                data-testid={`campaignSort-${sort}`}
                onClick={() => {
                  onChange(sort);
                  setOpen(false);
                }}
                className={classNames(
                  "flex h-10 cursor-pointer items-center justify-between gap-2 rounded px-3 text-left text-sm font-medium text-blue-900 hover:bg-indigo-50",
                  active && "bg-indigo-100",
                )}
              >
                {t(labels[sort].full)}
                {active && <Icon name="check-lg" color="darkBlue" size="sm" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
