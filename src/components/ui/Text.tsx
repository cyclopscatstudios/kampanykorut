import classNames from "classnames";
import { mainColors } from "../../types/color";

interface TextProps {
  children: React.ReactNode;
  weight?: "light" | "normal" | "medium" | "bold";
  color?:
    | "white"
    | "emerald-light"
    | "emerald-dark"
    | "dark-blue"
    | "light-blue";
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

  function getTextColor(color: string) {
    switch (color) {
      case "white":
        return "text-white";
      case "emerald-light":
        return "text-emerald-50";
      case "emerald-dark":
        return "text-emerald-900";
      case "light-blue":
        return "text-blue-50";
      case "dark-blue":
        return "text-blue-900";
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
