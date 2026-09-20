import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { AdvisorFeedbackAssets } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { useSettings } from "../../../logic/application/hooks/useSettings";
import { Heading } from "../Heading";

interface AdvisorModalProps {
  advice: string;
  open: boolean;
  onClose: () => void;
  asset?: AdvisorFeedbackAssets;
}

export function AdvisorModal({
  advice,
  open,
  onClose,
  asset,
}: AdvisorModalProps) {
  const [confirmationModal, setConfirmationModal] = useState(false);
  const { updateSettings } = useSettings();

  const isDesktop = useMediaQuery("(min-width: 768px)");

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
    updateSettings({ showAdvisorFeedback: false });
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
          className="h-[450px] w-[550px] md:min-w-[550px] max-w-[90vw] bg-[#161e30] rounded-xl border border-[#4462aa] flex flex-col justify-between shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-[#4462aa] p-3">
            <div className="flex justify-center items-center">
              <Icon color="purple" name="info-circle-fill" className="mr-3" />
              <Heading color="lightBlue" level={3}>
                {t("advisorFeedback.title")}
              </Heading>
            </div>
          </div>
          <div className="flex gap-5 justify-center py-3">
            {[
              asset?.primaryAdvisorImageUri,
              asset?.secondaryAdvisorImageUri,
            ].map((img, i) => (
              <Tooltip
                content={
                  i === 0
                    ? (asset?.primaryAdvisorName ?? "")
                    : (asset?.secondaryAdvisorName ?? "")
                }
              >
                <div
                  key={i}
                  className="w-[100px] h-[100px] border border-[#4462aa] rounded-xl overflow-hidden"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="mx-3">
            <div className="bg-[#1d2840] p-3 rounded-xl">
              <Text className="text-sm leading-relaxed text-gray-200">
                {advice}
              </Text>
            </div>
          </div>
          <div
            className={classNames(
              "bg-[#1d2840] flex justify-between p-3 rounded-b-xl",
              {
                "flex-col": !isDesktop,
              },
            )}
          >
            <Button
              variant="tertiary"
              onClick={() => setConfirmationModal(true)}
              block={!isDesktop}
              className={!isDesktop ? "mb-2" : ""}
            >
              <Button.Icon name="eye-slash-fill" color="white" />
              <Button.Text>{t("advisorFeedback.buttons.turnOff")}</Button.Text>
            </Button>

            <Button className="w-[120px]" onClick={onClose} block={!isDesktop}>
              <Button.Text>{t("advisorFeedback.buttons.ok")}</Button.Text>
            </Button>
          </div>
        </div>
      </div>
      {confirmationModal && (
        <ConfirmationModal
          title={t("exitDialog.title")}
          description={t("advisorFeedback.modal.description")}
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
        className="md:min-w-[550px] max-w-[90vw] bg-[#131824] p-5 rounded-xl border-2 border-[#244185] flex flex-col justify-between shadow-xl"
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
            <Button.Text>
              {t("advisorFeedback.modal.buttons.disable")}
            </Button.Text>
          </Button>

          <Button onClick={onCancel} variant="secondary">
            <Button.Text>{t("menuList.button.cancel")}</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
