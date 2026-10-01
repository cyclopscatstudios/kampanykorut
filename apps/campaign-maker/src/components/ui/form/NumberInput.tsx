import classNames from "classnames";

const inputClass =
  "h-12 w-full rounded-lg border border-slate-200 px-4 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 focus:border-brand-600 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-600/20";

export function NumberInput({
  value,
  onChange,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  const input = (
    <input
      type="number"
      className={classNames(inputClass, suffix && "pr-10")}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );

  if (!suffix) return input;

  return (
    <div className="relative">
      {input}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        {suffix}
      </span>
    </div>
  );
}
