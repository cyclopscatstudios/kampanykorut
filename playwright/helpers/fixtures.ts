// fixtures.ts
import { expect, test as base } from "@playwright/test";
import type { CampaignState } from "@/shared/types";
import { TestBridge } from "./testBridge";

export const test = base.extend<{
  seedCampaign: (
    campaignId: string,
    partyId?: string,
    candidateId?: string,
  ) => Promise<{ sessionId: string; state: CampaignState | null } | undefined>;
  getCampaignState: () => Promise<CampaignState | undefined>;
}>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (globalThis as any).localStorage.setItem(
        "kampanykorut_debugMode",
        "true",
      );
    });

    await use(page);
  },
  seedCampaign: async ({ page }, use) => {
    // window.kampanykorut is only set once the app bundle has run in the page,
    // so we need to load the app before we can reach into it to seed.
    await page.goto("/");
    const testBridge = new TestBridge(page);
    await use((campaignId, partyId, candidateId) =>
      testBridge.seedCampaign(campaignId, {
        partyId: partyId ?? "",
        candidateId,
      }),
    );
  },
  getCampaignState: async ({ page }, use) => {
    const testBridge = new TestBridge(page);
    await use(() => testBridge.getCampaignState());
  },
});

export { expect };
