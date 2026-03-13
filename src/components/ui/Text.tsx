import classNames from "classnames";
import type { Colors } from "../../types/color";

type TextWeight = "light" | "normal" | "medium" | "bold";
type TextSize = "sm" | "base" | "lg" | "xl";
type TextTag = "p" | "span" | "div" | "li" | "label";

interface TextProps {
  children: React.ReactNode;
  as?: TextTag;
  weight?: TextWeight;
  size?: TextSize;
  color?: Colors;
  className?: string;
}

const weightClasses: Record<TextWeight, string> = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

const sizeClasses: Record<TextSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const colorClasses: Partial<Record<Colors, string>> = {
  white: "text-white",
  lightBlue: "text-blue-50",
  gray: "text-neutral-400",
  darkBlue: "text-blue-900",
  red: "text-red-600",
  yellow: "text-yellow-600",
  green: "text-green-600",
};

export function Text({
  children,
  as: Tag = "div",
  weight = "normal",
  size = "base",
  color = "white",
  className,
}: TextProps) {
  return (
    <Tag
      className={classNames(
        weightClasses[weight],
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
