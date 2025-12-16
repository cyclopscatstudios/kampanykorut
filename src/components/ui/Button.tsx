import classNames from "classnames";
import type { Colors } from "../../types/color";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
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
} as const;

export function Button({
  children,
  onClick,
  color = "emerald",
  block = false,
  fullRounded,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "h-[50px] cursor-pointer p-2   shadow-md shadow-black/40 border border-emerald-900/40",

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
