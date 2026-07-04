import { useNavigate } from "react-router";
import { useTranslateLang } from "../../../logic/useTranslateLang";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { PdfViewer } from "../PdfViewer";

export function AboutMenu() {
  const navigate = useNavigate();
  const backButton = useTranslateLang("menuList.button.back");
  return (
    <div className="w-full m-5">
      <PdfViewer />
      <div className="mt-4">
        <Button
          variant="tertiary"
          size="large"
          block
          onClick={() => navigate(-1)}
        >
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {backButton}
          </Text>
        </Button>
      </div>
    </div>
  );
}
