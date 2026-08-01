import classNames from "classnames";
import type { Colors } from "../types/color";
import { svgIcons } from "./icons";
import { BootstrapIcon, IconSource } from "../types";

type IconSize = "xs" | "sm" | "normal" | "large" | "medium";

export type IconColor = Colors | "currentColor";

export interface IconProps {
  name: BootstrapIcon;
  size?: IconSize | number;
  color?: IconColor;
  source?: IconSource;
  className?: string;
}

export function Icon({
  name,
  size = "normal",
  color = "lightBlue",
  source = "bootstrap",
  className,
}: IconProps) {
  const iconSizeClass =
    typeof size === "string" ? getIconSize(size) : undefined;
  const iconSizeStyle =
    typeof size === "number" ? { fontSize: size } : undefined;
  const iconColor = getIconColor(color);

  if (source === "svg") {
    const SvgIcon = svgIcons[name as keyof typeof svgIcons];
    if (!SvgIcon) return null;
    return (
      <SvgIcon
        className={classNames(iconSizeClass, iconColor, className)}
        style={iconSizeStyle}
        aria-hidden
      />
    );
  }

  return (
    <i
      className={classNames(
        `bi bi-${name}`,
        iconSizeClass,
        iconColor,
        className,
      )}
      style={iconSizeStyle}
    />
  );
}

function getIconSize(size: IconSize) {
  switch (size) {
    case "xs":
      return "text-xs";
    case "sm":
      return "text-sm";
    case "normal":
      return "text-base";
    case "large":
      return "text-2xl";
    case "medium":
      return "text-xl";
    default:
      return "text-base";
  }
}

function getIconColor(color: IconColor): string {
  switch (color) {
    case "currentColor":
      return "";
    case "white":
      return "text-white";
    case "purple":
      return "text-purple-500";
    case "lightBlue":
      return "text-blue-50";
    case "darkBlue":
      return "text-blue-900";
    case "green":
      return "text-green-600";
    case "red":
      return "text-red-600";
    case "yellow":
      return "text-yellow-400";
    default:
      return "";
  }
}
