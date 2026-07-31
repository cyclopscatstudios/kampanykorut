import type { Page } from "@playwright/test";
import type { PlayerSide } from "@/shared/types";

export class TestBridge {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async seedCampaign(campaignId: string, playerSide?: PlayerSide) {
    return this.page.evaluate(
      ({ campaignId, playerSide }) =>
        (globalThis as any).kampanykorut?.seedCampaign(campaignId, playerSide),
      { campaignId, playerSide },
    );
  }

  getCampaignState() {
    return this.page.evaluate(() =>
      (globalThis as any).kampanykorut?.getCampaignState(),
    );
  }
}
