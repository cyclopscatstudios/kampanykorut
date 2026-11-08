import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "0003_test_proportional";

test.use({ locale: "hu-HU" });

test("proportional test campaign: seats are shared by region and nationally", async ({
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
  expect(
    results?.regions?.every(
      (region) =>
        Object.values(region.allocation).reduce((a, b) => a + b, 0) ===
        region.seats,
    ),
  ).toBe(true);
  const seats = (key: "constituencySeats" | "listSeats" | "totalSeats") =>
    results?.mandates.reduce((sum, m) => sum + m[key], 0);
  expect(seats("constituencySeats")).toBe(350);
  expect(seats("listSeats")).toBe(50);
  expect(seats("totalSeats")).toBe(400);
});

test("proportional test campaign: the seat count reveals every region", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);

  const seatCountTitle = page.getByText("Választási éjszaka · _0003_");
  const visitDistrict = page.getByRole("button", {
    name: "Látogass el a körzetbe",
  });
  const nextQuestion = page.getByRole("button", { name: "Következő" });
  for (const answer of [
    "Gazdaság",
    "A sárgákkal",
    "Kisvárosokba",
    "Egységgel",
  ]) {
    if (!(await nextQuestion.isVisible())) {
      await page.locator("svg path[data-id]").nth(40).click({ force: true });
      await visitDistrict.click();
    }
    await page.getByText(answer, { exact: true }).click();
    await nextQuestion.click();
  }

  await expect(seatCountTitle).toBeVisible();
  await page.getByTestId("seatCountContinue").click();
  await expect(page.getByText("16 / 16 körzet")).toBeVisible();
  await expect(page.getByText("201 · többségi határ")).toBeVisible();
  await page.getByTestId("seatCountContinue").click();
  await expect(page).toHaveURL(/end-results/);
});

test("proportional test campaign: the end results show the majority labels", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );

  await page.goto(
    `/game/${CAMPAIGN_ID}/end-results?sessionId=${seedData?.sessionId}`,
  );

  await expect(page.getByText("Legtöbb mandátum")).toBeVisible();
  await expect(page.getByText("Többség: 201 mandátum")).toBeVisible();
});
