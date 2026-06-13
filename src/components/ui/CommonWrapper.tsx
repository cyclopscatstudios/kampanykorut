import classNames from "classnames";

export function CommonWrapper({
  children,
  block,
  className,
  fullHeight = true
}: {
  children: React.ReactElement;
  block?: boolean;
  fullHeight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "bg-blue-400/10 rounded-md border border-blue-50/10",
        {
          "w-full": block,
          "h-full": fullHeight,
          "inline-block": !block,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
