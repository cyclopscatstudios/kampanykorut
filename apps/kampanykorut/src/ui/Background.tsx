import classNames from "classnames";

function FullscreenBackground({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundImage: `url(${path})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="flex items-center justify-center w-full h-full">
        <div
          className={classNames(
            "size-full md:w-[1200px] md:h-[750px] bg-[rgba(15,23,42,0.92)] rounded-sm shadow-xl shadow-black/60 relative md:overflow-hidden",
          )}
        >
          <div className="flex items-center justify-center w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullscreenBackground;
