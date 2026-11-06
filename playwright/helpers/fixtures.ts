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
  playCampaign: (
    campaignId: string,
    partyId?: string,
    candidateId?: string,
    answerPlan?: Record<string, string>,
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

    await page.goto("/menu");
    for (const id of ["low-resolution-warning", "development-warning"]) {
      const closeWarning = page.getByTestId(id);
      if (await closeWarning.isVisible()) {
        await closeWarning.click();
      }
    }
    // Keep dismissing warnings after navigation and mobile viewport changes.
    for (const id of ["low-resolution-warning", "development-warning"]) {
      const closeWarning = page.getByTestId(id);
      await page.addLocatorHandler(closeWarning, async () => {
        await closeWarning.click();
      });
    }

    await use(page);
  },
  seedCampaign: async ({ page }, use) => {
    // window.kampanykorut is only set once the app bundle has run in the page,
    // so we need to load the app before we can reach into it to seed.
    await page.goto("/menu");
    const testBridge = new TestBridge(page);
    await use((campaignId, partyId, candidateId) =>
      testBridge.seedCampaign(campaignId, {
        partyId: partyId ?? "",
        candidateId,
      }),
    );
  },
  playCampaign: async ({ page }, use) => {
    // window.kampanykorut is only set once the app bundle has run in the page,
    // so we need to load the app before we can reach into it to seed.
    await page.goto("/menu");
    const testBridge = new TestBridge(page);
    await use((campaignId, partyId, candidateId, answerPlan) =>
      testBridge.playCampaign(
        campaignId,
        { partyId: partyId ?? "", candidateId },
        answerPlan,
      ),
    );
  },
  getCampaignState: async ({ page }, use) => {
    const testBridge = new TestBridge(page);
    await use(() => testBridge.getCampaignState());
  },
});

export { expect };
