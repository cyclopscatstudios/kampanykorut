import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { Text } from "./Text";

type Option<T> = {
  label: string;
  value: T;
};

type DropdownProps<T> = {
  options: Option<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  renderItem?: (option: Option<T>, isSelected: boolean) => React.ReactNode;
  renderLabel?: (selected?: Option<T>) => React.ReactNode;
  disabled?: boolean;
};

export function Dropdown<T>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  renderItem,
  renderLabel,
  disabled,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<T | undefined>(value);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === (value ?? internalValue));

  const handleSelect = (val: T) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-64">
      <Button
        variant="tertiary"
        size="large"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 rounded-md text-left"
        disabled={disabled}
      >
        {renderLabel
          ? renderLabel(selected)
          : selected?.label || (
              <Text weight="medium" color="gray">
                {placeholder}
              </Text>
            )}
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
          {options.map((option, key) => {
            const isSelected = option.value === selected?.value;

            return (
              <div
                key={key}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  isSelected ? "bg-gray-200" : ""
                }`}
              >
                {renderItem ? renderItem(option, isSelected) : option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
