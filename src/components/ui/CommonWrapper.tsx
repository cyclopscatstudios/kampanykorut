import classNames from "classnames";

export function CommonWrapper({
  children,
  block,
  className,
  fullHeight = true,
  customBorder = false,
}: {
  children: React.ReactElement;
  block?: boolean;
  fullHeight?: boolean;
  className?: string;
  customBorder?: boolean;
}) {
  return (
    <div
      className={classNames(
        "bg-blue-400/10 rounded-md border",
        {
          "w-full": block,
          "h-full": fullHeight,
          "inline-block": !block,
          "border-blue-50/10": !customBorder,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
