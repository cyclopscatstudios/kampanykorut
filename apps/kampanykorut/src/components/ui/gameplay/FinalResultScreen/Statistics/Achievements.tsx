import classNames from "classnames";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { CampaignConfig, CampaignState } from "@/shared/types";
import { Icon } from "../../../../../../../../shared/ui/Icon";
import { Tooltip } from "../../../Tooltip";

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
  if (!strategies) {
    return "no strategy in this campaing";
  }
  return (
    <div className="flex">
      {strategies.map((badge) => {
        return (
          <Tooltip content={badge.label}>
            <div className="relative">
              <Icon
                name={badge.isCompleted ? "check-circle-fill" : "x-circle-fill"}
                color={badge.isCompleted ? "green" : "red"}
                className="absolute right-0 bottom-0"
              />
              <img
                key={badge.id}
                src={badge.asset?.badge}
                alt={badge.label}
                className={classNames("w-16 h-16 mr-2", {
                  "opacity-25": !badge.isCompleted,
                })}
              />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
