const cache = new Map<string, unknown>();

export async function fetchJSON<T>(path: string): Promise<T> {
  if (cache.has(path)) {
    return cache.get(path) as T;
  }

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }

  const data = await res.json();
  cache.set(path, data);

  return data;
}
