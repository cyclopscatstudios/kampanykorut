import { t } from "i18next";
import { Button } from "../../../../../../shared/ui/Button";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { PoliticalEmblem } from "./PoliticalEmblem";

export function PoliticalStatusButton({
  hasUnseenEvents,
  onOpen,
  current = false,
}: {
  hasUnseenEvents: boolean;
  onOpen: () => void;
  current?: boolean;
}) {
  const label = current
    ? t("politicalDashboard.entry.current")
    : hasUnseenEvents
      ? t("politicalDashboard.entry.withNews")
      : t("politicalDashboard.entry.label");

  return (
    <Tooltip content={label} position="bottom">
      <div className="relative flex">
        <Button
          variant="tertiary"
          iconOnly
          selected={current}
          aria-label={label}
          aria-current={current ? "page" : undefined}
          aria-disabled={current || undefined}
          onClick={current ? undefined : onOpen}
          className={current ? "cursor-default!" : undefined}
          testId="politicalStatusButton"
        >
          <PoliticalEmblem size={40} />
        </Button>
        {hasUnseenEvents && !current && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_#0f172a]"
          />
        )}
      </div>
    </Tooltip>
  );
}
