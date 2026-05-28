import classNames from "classnames";
import type { Colors } from "../../types/color";
import { getBaseBackgroundColor } from "./color.utils";
import { Icon } from "./Icon";
import { Text } from "./Text";

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
