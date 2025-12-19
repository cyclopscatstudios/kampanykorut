import icons from "bootstrap-icons/font/bootstrap-icons.json";
import classNames from "classnames";
import type { Colors } from "../../types/color";

export type BootstrapIcon = keyof typeof icons;

type IconSize = "normal" | "large";

export interface IconProps {
  name: BootstrapIcon;
  size?: IconSize;
  color?: Colors;
}

export function Icon({
  name,
  size = "normal",
  color = "lightBlue",
}: IconProps) {
  const iconSize = getIconSize(size);
  const iconColor = getIconColor(color);

  return <i className={classNames(`bi bi-${name}`, iconSize, iconColor)} />;
}

function getIconSize(size: IconSize) {
  switch (size) {
    case "normal":
      return "text-base";
    case "large":
      return "text-lg";
    default:
      return "text-base";
  }
}

function getIconColor(color: Colors) {
  switch (color) {
    case "lightBlue":
      return "text-blue-50";
    case "darkBlue":
      return "text-blue-900";
  }
}
