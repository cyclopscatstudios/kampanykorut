import { useSettings } from "@logic/application/hooks/useSettings";
import { AdvisorFeedbackAssets } from "@shared/types";
import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import { Text } from "@shared/ui/Text";
import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    okRef.current?.querySelector("button")?.focus();
    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      } else {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmationModal) {
          setConfirmationModal(false);
        } else {
          onClose();
        }
      } else if (e.key === "Tab" && !confirmationModal) {
        trapFocus(e, panelRef.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, confirmationModal, onClose]);

  if (!open) return null;

  const handleDisable = () => {
    updateSettings({ showAdvisorFeedback: false });
    setConfirmationModal(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal={!confirmationModal}
          aria-labelledby="advisorFeedbackTitle"
          className="flex max-h-[calc(100dvh-24px)] w-[550px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-xl border border-[#4462aa] bg-[#161e30] shadow-xl md:min-h-[450px] md:min-w-[550px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-[#4462aa] p-3">
            <div className="flex justify-center items-center">
              <Icon
                color="currentColor"
                name="info-circle-fill"
                className="mr-3 text-blue-300"
              />
              <Heading id="advisorFeedbackTitle" color="lightBlue" level={3}>
                {t("advisorFeedback.title")}
              </Heading>
            </div>
          </div>
          <div
            tabIndex={0}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-3"
          >
            <div className="mt-auto flex gap-5 justify-center py-3">
              {[
                asset?.primaryAdvisorImageUri,
                asset?.secondaryAdvisorImageUri,
              ].map((img, i) => {
                const name =
                  i === 0
                    ? asset?.primaryAdvisorName
                    : asset?.secondaryAdvisorName;
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="size-20 md:size-[100px] border border-[#4462aa] rounded-xl overflow-hidden">
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {name && (
                      <Text size="xs" weight="medium" className="text-gray-300">
                        {name}
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mx-3 my-auto">
              <div className="bg-[#1d2840] p-3 rounded-xl">
                <Text className="text-sm leading-relaxed text-gray-200">
                  {advice}
                </Text>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              "flex shrink-0 justify-between border-t border-[#4462aa]/50 bg-[#1d2840] p-3",
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

            <div ref={okRef} className="contents">
              <Button
                className="w-[120px]"
                onClick={onClose}
                block={!isDesktop}
              >
                <Button.Text>{t("advisorFeedback.buttons.ok")}</Button.Text>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {confirmationModal && (
        <ConfirmationModal
          title={t("advisorFeedback.modal.title")}
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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const buttons = panelRef.current?.querySelectorAll("button");
    buttons?.[buttons.length - 1]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") trapFocus(e, panelRef.current);
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmationModalTitle"
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

          <Heading id="confirmationModalTitle" color="lightBlue" level={3}>
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

function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !container.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !container.contains(active))) {
    e.preventDefault();
    first.focus();
  }
}
