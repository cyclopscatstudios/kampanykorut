import React, {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type CommonProps = {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
};

type SingleLineProps = CommonProps &
  InputHTMLAttributes<HTMLInputElement> & { multiline?: false };

type MultiLineProps = CommonProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

type TextInputProps = SingleLineProps | MultiLineProps;

export const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextInputProps
>(
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
      multiline,
      ...props
    },
    ref,
  ) => {
    const fieldClassName = `
      flex-1 bg-transparent outline-none text-white placeholder-gray-400
      ${className}
    `;

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-300">
            {label}
          </label>
        )}

        <div
          className={`
            flex border rounded-lg px-3 py-2
            bg-gray-800
            ${multiline ? "items-start" : "items-center"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${error ? "border-red-500" : "border-gray-600"}
            focus-within:border-blue-500
          `}
        >
          {prefix && <div className="mr-2 text-gray-400">{prefix}</div>}

          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              disabled={disabled}
              className={fieldClassName}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              disabled={disabled}
              className={fieldClassName}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

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
