import { getCheatSettings, updateCheatSettings } from "./cheatStore";

declare global {
  interface Window {
    cheat?: {
      (): boolean;
      on: () => boolean;
      off: () => boolean;
    };
  }
}

function setEnabled(enabled: boolean) {
  updateCheatSettings({ enabled, minimized: false });
  console.log(`Cheat mode: ${enabled ? "ON" : "OFF"}`);
  return enabled;
}

export function initCheatConsole() {
  if (window.cheat) {
    return;
  }
  window.cheat = Object.assign(() => setEnabled(!getCheatSettings().enabled), {
    on: () => setEnabled(true),
    off: () => setEnabled(false),
  });
}
