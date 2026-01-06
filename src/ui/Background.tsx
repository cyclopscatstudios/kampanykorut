import img from "../assets/images/parlament_night.jpg";
import classNames from "classnames";

function FullscreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="flex items-center justify-center w-full h-full">
        <div
          className={classNames(
            "w-[1200px] h-[800px] bg-[rgba(15,23,42,0.92)] rounded-sm shadow-xl shadow-black/60 relative overflow-hidden",
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
