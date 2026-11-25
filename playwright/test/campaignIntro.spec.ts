import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "0003_test_proportional";

test.use({ locale: "hu-HU" });

test("the campaign intro opens only on the first start", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);

  const intro = page.getByTestId("campaignIntroDialog");
  await expect(intro).toBeVisible();
  await expect(intro.getByText("Történelmi háttér")).toBeVisible();
  await expect(
    intro.getByRole("heading", { name: "Arányos tesztválasztás" }),
  ).toBeVisible();

  await page.getByTestId("campaignIntroConfirm").click();
  await expect(intro).toHaveCount(0);

  await page.reload();
  await expect(page.locator("svg path[data-id]").first()).toBeVisible();
  await expect(intro).toHaveCount(0);
});
