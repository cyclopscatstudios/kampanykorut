import { getDataPath } from "../../logic/application/PathResolver";

const environment = import.meta.env.VITE_ENVIRONMENT;
const showLandingPage = import.meta.env.VITE_LANDING;

export function rootLoader() {
  return getDataPath("background");
}

export function landingPageRouter() {
  if (showLandingPage) {
    return;
  }
  if (environment === "dev" || environment === "development") {
    window.location.href = "/menu";
  }
}
