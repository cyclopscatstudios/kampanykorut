import { useNavigate } from "react-router";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { SettingsEngine } from "@/logic/application";
import { useTranslateLang } from "../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import privacy_file_en from "../../../assets/kampanykorut_privacy_en.pdf";
import privacy_file_hu from "../../../assets/kampanykorut_privacy_hu.pdf";
import { Heading } from "../Heading";
import { PdfViewer } from "../PdfViewer";

export function PrivacyPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const title = useTranslateLang("privacyPage.title");
  const backButton = useTranslateLang("menuList.button.back");
  const openPdfButton = useTranslateLang("privacyPage.openPdf");
  const mobileDescription = useTranslateLang("privacyPage.mobileDescription");

  const lang = container.resolve(SettingsEngine).getGameSettings().language;
  const pdfUrl = lang === "en" ? privacy_file_en : privacy_file_hu;

  const openPdf = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="size-full flex flex-col gap-4 p-4 md:p-6">
      {isDesktop ? (
        <div className="flex-1 min-h-0">
          <PdfViewer src={pdfUrl} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <Heading level={3} color="lightBlue">
            {title}
          </Heading>
          <Text color="gray" size="sm">
            {mobileDescription}
          </Text>
          <Button size="large" block onClick={openPdf}>
            <Icon name="file-earmark-pdf-fill" />
            <Button.Text>{openPdfButton}</Button.Text>
          </Button>
        </div>
      )}
      <Button variant="tertiary" size="large" block onClick={goBack}>
        <Icon name="backspace-fill" />
        <Text weight="medium" color="lightBlue">
          {backButton}
        </Text>
      </Button>
    </div>
  );
}
