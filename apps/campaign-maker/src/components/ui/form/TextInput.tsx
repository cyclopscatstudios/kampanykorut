const inputClass =
  "h-12 w-full rounded-lg border border-slate-200 px-4 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 focus:border-brand-600 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-600/20";

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
