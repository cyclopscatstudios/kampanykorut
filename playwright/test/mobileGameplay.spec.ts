import { expect, test } from "../helpers/fixtures";

test.use({ locale: "hu-HU" });

const VIEWPORT = { width: 320, height: 568 };

test("district sheet keeps the visit button on screen", async ({
  page,
  seedCampaign,
}) => {
  await page.setViewportSize(VIEWPORT);
  const seed = await seedCampaign("2026_tavaszi_szel", "tisza", "magyar_peter");
  await page.goto(`/game/2026_tavaszi_szel?sessionId=${seed?.sessionId}`);

  await page.getByText("Pest vármegye").first().click();
  await page
    .getByRole("button", { name: /1\. OEVK/ })
    .first()
    .click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("button", { name: /Becsült állás/ }).click();

  const visit = page.getByTestId("visitDistrict");
  await expect(visit).toBeInViewport({ ratio: 1 });
});

test("the next question starts scrolled to the top", async ({
  page,
  seedCampaign,
}) => {
  await page.setViewportSize(VIEWPORT);
  const seed = await seedCampaign("2026_tavaszi_szel", "tisza", "magyar_peter");
  await page.goto(`/game/2026_tavaszi_szel?sessionId=${seed?.sessionId}`);

  await page.getByText("Pest vármegye").first().click();
  await page
    .getByRole("button", { name: /1\. OEVK/ })
    .first()
    .click();
  await page.getByTestId("visitDistrict").click();

  const firstQuestion = page.getByRole("heading", { level: 5 });
  await expect(firstQuestion).toBeInViewport();
  await page.getByText(/^D$/).first().click();
  await page.getByRole("button", { name: "Következő" }).click();
  const advisorClose = page.getByRole("button", { name: "Rendben" });
  if (await advisorClose.isVisible().catch(() => false)) {
    await advisorClose.click();
  }

  await expect(page.getByText("1/32")).toBeVisible();
  await expect(page.getByRole("heading", { level: 5 })).toBeInViewport({
    ratio: 0.5,
  });
});

test("1957: the region's issues can be collapsed on the sheet", async ({
  page,
  seedCampaign,
}) => {
  await page.setViewportSize(VIEWPORT);
  const seed = await seedCampaign(
    "1957_forradalom_oroksege",
    "mszmp",
    "nagy_imre",
  );
  await page.goto(
    `/game/1957_forradalom_oroksege?sessionId=${seed?.sessionId}`,
  );
  await page.getByTestId("campaignIntroConfirm").click();
  await page.getByRole("button", { name: "Térkép", exact: true }).click();
  await page.locator("svg path[data-id]").first().click({ force: true });

  const sheet = page.getByRole("dialog");
  const issue = sheet.getByTestId("areaIssue-forradalom");
  const toggle = sheet.getByTestId("areaIssuesToggle");
  await expect(issue).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  await toggle.click();
  await expect(issue).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await expect(issue).toBeVisible();
});
