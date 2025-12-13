import classNames from "classnames";

interface TextProps {
  children: React.ReactNode;
  weight?: "light" | "normal" | "medium" | "bold";
  color?: "white"
}

export function Text({ children, weight = "normal", color = "white" }: TextProps) {
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
    switch(color) {
      case 'white':
        return 'text-white';
    }
  }

  const fontWeight = getWeightClass(weight);
  const fontColor = getTextColor(color);
  return <div className={classNames("", fontWeight, fontColor)}>{children}</div>;
}