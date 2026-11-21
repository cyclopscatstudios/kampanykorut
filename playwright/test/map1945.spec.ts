import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "0004_test_1945_map";

test.use({ locale: "hu-HU", viewport: { width: 1440, height: 900 } });

test("1945 map: 16 districts, seats shared by district and nationally", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  const results = seedData?.state?.results;

  expect(seedData?.state?.isEnded).toBe(true);
  expect(results?.regions).toHaveLength(16);
  const seats = (key: "constituencySeats" | "listSeats" | "totalSeats") =>
    results?.mandates.reduce((sum, m) => sum + m[key], 0);
  expect(seats("constituencySeats")).toBe(350);
  expect(seats("listSeats")).toBe(50);
});

test("1945 map: the game map draws one shape per district", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await expect(page.locator("path[data-id]")).toHaveCount(16);
  await page.screenshot({ path: "test-results/map1945.png" });
});
