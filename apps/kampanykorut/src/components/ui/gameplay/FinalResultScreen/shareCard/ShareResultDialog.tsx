import { useEffect, useMemo, useState } from "react";
import { createLogger } from "@/shared/logger/logger";
import { useTranslate } from "../../../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../../../shared/ui/Button";
import type { AnalyticsEvents } from "../../../../../logic/infra/posthog/events";
import { Dialog } from "../../../Dialog";
import { toaster } from "../../toaster";
import { renderShareCard } from "./drawShareCard";
import type { ShareCardData } from "./shareCard.utils";

const log = createLogger("ShareResultDialog");

type ShareChannel = AnalyticsEvents["result_shared"]["channel"];

interface ShareResultDialogProps {
  card: ShareCardData;
  onClose: () => void;
  onShared: (channel: ShareChannel) => void;
}

export function ShareResultDialog({
  card,
  onClose,
  onShared,
}: ShareResultDialogProps) {
  const t = useTranslate();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderShareCard(card)
      .then((result) => !cancelled && setBlob(result))
      .catch((error) => {
        log.error("Share card render failed", { error });
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [card]);

  const previewUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob],
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const file = useMemo(
    () =>
      blob ? new File([blob], card.fileName, { type: "image/png" }) : null,
    [blob, card.fileName],
  );
  const canShareNative =
    Boolean(file) &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file!] });
  const shareNative = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], text: card.shareText });
      onShared("native");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        log.warn("Native share failed", { error });
        toaster(t("endResult.share.failed"), "Error");
      }
    }
  };

  const download = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = card.fileName;
    link.click();
    onShared("download");
  };

  return (
    <Dialog open onClose={onClose} panelClassName="w-[min(760px,92vw)]">
      <div className="p-3 md:p-4">
        <div className="mb-2 flex justify-end">
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label={t("endResult.share.close")}
            onClick={onClose}
          >
            <Button.Icon name="x-lg" />
          </Button>
        </div>
        <div
          className="aspect-[1200/630] w-full overflow-hidden rounded-lg bg-[#0a1224] flex items-center justify-center"
          data-testid="shareCardPreview"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={card.shareText}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-slate-400">
              {t(failed ? "endResult.share.failed" : "endResult.share.loading")}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:justify-end *:w-full md:*:w-auto">
          {canShareNative && (
            <Button onClick={shareNative} testId="shareNative">
              <Button.Icon name="share-fill" />
              <Button.Text>{t("endResult.share.native")}</Button.Text>
            </Button>
          )}
          <Button
            variant={canShareNative ? "secondary" : "primary"}
            onClick={download}
            disabled={!previewUrl}
            testId="shareDownload"
          >
            <Button.Icon name="download" />
            <Button.Text>{t("endResult.share.download")}</Button.Text>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
