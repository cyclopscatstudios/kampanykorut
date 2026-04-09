import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import { Icon } from "../Icon";
import type { AdvisorFeedbackAssets } from "../../../logic/types/campaignEngine.types";
import { GameConfigEngine } from "@/logic/application";
import { container } from "tsyringe";

interface AdvisorModalProps {
  advice: string;
  open: boolean;
  onClose: () => void;
  asset: AdvisorFeedbackAssets;
}

export function AdvisorModal({
  advice,
  open,
  onClose,
  asset,
}: AdvisorModalProps) {
  const [confirmationModal, setConfirmationModal] = useState(false);
  const gameConfigEngine = container.resolve(GameConfigEngine);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmationModal) {
          setConfirmationModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [confirmationModal, onClose]);

  if (!open) return null;

  const handleDisable = () => {
    gameConfigEngine.updateGameSettings({ showAdvisorFeedback: false });
    setConfirmationModal(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <div
          className="w-[550px] h-[450px] bg-[#161e30] rounded-xl border border-[#4462aa] flex flex-col justify-between shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-[#4462aa] p-3">
            <div className="flex justify-center items-center">
              <Icon color="purple" name="info-circle-fill" className="mr-3" />
              <Heading color="lightBlue" level={3}>
                Advisor feedback
              </Heading>
            </div>
          </div>
          <div className="flex gap-5 justify-center py-3">
            {[asset.primaryAdvisorImageUri, asset.secondaryAdvisorImageUri].map(
              (img, i) => (
                <div
                  key={i}
                  className="w-[100px] h-[100px] border border-[#4462aa] rounded-xl overflow-hidden"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ),
            )}
          </div>
          <div className="mx-3">
            <div className="bg-[#1d2840] p-3 rounded-xl">
              <Text className="text-sm leading-relaxed text-gray-200">
                {advice}
              </Text>
            </div>
          </div>
          <div className="bg-[#1d2840] flex justify-between p-3 rounded-b-xl">
            <Button
              variant="transparent"
              onClick={() => setConfirmationModal(true)}
            >
              <Button.Icon name="eye-slash-fill" />
              <Button.Text>Turn off advisor insights</Button.Text>
            </Button>

            <Button className="w-[120px]" onClick={onClose}>
              <Button.Text>Ok</Button.Text>
            </Button>
          </div>
        </div>
      </div>
      {confirmationModal && (
        <ConfirmationModal
          title="Disable advisor feedback?"
          description="You won’t receive strategic hints from advisors anymore."
          onCancel={() => setConfirmationModal(false)}
          onConfirm={handleDisable}
        />
      )}
    </>
  );
}

interface ConfirmationModalProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  title,
  onCancel,
  onConfirm,
  description,
}: ConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-[400px] bg-[#131824] p-5 rounded-xl border-2 border-[#244185] flex flex-col justify-between shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-center">
          <div className="flex justify-center items-center mb-3">
            <div className="w-[50px] h-[50px] bg-blue-900 rounded-full flex justify-center items-center">
              <Icon
                name="exclamation-triangle-fill"
                color="lightBlue"
                size="large"
              />
            </div>
          </div>

          <Heading color="lightBlue" level={3}>
            {title}
          </Heading>
        </div>

        {description && (
          <div className="my-5 mx-3">
            <Text className="text-sm text-gray-300 text-center">
              {description}
            </Text>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={onConfirm}>
            <Button.Text>Disable</Button.Text>
          </Button>

          <Button onClick={onCancel} variant="secondary">
            <Button.Text>Cancel</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
