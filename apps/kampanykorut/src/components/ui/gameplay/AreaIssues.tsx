import { AreaIssueView } from "@shared/domain/Issues";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type OpinionKey = "-2" | "-1" | "0" | "1" | "2";

const OPINION_COLORS: Record<OpinionKey, string> = {
  "-2": "#ef4444",
  "-1": "#f97316",
  "0": "#94a3b8",
  "1": "#84cc16",
  "2": "#22c55e",
};

const MAX_STRENGTH = 3;

const TITLE_CLASS =
  "text-xs font-semibold uppercase tracking-[1.4px] text-slate-400";

function opinionKey(opinion: number): OpinionKey {
  return String(Math.max(-2, Math.min(2, Math.round(opinion)))) as OpinionKey;
}

type OpenPopup = { id: string; top: number; left: number };

export function AreaIssues({
  issues,
  collapsible = false,
}: {
  issues: AreaIssueView[];
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState<OpenPopup | null>(null);
  const [expanded, setExpanded] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !ref.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(null);
      }
    };
    const close = () => setOpen(null);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  if (issues.length === 0) {
    return null;
  }
  return (
    <div ref={ref} className="flex flex-col gap-1.5" data-testid="areaIssues">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => {
            setOpen(null);
            setExpanded((value) => !value);
          }}
          data-testid="areaIssuesToggle"
          className="flex cursor-pointer items-center justify-between gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span className={TITLE_CLASS}>{t("issues.title")}</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            {!expanded && (
              <span className="text-xs font-semibold">{issues.length}</span>
            )}
            <Icon
              name="chevron-down"
              size="xs"
              color="currentColor"
              className={classNames("transition-transform duration-150", {
                "rotate-180": expanded,
              })}
            />
          </span>
        </button>
      ) : (
        <div className={TITLE_CLASS}>{t("issues.title")}</div>
      )}
      <div
        className={classNames("flex flex-wrap gap-1.5", {
          hidden: !expanded,
        })}
      >
        {issues.map((issue) => {
          const key = opinionKey(issue.opinion);
          const color = OPINION_COLORS[key];
          const opinion = t(`issues.opinion.${key}`);
          const isOpen = open?.id === issue.id;
          return (
            <div key={issue.id}>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-1"
                style={{ borderColor: `${color}55`, color }}
                aria-label={`${issue.name}: ${opinion}`}
                aria-expanded={isOpen}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOpen(
                    isOpen
                      ? null
                      : { id: issue.id, top: rect.bottom + 4, left: rect.left },
                  );
                }}
                data-testid={`areaIssue-${issue.id}`}
              >
                <Icon
                  name={issue.icon ?? "chat-square-text-fill"}
                  size="xs"
                  color="currentColor"
                />
                <span className="text-xs font-semibold text-slate-200">
                  {issue.name}
                </span>
                <span className="flex gap-0.5">
                  {Array.from({ length: MAX_STRENGTH }, (_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-1 rounded-sm"
                      style={{
                        backgroundColor: color,
                        opacity: i < issue.strength ? 1 : 0.2,
                      }}
                    />
                  ))}
                </span>
                <Icon
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size="xs"
                  color="currentColor"
                />
              </button>
              {isOpen &&
                createPortal(
                  <div
                    ref={popupRef}
                    className="fixed z-[9999] w-56 rounded-md border border-slate-700 bg-slate-900 p-2 shadow-lg"
                    style={{ top: open.top, left: open.left }}
                    data-testid={`areaIssuePopup-${issue.id}`}
                  >
                    <div className="text-xs font-semibold text-slate-100">
                      {issue.name}
                    </div>
                    <div className="text-xs font-semibold" style={{ color }}>
                      {opinion}
                    </div>
                    {issue.description && (
                      <p className="mt-1 text-xs text-slate-300">
                        {issue.description}
                      </p>
                    )}
                  </div>,
                  document.body,
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
