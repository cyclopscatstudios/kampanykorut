import classNames from "classnames";
import type { Colors } from "../../types/color";

type ButtonSize = "normal" | "small";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: ButtonSize;
  color?: Colors;
  block?: boolean;
  fullRounded?: boolean;
  className?: string;
}

const COLOR_CLASSES = {
  red: {
    base: "bg-red-700 hover:bg-red-500 active:bg-red-900",
  },
  blue: {
    base: "bg-blue-700 hover:bg-blue-500 active:bg-blue-900",
  },
  emerald: {
    base: "bg-emerald-800 hover:bg-emerald-500 active:bg-emerald-900",
  },
  darkBlue: {
    base: "bg-blue-900 hover:bg-blue-600 active:bg-blue-900",
  },
  lightBlue: {
    base: "bg-blue-50 hover:bg-blue-100 active:bg-blue-200",
  },
} as const;

export function Button({
  children,
  onClick,
  size = "normal",
  color = "emerald",
  block = false,
  fullRounded,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "cursor-pointer shadow-md shadow-black/40 border",
        {
          "h-[50px] p-2": size === "normal",
          "h-[25px] p-0.5": size === "small",
        },
        COLOR_CLASSES[color].base,
        className,
        {
          "w-full": block,
          "rounded-full": fullRounded,
          "rounded-xsm ": !fullRounded,
        },
      )}
    >
      {children}
    </button>
  );
}
