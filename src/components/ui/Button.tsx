import classNames from "classnames";
import type { Colors } from "../../types/color";
import React, { createContext } from "react";
import { Icon, type BootstrapIcon, type IconProps } from "./Icon";

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

function getButtonColors(color?: Colors) {
  switch (color) {
    case "darkBlue":
      return "bg-blue-900 hover:bg-blue-700 active:bg-blue-900";
    case "lightBlue":
      return "bg-blue-50 hover:bg-blue-100 active:bg-blue-200";
    case "transparent":
      return "bg-transparent";
    default:
      return "bg-emerald-800 hover:bg-emerald-500 active:bg-emerald-900";
  }
}

const ButtonContext = createContext<ButtonProps | null>(null);

export function Button(props: ButtonProps) {
  const {
    children,
    onClick,
    size = "normal",
    className,
    color,
    block,
    fullRounded,
  } = props;
  const buttonColors = getButtonColors(color);

  return (
    <ButtonContext.Provider value={{ ...props }}>
      <button
        onClick={onClick}
        className={classNames(
          "cursor-pointer",
          {
            "h-[50px] p-2": size === "normal",
            "h-[25px] p-0.5": size === "small",
            "w-full": block,
            "rounded-full": fullRounded,
            "rounded-xsm ": !fullRounded,
          },
          className,
          buttonColors,
        )}
      >
        {children}
      </button>
    </ButtonContext.Provider>
  );
}

function getButtonTextColor(color?: Colors) {
  switch (color) {
    case "darkBlue":
      return "text-blue-50";
    case "lightBlue":
      return "text-blue-900";
    default:
      return "text-white";
  }
}

function ButtonText({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(ButtonContext);
  const textColor = getButtonTextColor(ctx?.color);
  return <span className={textColor}>{children}</span>;
}

function ButtonIcon({ name, size }: IconProps) {
  return <Icon name={name} size={size} />;
}

Button.Text = ButtonText;
Button.Icon = ButtonIcon;
