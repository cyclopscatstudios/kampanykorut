import { Text } from "./Text";

type RadioOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type RadioGroupProps<T extends string = string> = {
  name: string;
  options: RadioOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  direction?: "vertical" | "horizontal";
  className?: string;
};

export function RadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  direction = "vertical",
  className,
}: RadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      className={
        direction === "horizontal" ? "flex gap-4" : "flex flex-col gap-2"
      }
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={id}
            className={`flex items-center gap-2 cursor-pointer p-4 bg-slate-800 ${
              option.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Radio
              id={id}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <Text color="lightBlue" className={className}>
              {option.label}
            </Text>
          </label>
        );
      })}
    </div>
  );
}

type RadioProps = {
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: () => void;
};

function Radio({ id, name, value, checked, disabled, onChange }: RadioProps) {
  return (
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="
        h-4 w-4
        accent-blue-900
        cursor-pointer
      "
    />
  );
}
