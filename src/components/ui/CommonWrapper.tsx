import classNames from "classnames";

export function CommonWrapper({
  children,
  block,
}: {
  children: React.ReactElement;
  block?: boolean;
}) {
  return (
    <div
      className={classNames(
        "bg-blue-400/10 rounded-md border border-blue-50/10",
        {
          "w-full": block,
          "inline-block": !block,
        },
      )}
    >
      {children}
    </div>
  );
}
