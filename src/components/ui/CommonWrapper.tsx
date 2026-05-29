import classNames from "classnames";

export function CommonWrapper({
  children,
  block,
  className,
}: {
  children: React.ReactElement;
  block?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "h-full bg-blue-400/10 rounded-md border border-blue-50/10",
        {
          "w-full": block,
          "inline-block": !block,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
