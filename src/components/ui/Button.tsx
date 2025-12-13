import classNames from "classnames";
import type { Colors } from "../../types/color";

interface ButtonProps {
  children: React.ReactNode;
  color?: Colors;
  block?: boolean;
  fullRounded?: boolean;
}

const COLOR_CLASSES = {
  red: {
    base: "bg-red-700 hover:bg-red-500 active:bg-red-900",
  },
  blue: {
    base: "bg-blue-700 hover:bg-blue-500 active:bg-blue-900",
  },
  emerald: {
    base: "bg-emerald-700 hover:bg-emerald-500 active:bg-emerald-900",
  },
} as const;

export function Button({ children, color = 'emerald', block = false, fullRounded }: ButtonProps) {
  return (
    <button
      className={classNames(
        "h-[50px] cursor-pointer p-2",
        COLOR_CLASSES[color].base,
        { 
            "w-full": block ,
            "rounded-full": fullRounded,
            "rounded-sm ": !fullRounded,
        }
      )}
    >
      {children}
    </button>
  );
}