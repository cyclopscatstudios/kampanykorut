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
    // A polygon's bounding-box centre can be inside a neighbouring district.
    // Find a point whose hit target is the district itself, with room around it.
    const districtPoint = await page
      .locator("svg path[data-id]")
      .evaluateAll((elements) => {
        const paths = elements
          .map((element) => ({
            element,
            bounds: element.getBoundingClientRect(),
          }))
          .sort(
            (a, b) =>
              b.bounds.width * b.bounds.height -
              a.bounds.width * a.bounds.height,
          );
        for (const { element, bounds } of paths) {
          for (let row = 1; row < 10; row++) {
            for (let column = 1; column < 10; column++) {
              const x = bounds.left + (bounds.width * column) / 10;
              const y = bounds.top + (bounds.height * row) / 10;
              if (
                [
                  [0, 0],
                  [-2, 0],
                  [2, 0],
                  [0, -2],
                  [0, 2],
                ].every(
                  ([dx, dy]) =>
                    document.elementFromPoint(x + dx, y + dy) === element,
                )
              ) {
                return {
                  id: element.getAttribute("data-id"),
                  x: x - bounds.left,
                  y: y - bounds.top,
                };
              }
            }
          }
        }
        return null;
      });
    expect(
      districtPoint,
      "The map should have a district with a clickable interior",
    ).not.toBeNull();
    await page.locator(`svg path[data-id="${districtPoint!.id}"]`).click({
      position: { x: districtPoint!.x, y: districtPoint!.y },
    });
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
    const turnCount = page.getByText(/\d+ forduló/);
    await expect(turnCount).toBeVisible();
    await page
      .getByRole("button", { name: /^Nap\s*\d+/ })
      .first()
      .click();
    await expect(turnCount).not.toBeVisible();
    await page
      .getByRole("button", { name: "Vissza az előzményekhez", exact: true })
      .click();
    await expect(turnCount).toBeVisible();
  });
}
