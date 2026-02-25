import classNames from "classnames";

type ImageType = "portrait" | "slogan";

interface ImageWrapperProps {
  src: string;
  type: ImageType;
  name?: string;
}

export function ImageWrapper({ src, type, name }: ImageWrapperProps) {
  const style = getStyleByAspectRatio(type);

  return (
    <div
      className={classNames(
        "bg-white shadow-lg shadow-blue-900/50 flex items-center justify-center",
        style,
      )}
    >
      <img
        src={src}
        className="max-w-full max-h-full object-contain"
        alt={`${name}-${type}`}
      />
    </div>
  );
}

function getStyleByAspectRatio(type: ImageType) {
  switch (type) {
    case "portrait":
      return "w-[200px] aspect-[3/4]";
    case "slogan":
      return "w-[300px] aspect-[16/9]";
  }
}
