import { expect, test } from "../helpers/fixtures";

test.use({ locale: "hu-HU" });

for (const width of [320, 390]) {
  test(`end results remain navigable at ${width}px`, async ({
    page,
    playCampaign,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    const seed = await playCampaign(
      "2026_tavaszi_szel",
      "tisza",
      "magyar_peter",
    );
    await page.goto(
      `/game/2026_tavaszi_szel/end-results?sessionId=${seed?.sessionId}`,
    );
    const navigation = page.getByRole("navigation");
    await expect(navigation).toBeVisible();
    const checkWidth = async () => {
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const bounds = await navigation.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
    };
    await checkWidth();
    await navigation
      .getByRole("button", { name: "Választási térkép", exact: true })
      .click();
    await expect(page.locator("svg path[data-id]").first()).toBeVisible();
    await page.locator("svg path[data-id]").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await checkWidth();
    await navigation
      .getByRole("button", { name: "Statisztikák", exact: true })
      .click();
    await expect(page.getByText("Egyéni mandátumok")).toBeVisible();
    await page.getByRole("button", { name: "Vereségek", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Legnagyobb vereségek" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Szoros", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Legszorosabb körzetek" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Körzetek", exact: true }).click();
    await page
      .getByRole("button", { name: /Részvétel:/ })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await checkWidth();
    await navigation
      .getByRole("button", { name: "Előzmények", exact: true })
      .click();
    await expect(page.getByText("32 forduló")).toBeVisible();
    await page.locator("main button").filter({ hasText: /1/ }).first().click();
    await expect(page.getByText("32 forduló")).not.toBeVisible();
    await page
      .getByRole("button", { name: "Előzmények", exact: true })
      .first()
      .click();
    await expect(page.getByText("32 forduló")).toBeVisible();
  });
}
