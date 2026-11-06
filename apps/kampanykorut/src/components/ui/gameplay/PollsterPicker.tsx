import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useId, useRef, useState } from "react";
import { AGGREGATE_POLLSTER_ID } from "@/shared/domain";
import { Icon } from "../../../../../../shared/ui/Icon";

export interface PollsterOption {
  id: string;
  label?: string;
}

export interface PollsterPickerProps {
  options: PollsterOption[];
  /** Missing means the polling average. */
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function PollsterAvatar({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (id === AGGREGATE_POLLSTER_ID || failed) {
    return (
      <span
        className={classNames(
          "flex shrink-0 items-center justify-center rounded-full bg-blue-400/20",
          className,
        )}
      >
        <Icon name="bar-chart-fill" size="xs" color="lightBlue" />
      </span>
    );
  }

  return (
    <img
      src={`/images/shared/pollsters/${id}.png`}
      alt=""
      className={classNames(
        "shrink-0 rounded-full bg-white object-cover",
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}

/** Mobile header: the selected pollster's logo, opening a dark list. */
export function PollsterPicker({
  options,
  selectedId = AGGREGATE_POLLSTER_ID,
  onSelect,
}: PollsterPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.id === selectedId);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("gameMenuBar.mapMenu.polls.menuLabel")}: ${selected?.label ?? ""}`}
        data-testid="pollsterPicker"
        className="flex h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <PollsterAvatar
          id={selectedId}
          className="size-[26px] ring-1 ring-blue-50/25"
        />
        <Icon
          name="chevron-down"
          size="xs"
          color="lightBlue"
          className={classNames("transition-transform duration-150", {
            "rotate-180": open,
          })}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("gameMenuBar.mapMenu.polls.menuLabel")}
          className="absolute right-0 top-full z-50 mt-1 flex w-[270px] flex-col gap-0.5 rounded-xl border border-[#4462aa] bg-[#161e30] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => {
            const isSelected = option.id === selectedId;
            return (
              <li key={option.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                  className={classNames(
                    "flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-slate-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    isSelected ? "bg-blue-400/15" : "hover:bg-white/5",
                  )}
                >
                  <PollsterAvatar id={option.id} className="size-6" />
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <Icon name="check-lg" size="sm" color="blue" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
