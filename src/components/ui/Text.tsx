import classNames from "classnames";
import type { Colors } from "../../types/color";

interface TextProps {
  children: React.ReactNode;
  weight?: "light" | "normal" | "medium" | "bold";
  color?: Colors;
  className?: string;
}

export function Text({
  children,
  weight = "normal",
  color = "white",
  className,
}: TextProps) {
  function getWeightClass(weight: string) {
    switch (weight) {
      case "light":
        return "font-light";
      case "bold":
        return "font-bold";
      case "normal":
        return "font-normal";
      case "medium":
        return "font-medium";
      default:
        return "font-normal";
    }
  }

  function getTextColor(color: Colors) {
    switch (color) {
      case "white":
        return "text-white";
      case "lightBlue":
        return "text-blue-50";
      case "gray":
        return "text-neutral-500";
      case "darkBlue":
        return "text-blue-900";
      case "red":
        return "text-red-600";
      case "yellow":
        return "text-yellow-600";
      case "green":
        return "text-green-600";
    }
  }

  const fontWeight = getWeightClass(weight);
  const fontColor = getTextColor(color);
  return (
    <div className={classNames("", fontWeight, fontColor, className)}>
      {children}
    </div>
  );
}
