import classNames from "classnames";
import type { Colors } from "../../../../../shared/types/color";
import { Icon } from "../../../../../shared/ui/Icon";
import { Text } from "../../../../../shared/ui/Text";
import { getBaseBackgroundColor } from "./color.utils";

interface BadgeProps {
  icon?: string;
  label: string;
  color?: Colors;
  customColor?: string;
}

export function Badge({ icon, label, color, customColor }: BadgeProps) {
  const badgeBg = getBaseBackgroundColor(color);
  return (
    <div
      style={{ backgroundColor: customColor }}
      className={classNames(
        "inline-flex rounded-full items-center justify-center",
        badgeBg,
      )}
    >
      {icon && <Icon name="check-circle-fill" className="mx-1.5" />}
      <Text size="xs" className={icon ? "mr-1.5" : "mx-1.5"}>
        {label}
      </Text>
    </div>
  );
}
