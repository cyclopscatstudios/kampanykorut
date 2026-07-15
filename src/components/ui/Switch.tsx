import classNames from "classnames";
import { forwardRef, useId } from "react";
import { Text } from "./Text";

export interface SwitchProps {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      error,
      id,
      className = "",
      wrapperClassName = "",
      disabled,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    return (
      <div className={classNames("flex flex-col gap-1", wrapperClassName)}>
        <label
          htmlFor={switchId}
          className={classNames(
            "inline-flex items-center gap-2 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <span className="relative inline-flex h-6 w-11 shrink-0">
            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              role="switch"
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="peer sr-only"
              {...props}
            />

            <span
              className={classNames(
                "absolute inset-0 rounded-full",
                "bg-[rgba(148,163,184,0.12)] shadow-btn-tertiary",
                "transition-[background,box-shadow] duration-150 ease-out",
                "peer-checked:bg-btn-primary peer-checked:shadow-btn-primary",
                "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-dark-blue",
                error && "ring-1 ring-inset ring-red-500",
                className,
              )}
            />
            <span
              className={classNames(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full",
                "bg-slate-50 shadow-btn-secondary",
                "transition-transform duration-150 ease-out",
                "peer-checked:translate-x-5",
              )}
            />
          </span>

          {label && <Text className="text-sm">{label}</Text>}
        </label>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Switch.displayName = "Switch";
