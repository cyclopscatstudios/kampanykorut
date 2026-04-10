import classNames from "classnames";
import type { Colors } from "../../types/color";
import React, { createContext } from "react";
import { Icon, type IconProps } from "./Icon";

type ButtonSize = "normal" | "small" | "large";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "transparent";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: Colors;
  block?: boolean;
  fullRounded?: boolean;
  className?: string;
  disabled?: boolean;
}

function getButtonColors(
  variant: ButtonVariant,
  color?: Colors,
  disabled?: boolean,
) {
  if (disabled) {
    return "bg-gray-100/5";
  }
  if (variant === "secondary") {
    return "bg-blue-50 hover:bg-blue-100 active:bg-blue-200";
  }
  if (variant === "tertiary") {
    return "bg-slate-100/10 hover:bg-blue-500 active:bg-blue-600";
  }
  if (variant === "transparent") {
    return "bg-transparent hover:bg-slate-100/10 active:bg-slate-200";
  }
  switch (color) {
    case "blue":
      return "bg-blue-900 hover:bg-blue-700 active:bg-blue-900";
    case "darkBlue":
      return "bg-dark-blue hover:bg-blue-900 active:bg-blue-900";
    case "lightBlue":
      return "bg-blue-50 hover:bg-blue-100 active:bg-blue-200";
    case "red":
      return "bg-red-600 hover:bg-red-400 active:bg-red-800";
    case "transparent":
      return "bg-transparent";
    default:
      return "bg-blue-900 hover:bg-blue-700 active:bg-blue-900";
  }
}

function getBorderColor(
  color?: Colors,
  variant?: ButtonVariant,
  disabled?: boolean,
) {
  if (disabled) {
    return "";
  }
  if (variant === "tertiary") {
    return "border border-slate-50/10";
  }
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
    disabled,
  } = props;
  const buttonColors = getButtonColors(variant, color, disabled);
  const borderColor = getBorderColor(color, variant, disabled);

  return (
    <ButtonContext.Provider value={{ ...props }}>
      <button
        onClick={disabled ? undefined : onClick}
        className={classNames(
          "px-4 inline-flex items-center justify-center gap-2",
          {
            "cursor-pointer": !disabled,
            "cursor-not-allowed": disabled,
            "h-10": size === "normal",
            "h-[50px] py-0.5": size === "large",
            "h-[30px] py-0.5": size === "small",
            "w-full": block,
            "rounded-full": fullRounded,
            "rounded-md ": !fullRounded,
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

function getButtonTextColor(
  variant?: ButtonVariant,
  color?: Colors,
  disabled?: boolean,
) {
  if (disabled) {
    return "text-gray-400";
  }
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

function ButtonText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(ButtonContext);
  const textColor = getButtonTextColor(ctx?.variant, ctx?.color, ctx?.disabled);
  return (
    <span
      className={classNames("font-bold", textColor, className, {
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

function getIconColor(variant: ButtonVariant): Colors {
  if (variant === "secondary" || variant === "tertiary") {
    return "darkBlue";
  }
  return "blue";
}

Button.Text = ButtonText;
Button.Icon = ButtonIcon;
