import { container } from "tsyringe";
import { SettingsEngine } from "@/logic/application";
import about_file_en from "../../assets/kampanykorut_about_en.pdf";
import about_file_hu from "../../assets/kampanykorut_about_hu.pdf";

export function PdfViewer() {
  const settingsEngine = container.resolve(SettingsEngine);
  const lang = settingsEngine.getGameSettings().language;

  return (
    <iframe
      src={lang === "en" ? about_file_en : about_file_hu}
      width="1000px"
      height="650px"
      title="PDF viewer"
      className="m-5"
    />
  );
}
