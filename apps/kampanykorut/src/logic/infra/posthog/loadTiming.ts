let loadStartedAt: number | undefined;

export function markCampaignLoadStart() {
  loadStartedAt = performance.now();
}

export function takeCampaignLoadDuration() {
  if (loadStartedAt === undefined) {
    return undefined;
  }
  const duration = performance.now() - loadStartedAt;
  loadStartedAt = undefined;
  return duration;
}
