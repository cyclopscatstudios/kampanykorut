import "reflect-metadata";
import "@logic/infra/sentry";
import "./di/container";
import "@logic/i18n/i18n";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { initAnalytics } from "@logic/infra/posthog/posthog";
import { initStorageErrorNotifier } from "@logic/infra/storageErrorNotifier";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { initCheatConsole } from "./debug/cheat/cheatConsole";
import { initDevApi } from "./initApi";
import { router } from "./router";

initStorageErrorNotifier();

if (import.meta.env.DEV || import.meta.env.PLAYWRIGHT === "true") {
  initDevApi();
}

if (import.meta.env.VITE_ENVIRONMENT !== "production") {
  initCheatConsole();
}

if (import.meta.env.PROD && import.meta.env.VITE_ENVIRONMENT === "production") {
  initAnalytics();
}

const rootElement = document.getElementById("root")!;

function mount() {
  createRoot(rootElement).render(
    <StrictMode>
      <Toaster />
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

if (rootElement.hasChildNodes() && !router.state.initialized) {
  const unsubscribe = router.subscribe((state) => {
    if (!state.initialized) return;
    unsubscribe();
    mount();
  });
} else {
  mount();
}
