import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "2026_tavaszi_szel";
const TOTAL_SEATS = 199;

test("playing through all 32 questions reaches computed end-results", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "tisza", "magyar_peter", {
    "2026_ogyv_tisza_v2-1": "B",
  });

  expect(seedData?.state?.isEnded).toBe(true);

  const totalSeats = seedData?.state?.results?.mandates.reduce(
    (sum, mandate) => sum + mandate.totalSeats,
    0,
  );
  expect(totalSeats).toBe(TOTAL_SEATS);

  await page.goto(
    `/game/${CAMPAIGN_ID}/end-results?sessionId=${seedData?.sessionId}`,
  );

  await expect(
    page.getByRole("button", { name: "Választási térkép" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Statisztikák" }).click();
  await expect(page.getByText("Egyéni mandátumok")).toBeVisible();

  await page.getByRole("button", { name: "Előzmények" }).click();
  await expect(page.getByText("32 forduló")).toBeVisible();
});
