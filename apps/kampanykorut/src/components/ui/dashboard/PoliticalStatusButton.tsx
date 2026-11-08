import { t } from "i18next";
import { Button } from "../../../../../../shared/ui/Button";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { PoliticalEmblem } from "./PoliticalEmblem";

export function PoliticalStatusButton({
  hasUnseenEvents,
  onOpen,
}: {
  hasUnseenEvents: boolean;
  onOpen: () => void;
}) {
  const label = hasUnseenEvents
    ? t("politicalDashboard.entry.withNews")
    : t("politicalDashboard.entry.label");

  return (
    <Tooltip content={label} position="bottom">
      <div className="relative">
        <Button
          variant="tertiary"
          iconOnly
          aria-label={label}
          onClick={onOpen}
          testId="politicalStatusButton"
        >
          <PoliticalEmblem size={36} />
        </Button>
        {hasUnseenEvents && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0.5 top-0.5 size-2.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_#0f172a]"
          />
        )}
      </div>
    </Tooltip>
  );
}
