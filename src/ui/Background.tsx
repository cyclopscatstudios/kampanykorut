import img1 from "../assets/images/38518253_2938573_54667f9f1a048b61efb938fbcdebcfa8_wm.jpg";
import img2 from "../assets/images/1955651626.jpg";
import img3 from "../assets/images/parlament.jpg";
import banner from "../assets/images/banner.png";
import { BannerImage } from "./BannerImage";

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
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[1000px] h-[900px] bg-white border-4 border-slate-100 rounded-sm relative overflow-hidden shadow-xl">
          <BannerImage banner={banner} />
          <div className="flex items-center justify-center w-full h-full pt-[300px]">
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
