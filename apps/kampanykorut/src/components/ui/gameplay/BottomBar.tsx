import { t } from "i18next";
import { District } from "@/shared/types";
import type { Colors } from "../../../../../../shared/types/color";
import { SwingFactorId } from "../../../types/utils";
import { Button } from "../../../../../../shared/ui/Button";
import { CommonWrapper } from "../CommonWrapper";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import type { SwingFactor } from "./MapCreator";

interface BottomBarProps {
  data?: District | null;
  onClick: () => void;
  swingFactor?: SwingFactor;
}

export function BottomBar({ data, onClick, swingFactor }: BottomBarProps) {
  const population = Math.round((data?.valasztopolgar ?? 0) / 1000);
  const textColor = getSwingFactorTextColor(swingFactor?.id);

  return (
    <CommonWrapper block fullHeight={false}>
      <div className="h-20 bg-dark-blue flex justify-between items-center">
        {data ? (
          <>
            <div className="flex items-center px-5">
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
              <div className="px-5">
                <Button onClick={onClick}>
                  <Button.Text> {t("bottomBar.visitDistrict")}</Button.Text>
                  <Button.Icon name="arrow-right" color="white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800/50 size-full flex justify-center items-center">
            <Text weight="light" color="gray">
              Válassz egy körzetet...
            </Text>
          </div>
        )}
      </div>
    </CommonWrapper>
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
