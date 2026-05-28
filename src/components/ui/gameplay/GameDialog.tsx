import { Button } from "../Button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../Dialog";
import { Heading } from "../Heading";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import { Modal } from "../Modal";
import { useState } from "react";
import { useNavigation } from "../../../hooks/navigationHook";

export function GameDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
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
      <DialogFooter>
        <div>
          <Button block variant="secondary" onClick={() => setIsOpen(false)}>
            <Button.Text>Cancel</Button.Text>
          </Button>
        </div>
      </DialogFooter>
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
        <Button.Text>Campaign selector</Button.Text>
      </Button>
      <Button
        variant="tertiary"
        onClick={() => setIsModalOpen({ isOpen: true, type: "restart" })}
      >
        <Button.Text>Restart</Button.Text>
      </Button>
    </div>
  );
}

interface ConfirmCampaignSelectorModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmCampaignSelectorModal({
  onCancel,
  onConfirm,
}: ConfirmCampaignSelectorModalProps) {
  return (
    <Modal
      title="Campaign Selector"
      description="Are you sure you want to return to the campaign selector?"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

interface ConfirmRestartModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmRestartModal({
  onCancel,
  onConfirm,
}: ConfirmRestartModalProps) {
  return (
    <Modal
      title="Attention!"
      description="Are you sure you want to restart the current campaign?"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
