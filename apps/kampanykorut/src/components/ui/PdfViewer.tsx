export function PdfViewer({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      title="PDF viewer"
      className="w-full h-full rounded-md bg-white"
    />
  );
}
