import { container } from "tsyringe";
import { StorageEngine } from "@/logic/application";

declare global {
  interface Window {
    debugMode?: {
      enabled: boolean;
      toggle: () => boolean;
      enable: () => boolean;
    };
  }
}

export function initCampaignDebug() {
  const storage = container.resolve(StorageEngine);
  if (window.debugMode) {
    return;
  }

  window.debugMode = {
    enabled: false,
    toggle() {
      this.enabled = !this.enabled;
      storage.setItem("debugMode", String(this.enabled), "localStorage");
      console.log(`Debug mode: ${this.enabled ? "ON" : "OFF"}`);
      return this.enabled;
    },
    enable() {
      this.enabled = true;
      storage.setItem("debugMode", String(this.enabled), "localStorage");
      console.log(`Debug mode: "ON" `);
      return this.enabled;
    },
  };
}
