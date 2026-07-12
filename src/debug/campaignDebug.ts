declare global {
  interface Window {
    debugMode?: {
      enabled: boolean;
      toggle: () => boolean;
    };
  }
}

export function initCampaignDebug() {
  if (window.debugMode) {
    return;
  }

  window.debugMode = {
    enabled: false,
    toggle() {
      this.enabled = !this.enabled;
      console.log(`Debug mode: ${this.enabled ? "ON" : "OFF"}`);
      return this.enabled;
    },
  };
}
