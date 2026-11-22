import classNames from "classnames";
import { FestiveLights } from "./FestiveLights";
import { Snowfall } from "./Snowfall";

function FullscreenBackground({
  children,
  path,
  winter = false,
}: {
  children: React.ReactNode;
  path: string;
  winter?: boolean;
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
      <div data-background-dim className="absolute inset-0 bg-black/50" />
      {winter && <Snowfall />}
      <div className="flex items-center justify-center w-full h-full">
        <div
          data-frame
          className={classNames(
            "size-full md:w-[1200px] md:h-[750px] bg-[rgba(15,23,42,0.92)] rounded-sm shadow-xl shadow-black/60 relative md:overflow-hidden",
          )}
        >
          {winter && <FestiveLights />}
          <div className="flex items-center justify-center w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullscreenBackground;
