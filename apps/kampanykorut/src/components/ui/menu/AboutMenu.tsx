import { useNavigate } from "react-router";
import { useTranslateLang } from "../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { PdfViewer } from "../PdfViewer";

export function AboutMenu() {
  const navigate = useNavigate();
  const backButton = useTranslateLang("menuList.button.back");
  return (
    <div className="m-5">
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
