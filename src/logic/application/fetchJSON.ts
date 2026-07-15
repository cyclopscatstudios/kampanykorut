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

  const data = await res.json();
  return data;
}

export async function fetchCampaignFile<T>(
  route: string,
  relativePath: string,
): Promise<T> {
  const path = `/campaigns/${route}/${relativePath}`;
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }

  return await res.json();
}
