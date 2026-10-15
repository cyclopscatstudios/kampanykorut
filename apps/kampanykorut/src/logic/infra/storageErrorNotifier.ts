import { container } from "tsyringe";
import { createLogger } from "@/shared/logger";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import { toaster } from "../../components/ui/gameplay/toaster";
import i18n from "../i18n/i18n";

const log = createLogger("storageErrorNotifier");

export function initStorageErrorNotifier(
  storage: StorageEngine = container.resolve(StorageEngine),
) {
  let notified = false;
  return storage.onWriteError((reason, key) => {
    log.error("storage write failed", { reason, key });
    if (notified) {
      return;
    }
    notified = true;
    const label =
      reason === "quota"
        ? i18n.t("toaster.storageQuotaExceeded")
        : i18n.t("toaster.storageWriteFailed");
    toaster(label, "Error", { id: "storage-write-error", duration: 8000 });
  });
}
