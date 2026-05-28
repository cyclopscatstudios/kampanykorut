import classNames from "classnames";
import React, { createContext } from "react";
import { Icon, type IconProps } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "tab"
  | "subtab"
  | "hero"
  | "underline";

export type ButtonSize = "sm" | "md" | "lg" | "normal" | "small" | "large";

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconOnly?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-[30px] px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-[50px] px-6 text-[15px] gap-2.5",
  normal: "h-10 px-4 text-sm gap-2",
  small: "h-[30px] px-3 text-xs gap-1.5",
  large: "h-[50px] px-6 text-[15px] gap-2.5",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "w-[30px] h-[30px] p-0",
  md: "w-10 h-10 p-0",
  lg: "w-[50px] h-[50px] p-0",
  normal: "w-10 h-10 p-0",
  small: "w-[30px] h-[30px] p-0",
  large: "w-[50px] h-[50px] p-0",
};

const subtabSizeClasses: Record<ButtonSize, string> = {
  sm: "text-[13px] py-1",
  md: "text-sm py-2",
  lg: "text-base py-2.5",
  normal: "text-sm py-2",
  small: "text-[13px] py-1",
  large: "text-base py-2.5",
};

function variantClasses(
  variant: ButtonVariant,
  selected: boolean,
  disabled: boolean,
): string {
  if (disabled) {
    return "bg-[rgba(148,163,184,0.08)] text-slate-500 shadow-btn-disabled cursor-not-allowed";
  }

  switch (variant) {
    case "primary":
      return [
        "bg-btn-primary text-slate-50",
        "shadow-btn-primary",
        "hover:bg-btn-primary-hover hover:shadow-btn-primary-hover",
        "active:translate-y-px",
      ].join(" ");

    case "secondary":
      return [
        "bg-btn-secondary text-blue-900",
        "shadow-btn-secondary",
        "hover:bg-btn-secondary-hover hover:shadow-btn-secondary-hover",
      ].join(" ");

    case "tertiary":
      return selected
        ? [
            "bg-[rgba(148,163,184,0.07)] text-blue-200",
            "shadow-btn-tertiary backdrop-blur-md",
            "border border-blue-400",
            "hover:bg-[rgba(148,163,184,0.16)] hover:shadow-btn-tertiary-hover",
          ].join(" ")
        : [
            "bg-[rgba(148,163,184,0.07)] text-slate-300",
            "shadow-btn-tertiary backdrop-blur-md",
            "hover:bg-[rgba(148,163,184,0.16)] hover:shadow-btn-tertiary-hover",
          ].join(" ");

    case "tab":
      return selected
        ? "bg-btn-primary text-slate-50 shadow-btn-tab-selected"
        : "bg-[rgba(148,163,184,0.05)] text-slate-300 shadow-btn-tab-idle hover:bg-[rgba(148,163,184,0.12)] hover:shadow-btn-tab-idle-hover";

    case "subtab":
      return selected
        ? "bg-transparent text-slate-50 font-bold underline decoration-blue-400 decoration-2 underline-offset-[10px] px-0.5"
        : "bg-transparent text-slate-400 font-semibold hover:text-slate-300 px-0.5";

    case "hero":
      return [
        "bg-[rgba(15,23,42,0.45)] text-slate-50 backdrop-blur-lg",
        "shadow-btn-hero",
        "hover:bg-[rgba(15,23,42,0.6)] hover:shadow-btn-hero-hover",
      ].join(" ");

    case "underline":
      return "bg-transparent text-slate-300 px-0.5";
  }
}

const ButtonContext = createContext<ButtonProps | null>(null);

export function Button(props: ButtonProps) {
  const {
    children,
    onClick,
    variant = "primary",
    size = "md",
    block,
    iconOnly,
    selected = false,
    disabled = false,
    className,
    testId,
  } = props;

  const isSubtab = variant === "subtab";

  const sizeCls = iconOnly
    ? iconOnlySizeClasses[size]
    : isSubtab
      ? subtabSizeClasses[size]
      : sizeClasses[size];

  return (
    <ButtonContext.Provider value={props}>
      <button
        data-testid={testId}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={classNames(
          "inline-flex items-center justify-center font-bold whitespace-nowrap",
          "transition-[background,box-shadow,transform] duration-150 ease-out",
          "font-montserrat tracking-[0.1px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue",
          !isSubtab && "rounded-md",
          sizeCls,
          block && "w-full",
          variantClasses(variant, selected, disabled),
          !disabled && "cursor-pointer",
          className,
        )}
      >
        {children}
      </button>
    </ButtonContext.Provider>
  );
}

function ButtonText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

function ButtonIcon({ name, size: iconSize, color }: IconProps) {
  const ctx = React.useContext(ButtonContext);
  const sizeMap: Record<ButtonSize, number> = {
    sm: 14,
    md: 16,
    lg: 18,
    normal: 16,
    small: 14,
    large: 18,
  };
  return (
    <Icon
      name={name}
      size={iconSize ?? sizeMap[ctx?.size ?? "md"]}
      color={color ?? "currentColor"}
    />
  );
}

Button.Text = ButtonText;
Button.Icon = ButtonIcon;
