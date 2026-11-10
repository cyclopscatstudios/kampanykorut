import { t } from "i18next";
import { AreaIssueView } from "@/shared/domain/Issues";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";

type OpinionKey = "-2" | "-1" | "0" | "1" | "2";

const OPINION_COLORS: Record<OpinionKey, string> = {
  "-2": "#ef4444",
  "-1": "#f97316",
  "0": "#94a3b8",
  "1": "#84cc16",
  "2": "#22c55e",
};

const MAX_STRENGTH = 3;

function opinionKey(opinion: number): OpinionKey {
  return String(Math.max(-2, Math.min(2, Math.round(opinion)))) as OpinionKey;
}

export function AreaIssues({ issues }: { issues: AreaIssueView[] }) {
  if (issues.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1.5" data-testid="areaIssues">
      <div className="text-[10px] font-semibold uppercase tracking-[1.4px] text-slate-500">
        {t("issues.title")}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {issues.map((issue) => {
          const key = opinionKey(issue.opinion);
          const color = OPINION_COLORS[key];
          const opinion = t(`issues.opinion.${key}`);
          return (
            <Tooltip
              key={issue.id}
              content={[issue.name, opinion, issue.description]
                .filter(Boolean)
                .join(" · ")}
            >
              <div
                className="flex items-center gap-1.5 rounded-full border px-2 py-1"
                style={{ borderColor: `${color}55`, color }}
                aria-label={`${issue.name}: ${opinion}`}
                data-testid={`areaIssue-${issue.id}`}
              >
                <Icon
                  name={issue.icon ?? "chat-square-text-fill"}
                  size="xs"
                  color="currentColor"
                />
                <span className="text-[11px] font-semibold text-slate-200">
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
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
