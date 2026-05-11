import { t } from "i18next";
import type { Colors } from "../../../types/color";
import { SwingFactorId } from "../../../types/utils";
import { Button } from "../Button";
import { Icon } from "../Icon";
import type { DistrictResult } from "../map.utils";
import { Text } from "../Text";
import type { SwingFactor } from "./MapCreator";

interface BottomBarProps {
  data?: DistrictResult | null;
  onClick: () => void;
  swingFactor?: SwingFactor;
}

export function BottomBar({ data, onClick, swingFactor }: BottomBarProps) {
  const population = Math.round((data?.valasztopolgar ?? 0) / 1000);
  const textColor = getSwingFactorTextColor(swingFactor?.id);

  return (
    <div className="w-full h-20 bg-dark-blue flex justify-between items-center p-3">
      {data && (
        <>
          <div className="flex items-center">
            <Icon
              name="geo-alt-fill"
              className="text-fuchsia-600"
              size="large"
            />
            <div className="pl-5">
              <Text weight="bold" className="text-xl">
                {data?.megye}
              </Text>
              <Text>{data?.telepules}</Text>
            </div>
          </div>
          <div className="flex items-center">
            <div>
              <Text color="gray" weight="medium">
                {t("bottomBar.population")}
              </Text>
              <Text>
                {population}
                {t("bottomBar.k")}
              </Text>
            </div>
            <div className="pl-5">
              <Text color="gray" weight="medium">
                {t("bottomBar.swingFactor")}
              </Text>
              <Text color={textColor as Colors}>{swingFactor?.label}</Text>
            </div>
            <div className="pl-5">
              <Button fullRounded onClick={onClick}>
                <Button.Text> {t("bottomBar.visitDistrict")}</Button.Text>
                <Button.Icon name="arrow-right" color="white" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getSwingFactorTextColor(swingFactor?: SwingFactorId) {
  if (!swingFactor) {
    return "white";
  }
  if (swingFactor === SwingFactorId.High) {
    return "red";
  }
  if (swingFactor === SwingFactorId.Medium) {
    return "yellow";
  }
  if (swingFactor === SwingFactorId.Low) {
    return "green";
  }
  return "white";
}
