import classNames from "classnames";
import { t } from "i18next";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { useNavigation } from "../../../hooks/navigationHook";
import { PoliticalEmblem } from "../dashboard/PoliticalEmblem";

// Shown next to the disabled district visit button while the campaign waits
// for the player to choose a political focus.
export function FocusRequiredNote({ className }: { className?: string }) {
  const stateEngine = container.resolve(StateEngine);
  const { goToPoliticalDashboard } = useNavigation();
  const openDashboard = () => {
    const campaignId = stateEngine.getCampaignState()?.activeCampaignId;
    if (campaignId) {
      goToPoliticalDashboard(campaignId, stateEngine.getSessionId());
    }
  };

  return (
    <div
      role="status"
      data-testid="focusRequiredNote"
      className={classNames("flex items-center gap-3", className)}
    >
      <PoliticalEmblem size={28} />
      <Tooltip content={t("politicalDashboard.focus.requiredHint")}>
        <span className="text-sm font-semibold text-amber-200">
          {t("politicalDashboard.focus.required")}
        </span>
      </Tooltip>
      <Button
        variant="link"
        size="sm"
        onClick={openDashboard}
        testId="focusRequiredOpen"
      >
        <Button.Text>{t("politicalDashboard.focus.open")}</Button.Text>
      </Button>
    </div>
  );
}
