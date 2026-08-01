import { test } from "../helpers/fixtures";

test.beforeEach(async ({ page, seedCampaign }) => {
  const seedData = await seedCampaign(
    "0001_test_campaign",
    "green_party",
    "john_doe",
  );
  await page.goto(
    `/game/${seedData?.state?.activeCampaignId}?sessionId=${seedData?.sessionId}`,
  );
});

test("campaign", async ({ page }) => {
  await page.pause();
  // todo
});
