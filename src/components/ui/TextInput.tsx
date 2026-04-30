import React, { forwardRef, type InputHTMLAttributes } from "react";

type TextInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      prefix,
      suffix,
      fullWidth = true,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-300">
            {label}
          </label>
        )}

        <div
          className={`
            flex items-center border rounded-lg px-3 py-2
            bg-gray-800
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${error ? "border-red-500" : "border-gray-600"}
            focus-within:border-blue-500
          `}
        >
          {prefix && <div className="mr-2 text-gray-400">{prefix}</div>}

          <input
            ref={ref}
            disabled={disabled}
            className={`
              flex-1 bg-transparent outline-none text-white placeholder-gray-400
              ${className}
            `}
            {...props}
          />

          {suffix && <div className="ml-2 text-gray-400">{suffix}</div>}
        </div>

        {error ? (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
