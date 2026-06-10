async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  healthCheck: () => fetchAPI<{ status: string }>('/health'),
};
