import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { useNavigation } from "../../../hooks/navigationHook";
import { Dialog, DialogBody, DialogHeader } from "../Dialog";
import { Heading } from "../Heading";
import { Modal } from "../Modal";

export function GameDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      buttons={{
        secondary: (
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            <Button.Text>{t("menuList.button.cancel")}</Button.Text>
          </Button>
        ),
      }}
    >
      <DialogHeader>
        <div>
          <Heading level={3} color="lightBlue">
            Kampánykörút
          </Heading>
        </div>
      </DialogHeader>
      <DialogBody>
        <div>
          <GameBody />
        </div>
      </DialogBody>
    </Dialog>
  );
}

interface ModalState {
  isOpen: boolean;
  type: "restart" | "campaignSelector" | null;
}

export function GameBody() {
  const gameStateEngine = container.resolve(StateEngine);
  const [isModalOpen, setIsModalOpen] = useState<ModalState>({
    isOpen: false,
    type: null,
  });
  const { goToCampaignSelector } = useNavigation();

  return (
    <div className="flex flex-col gap-5 h-full">
      {isModalOpen.type === "campaignSelector" && (
        <ConfirmCampaignSelectorModal
          onCancel={() => setIsModalOpen({ isOpen: false, type: null })}
          onConfirm={() => {
            goToCampaignSelector();
          }}
        />
      )}
      {isModalOpen.type === "restart" && (
        <ConfirmRestartModal
          onCancel={() => setIsModalOpen({ isOpen: false, type: null })}
          onConfirm={() => gameStateEngine.clearGameState("restart")}
        />
      )}
      <Button
        variant="tertiary"
        onClick={() =>
          setIsModalOpen({ isOpen: true, type: "campaignSelector" })
        }
      >
        <Button.Text>
          {t("gameMenuBar.kampanykorut.campaignSelector")}
        </Button.Text>
      </Button>
      <Button
        variant="tertiary"
        onClick={() => setIsModalOpen({ isOpen: true, type: "restart" })}
      >
        <Button.Text>{t("gameMenuBar.kampanykorut.restart")}</Button.Text>
      </Button>
    </div>
  );
}

interface ConfirmCampaignSelectorModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmCampaignSelectorModal({
  onCancel,
  onConfirm,
}: ConfirmCampaignSelectorModalProps) {
  return (
    <Modal
      title={t("campaignSelectorDialog.title")}
      description={t("campaignSelectorDialog.description")}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

interface ConfirmRestartModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmRestartModal({
  onCancel,
  onConfirm,
}: ConfirmRestartModalProps) {
  return (
    <Modal
      title={t("exitDialog.title")}
      description={t("restartDialog.description")}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
