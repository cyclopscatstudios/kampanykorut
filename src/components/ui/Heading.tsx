import classNames from "classnames";
import type { Colors } from "../../types/color";

type HeadingLevel = 1 | 2 | 3 | 4 | 5;

interface HeadingProps {
  children: React.ReactNode;
  level?: HeadingLevel;
  color?: Colors;
  className?: string;
}

const sizeClasses: Record<HeadingLevel, string> = {
  1: "text-4xl lg:text-5xl",
  2: "text-3xl lg:text-4xl",
  3: "text-2xl lg:text-3xl",
  4: "text-2xl lg:text-2xl",
  5: "text-xl lg:text-xl",
};

const colorClasses: Partial<Record<Colors, string>> = {
  white: "text-white",
  lightBlue: "text-blue-50",
  blue: "text-blue-600",
  gray: "text-neutral-500",
  darkBlue: "text-blue-900",
  red: "text-red-600",
  yellow: "text-yellow-600",
  green: "text-green-600",
};

export function Heading({
  children,
  level = 1,
  color = "darkBlue",
  className,
}: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={classNames(
        "font-display font-bold tracking-tight",
        sizeClasses[level],
        colorClasses[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
