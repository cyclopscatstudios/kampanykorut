import img1 from "../assets/images/38518253_2938573_54667f9f1a048b61efb938fbcdebcfa8_wm.jpg";
import img2 from "../assets/images/1955651626.jpg";
import img3 from "../assets/images/parlament.jpg";

function FullscreenBackground({ children }: { children: React.ReactNode }) {
  const img = getRandomImage();

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
        <div className="w-[1200px] h-[800px] bg-[rgba(15,23,42,0.92)] border border-slate-700 rounded-sm shadow-xl shadow-black/60 relative overflow-hidden">
          <div className="flex items-center justify-center w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRandomImage() {
  const images = [img1, img2, img3];
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

export default FullscreenBackground;
