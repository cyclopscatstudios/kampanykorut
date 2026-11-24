import { Button } from "@shared/ui/Button";
import { Tooltip } from "@shared/ui/Tooltip";
import { t } from "i18next";
import { useState } from "react";

export function DeleteSaveButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={onConfirm}
          testId="confirm-delete-save"
          aria-label={t("savedSessions.delete.confirm")}
        >
          <Button.Icon name="trash3-fill" />
          <Button.Text>{t("savedSessions.delete.confirm")}</Button.Text>
        </Button>
        <Button
          variant="hero"
          size="sm"
          iconOnly
          onClick={() => setConfirming(false)}
          aria-label={t("menuList.button.cancel")}
        >
          <Button.Icon name="x-lg" />
        </Button>
      </div>
    );
  }

  return (
    <Tooltip content={t("savedSessions.delete.hint")} position="left">
      <Button
        variant="hero"
        size="sm"
        iconOnly
        onClick={() => setConfirming(true)}
        testId="delete-save"
        aria-label={t("savedSessions.delete.label")}
      >
        <Button.Icon name="trash3" />
      </Button>
    </Tooltip>
  );
}
