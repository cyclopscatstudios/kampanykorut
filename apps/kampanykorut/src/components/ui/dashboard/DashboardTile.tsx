import classNames from "classnames";
import { type ReactNode, useState } from "react";

export function Tile({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      aria-label={label}
      className={classNames(
        "relative flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-xl p-6 text-center",
        className ??
          "bg-blue-400/8 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]",
      )}
    >
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
        {label}
      </span>
      {children}
    </article>
  );
}

export function HoverDetail({
  id,
  detail,
  children,
}: {
  id: string;
  detail: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const detailId = `${id}-detail`;

  return (
    <div
      tabIndex={0}
      aria-describedby={detailId}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      {children}
      <div
        id={detailId}
        role="tooltip"
        className={
          open
            ? "absolute inset-0 flex flex-col overflow-y-auto overscroll-contain rounded-xl bg-[#161e30] p-4 text-left shadow-[inset_0_0_0_1px_#4462aa]"
            : "sr-only"
        }
      >
        <p className="m-0 my-auto text-sm leading-[21px] text-slate-100">
          {detail}
        </p>
      </div>
    </div>
  );
}

export function Emblem({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-flex size-[72px] items-center justify-center rounded-full",
        className,
      )}
    >
      {children}
    </span>
  );
}
