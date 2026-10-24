import classNames from "classnames";
import { t } from "i18next";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { CampaignConfig, CampaignState } from "@/shared/types";
import { Icon } from "../../../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../../../shared/ui/Text";
import { CommonWrapper } from "../../../CommonWrapper";

interface AchievmentsProps {
  state: CampaignState | null;
  config: CampaignConfig;
}

export function Achievements({ config, state }: AchievmentsProps) {
  const configEngine = container.resolve(ConfigEngine);
  const stateEngine = container.resolve(StateEngine);
  const history = stateEngine.getHistory();
  if (!config || !state || !history) {
    return;
  }
  const strategies = configEngine.getCampaignStrategies(state, config, history);
  if (!strategies?.length) {
    return (
      <Text size="sm" color="gray" className="text-center">
        {t("endResult.achievements.empty")}
      </Text>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {strategies.map((badge) => {
        return (
          <CommonWrapper key={badge.id} fullHeight={false}>
            <div className="w-[250px] flex items-center gap-3 p-3">
              <div className="relative shrink-0">
                <img
                  src={badge.asset?.badge}
                  alt={badge.label}
                  className={classNames("w-16 h-16", {
                    "opacity-25": !badge.isCompleted,
                  })}
                />
                <Icon
                  name={
                    badge.isCompleted ? "check-circle-fill" : "x-circle-fill"
                  }
                  color={badge.isCompleted ? "green" : "red"}
                  className="absolute right-0 bottom-0"
                />
              </div>
              <div>
                <Text weight="bold" size="sm">
                  {badge.label}
                </Text>
                <Text size="xs" color={badge.isCompleted ? "green" : "gray"}>
                  {badge.isCompleted
                    ? t("endResult.achievements.completed")
                    : t("endResult.achievements.notCompleted")}
                </Text>
              </div>
            </div>
          </CommonWrapper>
        );
      })}
    </div>
  );
}
