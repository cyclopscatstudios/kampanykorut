import classNames from "classnames";
import type { Colors } from "../../types/color";
import React, { createContext } from "react";
import { Icon, type IconProps } from "./Icon";

type ButtonSize = "normal" | "small";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: Colors;
  block?: boolean;
  fullRounded?: boolean;
  className?: string;
}

function getButtonColors(variant: ButtonVariant, color?: Colors) {
  if (variant === "secondary") {
    return "bg-blue-50 hover:bg-blue-100 active:bg-blue-200";
  }
  if (variant === "tertiary") {
    return "bg-transparent hover:bg-blue-100/50 active:bg-blue-200/50";
  }
  switch (color) {
    case "darkBlue":
      return "bg-blue-900 hover:bg-blue-700 active:bg-blue-900";
    case "lightBlue":
      return "bg-blue-50 hover:bg-blue-100 active:bg-blue-200";
    case "transparent":
      return "bg-transparent";
    default:
      return "bg-blue-900 hover:bg-blue-700 active:bg-blue-900";
  }
}

function getBorderColor(color?: Colors) {
  switch (color) {
    case "darkBlue":
      return "border-blue-900";
    case "lightBlue":
      return "border-blue-50";
    default:
      return "border-blue-900";
  }
}

const ButtonContext = createContext<ButtonProps | null>(null);

export function Button(props: ButtonProps) {
  const {
    children,
    onClick,
    variant = "primary",
    size = "normal",
    className,
    color,
    block,
    fullRounded,
  } = props;
  const buttonColors = getButtonColors(variant, color);
  const borderColor = variant === "secondary" ? getBorderColor(color) : "";

  return (
    <ButtonContext.Provider value={{ ...props }}>
      <button
        onClick={onClick}
        className={classNames(
          "cursor-pointer px-4",
          {
            "h-10": size === "normal",
            "h-[30px] py-0.5": size === "small",
            "w-full": block,
            "rounded-full": fullRounded,
            "rounded-sm ": !fullRounded,
            "border-2": variant === "secondary",
          },
          className,
          buttonColors,
          borderColor,
        )}
      >
        {children}
      </button>
    </ButtonContext.Provider>
  );
}

function getButtonTextColor(variant?: ButtonVariant, color?: Colors) {
  if (variant === "secondary" || variant === "tertiary") {
    return "text-blue-900";
  }
  switch (color) {
    case "darkBlue":
      return "text-blue-50";
    case "lightBlue":
      return "text-blue-900";
    default:
      return "text-blue-50";
  }
}

function ButtonText({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(ButtonContext);
  const textColor = getButtonTextColor(ctx?.variant, ctx?.color);
  console.log({ ctx });
  return (
    <span
      className={classNames("font-bold", textColor, {
        underline: ctx?.variant === "tertiary",
      })}
    >
      {children}
    </span>
  );
}

function ButtonIcon({ name, size }: IconProps) {
  const ctx = React.useContext(ButtonContext);
  const iconColor = getIconColor(ctx?.variant ?? "primary");
  return <Icon name={name} size={size} color={ctx?.color ?? iconColor} />;
}

function getIconColor(variant: ButtonVariant) {
  if (variant === "secondary" || variant === "tertiary") {
    return "darkBlue";
  }
}

Button.Text = ButtonText;
Button.Icon = ButtonIcon;
