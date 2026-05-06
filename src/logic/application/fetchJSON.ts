import { DATA_PATHS, getDataPath } from "./PathResolver";

export async function fetchJSON<T>(
  key: keyof typeof DATA_PATHS,
  route?: string,
): Promise<T> {
  console.log({ key, route });
  const path = getDataPath(key, route);

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }

  const text = await res.text();

  console.log("FETCH PATH:", path);
  console.log("RESPONSE TEXT START:", text.slice(0, 50));

  if (text.startsWith("<!doctype")) {
    throw new Error(`❌ HTML jött vissza, rossz path: ${path}`);
  }

  const data = JSON.parse(text);
  return data;
}

export async function getCampaignConfigByRoute(route: string) {
  const module = await import(`/campaigns/${route}/config.ts`);
  return module.config2022;
}
