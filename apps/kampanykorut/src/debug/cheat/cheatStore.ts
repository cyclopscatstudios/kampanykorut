import { StorageEngine } from "@logic/application";
import { useSyncExternalStore } from "react";
import { container } from "tsyringe";

export interface CheatSettings {
  enabled: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  showIds: boolean;
  showEffects: boolean;
  followPath: boolean;
  selectedLines: Record<string, string>;
}

const defaults: CheatSettings = {
  enabled: false,
  minimized: false,
  position: { x: 16, y: 96 },
  showIds: false,
  showEffects: false,
  followPath: false,
  selectedLines: {},
};

const listeners = new Set<() => void>();
let current: CheatSettings | undefined;

function storage() {
  return container.resolve(StorageEngine);
}

function load(): CheatSettings {
  try {
    const raw = storage().getItem("cheatMode", "localStorage");
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function getCheatSettings(): CheatSettings {
  current ??= load();
  return current;
}

export function updateCheatSettings(patch: Partial<CheatSettings>) {
  current = { ...getCheatSettings(), ...patch };
  storage().setItem("cheatMode", JSON.stringify(current), "localStorage");
  listeners.forEach((listener) => listener());
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCheatSettings() {
  return useSyncExternalStore(subscribe, getCheatSettings, () => defaults);
}
