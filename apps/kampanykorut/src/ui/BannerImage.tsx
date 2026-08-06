export function BannerImage({ banner }: { banner: string }) {
  return (
    <div
      className="absolute top-0 left-0 w-full h-[300px]"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
