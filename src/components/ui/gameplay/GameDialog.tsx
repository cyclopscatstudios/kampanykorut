import { Button } from "../Button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../Dialog";
import { Heading } from "../Heading";
import { container } from "tsyringe";
import { GameStateEngine } from "@/logic/application";
import { Modal } from "../Modal";
import { useState } from "react";

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

export function GameBody() {
  const gameStateEngine = container.resolve(GameStateEngine);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 h-full">
      {isModalOpen && (
        <ConfirmRestartModal
          onCancel={() => setIsModalOpen(false)}
          onConfirm={() => gameStateEngine.clearGameState()}
        />
      )}
      <Button onClick={() => setIsModalOpen(true)}>
        <Button.Text>Restart</Button.Text>
      </Button>
    </div>
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
