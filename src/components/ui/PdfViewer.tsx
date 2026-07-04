import pdfFile from "../../../public/assets/pdf/kampanykorut_about_hu.pdf";

export function PdfViewer() {
  return (
    <iframe
      src={pdfFile}
      width="100%"
      height="800px"
      title="PDF viewer"
      className="m-5"
    />
  );
}
