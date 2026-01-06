import icons from "bootstrap-icons/font/bootstrap-icons.json";
import classNames from "classnames";
import type { Colors } from "../../types/color";
import { svgIcons } from "./icons";

export type IconSource = "bootstrap" | "svg";

export type BootstrapIcon = keyof typeof icons;

type IconSize = "normal" | "large";

export interface IconProps {
  name: BootstrapIcon;
  size?: IconSize;
  color?: Colors;
  source?: IconSource;
}

export function Icon({
  name,
  size = "normal",
  color = "lightBlue",
  source = "bootstrap",
}: IconProps) {
  const iconSize = getIconSize(size);
  const iconColor = getIconColor(color);
  console.log(name, source)

  if (source === "svg") {
    const SvgIcon = svgIcons[name as keyof typeof svgIcons];

    if (!SvgIcon) return null;

    return <SvgIcon className={classNames(iconSize, iconColor)} aria-hidden />;
  }

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
