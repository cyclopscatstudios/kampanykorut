import { t } from "i18next";
import { Button } from "../../Button";
import { Tooltip } from "../../Tooltip";

interface BugReporterButtonProps {
  onChange: () => void;
  variant: "main" | "top";
  iconColor?: "darkBlue" | "white";
}

export function BugReporterButton({
  onChange,
  variant,
  iconColor,
}: BugReporterButtonProps) {
  return (
    <Tooltip content={t("bugReporter.title")} position="bottom">
      <Button
        variant={variant === "main" ? "underline" : "tertiary"}
        onClick={onChange}
      >
        <Button.Icon name="bug-fill" color={iconColor}></Button.Icon>
      </Button>
    </Tooltip>
  );
}
