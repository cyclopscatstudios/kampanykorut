import { DATA_PATHS, getDataPath } from "./PathResolver";

export async function fetchJSON<T>(
  key: keyof typeof DATA_PATHS,
  route?: string,
): Promise<T> {
  const path = getDataPath(key, route);

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }

  const data = res.json();
  return data;
}

export async function getCampaignConfigByRoute(route: string) {
  const module = await import(`/campaigns/${route}/config.ts`);
  return module.config2022;
}
