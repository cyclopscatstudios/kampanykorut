import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "1957_forradalom_oroksege";
const LINE =
  "Lassú reformok → Baloldali szövetség → Semleges híd → Baloldali kormány";

test.use({ locale: "hu-HU", viewport: { width: 1440, height: 900 } });

test("cheat mode marks the winning path, ids and effects", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre");
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await page.getByTestId("campaignIntroConfirm").click();

  await page.evaluate(() =>
    (window as unknown as { cheat: { on: () => void } }).cheat.on(),
  );
  const panel = page.getByTestId("cheatPanel");
  await expect(panel).toBeVisible();
  await panel.getByText("ID-k").click();
  await panel.getByText("Hatások").click();
  await panel.getByText("Győztes út").click();
  await panel.getByTestId("cheatPathSelect").selectOption(LINE);

  await page.getByTestId("politicalStatusButton").click();
  await page.getByRole("tab", { name: "Fókuszok" }).click();
  await expect(
    page.locator('article[data-recommended="true"]', {
      hasText: "lassu_reformok",
    }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/cheat-focus.png" });
  await page.getByTestId("selectFocus-lassu_reformok").click();
  await page.getByTestId("politicalDashboardBack").click();

  await page.locator("svg path[data-id]").nth(2).click({ force: true });
  await page.getByTestId("visitDistrict").click();

  const recommended = page.locator('[data-recommended="true"]');
  await expect(recommended).toHaveCount(1);
  await expect(recommended).toContainText("A");
  await recommended.hover();
  await expect(page.getByText("Országos").first()).toBeVisible();
  await page.screenshot({ path: "test-results/cheat-question.png" });

  await panel.getByTestId("cheatMinimize").click();
  await expect(panel.getByTestId("cheatPathSelect")).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("cheatPanel")).toBeVisible();
});
