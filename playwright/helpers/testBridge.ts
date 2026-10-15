import type { Page } from "@playwright/test";
import type { PlayerSide } from "@/shared/types";

/** questionId -> answerId. Questions not listed fall back to their first possible answer. */
type AnswerPlan = Record<string, string>;

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

  async playCampaign(
    campaignId: string,
    playerSide?: PlayerSide,
    answerPlan?: AnswerPlan,
  ) {
    return this.page.evaluate(
      ({ campaignId, playerSide, answerPlan }) =>
        (globalThis as any).kampanykorut?.playCampaign(
          campaignId,
          playerSide,
          answerPlan,
        ),
      { campaignId, playerSide, answerPlan },
    );
  }

  getCampaignState() {
    return this.page.evaluate(() =>
      (globalThis as any).kampanykorut?.getCampaignState(),
    );
  }
}
