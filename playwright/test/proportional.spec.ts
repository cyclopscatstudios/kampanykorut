import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "0003_test_proportional";

test.use({ locale: "hu-HU", viewport: { width: 1440, height: 900 } });

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
  await page.getByTestId("focusRequiredOpen").click();
  await page.getByRole("tab", { name: "Fókuszok" }).click();
  await page.getByTestId("selectFocus-coalition_ready").click();
  await page.getByTestId("politicalDashboardBack").click();

  const seatCountTitle = page.getByText("Választási éjszaka · 2026");
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
  // Nobody has a majority of their own, so the coalition offer comes first.
  await expect(page).toHaveURL(/coalition/);
});

test("proportional test campaign: a focus must be chosen before the first visit", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);

  const statusButton = page.getByTestId("politicalStatusButton");
  await expect(statusButton).toHaveAccessibleName(
    "Politikai helyzet: új esemény",
  );
  await expect(page.getByTestId("focusRequiredNote")).toBeVisible();
  await page.locator("svg path[data-id]").nth(40).click({ force: true });
  await expect(page.getByTestId("visitDistrict")).toBeDisabled();

  await statusButton.click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("tab", { name: "Fókuszok" }).click();
  await page.getByTestId("selectFocus-coalition_ready").click();
  // The opposite direction drops out for good.
  await expect(page.getByTestId("selectFocus-own_majority")).toHaveCount(0);
  await expect(
    page.getByRole("article", { name: "Önálló többség" }).getByText("Kizárva"),
  ).toBeVisible();

  await page.getByTestId("politicalDashboardBack").click();
  await expect(statusButton).toHaveAccessibleName("Politikai helyzet");
  await expect(page.getByTestId("focusRequiredNote")).toHaveCount(0);
  await page.locator("svg path[data-id]").nth(40).click({ force: true });
  await expect(page.getByTestId("visitDistrict")).toBeEnabled();
});

test("proportional test campaign: an accepted coalition offer forms a government", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
  );
  const endResults = `/game/${CAMPAIGN_ID}/end-results?sessionId=${seedData?.sessionId}`;

  await page.goto(endResults);
  await expect(page).toHaveURL(/coalition/);
  await expect(page.getByTestId("coalitionSubmit")).toBeDisabled();
  await page.getByTestId("coalitionPartner-yellow_party").click();
  await page.getByTestId("coalitionSubmit").click();

  await expect(
    page
      .getByTestId("coalitionResponse-yellow_party")
      .getByText("Elfogadta", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Koalíciós többség");
  await page.getByTestId("coalitionContinue").click();

  await expect(page).toHaveURL(/end-results/);
  const summary = page.getByTestId("governmentSummary");
  await expect(summary.getByText("Koalíciós többség")).toBeVisible();
  await expect(summary.getByText("Széles koalíció")).toBeVisible();
  await expect(page.getByText("Többség: 201 mandátum")).toHaveCount(0);

  await page.reload();
  await expect(page).toHaveURL(/end-results/);
});

test("proportional test campaign: a rejected offer leaves no government", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(
    CAMPAIGN_ID,
    "green_party",
    "emma_wilson",
    { prop_q2: "B" },
  );

  await page.goto(
    `/game/${CAMPAIGN_ID}/coalition?sessionId=${seedData?.sessionId}`,
  );
  await page.getByTestId("coalitionPartner-yellow_party").click();
  await page.getByTestId("coalitionSubmit").click();

  await expect(
    page
      .getByTestId("coalitionResponse-yellow_party")
      .getByText("Elutasította", { exact: true }),
  ).toBeVisible();
  await page.getByTestId("coalitionContinue").click();
  const summary = page.getByTestId("governmentSummary");
  await expect(summary.getByText("Sikertelen kormányalakítás")).toBeVisible();
  await expect(summary.getByText("Patthelyzet")).toBeVisible();
});
