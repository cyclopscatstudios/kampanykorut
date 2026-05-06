import { getDataPath } from "../../logic/application/PathResolver";

export function rootLoader() {
  return getDataPath("background");
}
