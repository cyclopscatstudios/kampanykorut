import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "1957_forradalom_oroksege";

test.use({ locale: "hu-HU", viewport: { width: 1440, height: 900 } });

const seatTotal = (
  results: { mandates: { totalSeats: number }[] } | undefined,
) => results?.mandates.reduce((sum, m) => sum + m.totalSeats, 0);

test("1957: Kádár stays, no split, 400 seats in 16 districts", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    q3_kadar: "A",
  });
  const state = seedData?.state;

  expect(state?.isEnded).toBe(true);
  expect(state?.results?.regions).toHaveLength(16);
  expect(seatTotal(state?.results)).toBe(400);
  expect(state?.candidates?.kadar_part?.status).toBe("dormant");
});

test("1957: excluding Kádár splits the MSZMP", async ({ playCampaign }) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    q3_kadar: "C",
  });
  const state = seedData?.state;

  expect(state?.candidates?.kadar_part?.status).toBe("active");
  const kadar = state?.results?.mandates.find((m) => m.party === "kadar_part");
  expect(kadar?.totalSeats).toBeGreaterThan(0);
  expect(seatTotal(state?.results)).toBe(400);
});

test("1957: the first turn can be played before choosing a focus", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre");
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await page.getByTestId("campaignIntroConfirm").click();

  await expect(page.getByTestId("focusRequiredNote")).toHaveCount(0);
  await page.locator("svg path[data-id]").first().click({ force: true });
  await expect(page.getByTestId("visitDistrict")).toBeEnabled();

  await page.getByTestId("politicalStatusButton").click();
  await page.getByRole("tab", { name: "Fókuszok" }).click();
  await expect(page.getByTestId("focusSchedule")).toHaveText(
    "A 2. kör előtt válassz irányt, különben nem haladhatsz tovább.",
  );
  await expect(page.getByTestId("selectFocus-lassu_reformok")).toBeVisible();
});
