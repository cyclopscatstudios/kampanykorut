import { forwardRef, useId } from "react";
import { Text } from "./Text";

export interface CheckboxProps {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  defaultChecked?: boolean;
  onChange: (e: any) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      id,
      className = "",
      wrapperClassName = "",
      disabled,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
        <label
          data-testId={id}
          htmlFor={checkboxId}
          className={`flex items-center gap-2 cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={onChange}
            className={`
              h-4 w-4 rounded border-gray-300
              text-blue-600
              focus:ring-2 focus:ring-blue-500
              ${error ? "border-red-500" : ""}
              ${className}
            `}
            {...props}
          />

          {label && <Text className="text-sm">{label}</Text>}
        </label>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
