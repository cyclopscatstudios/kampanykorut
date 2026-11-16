import { expect, test } from "../helpers/fixtures";

test.use({ locale: "hu-HU" });

const cases = [
  ["2026_tavaszi_szel", "tisza", "magyar_peter"],
  ["0002_test_mayoral", "lmp", "vitezy_david"],
] as const;

for (const [campaignId, partyId, candidateId] of cases) {
  test(`share card renders and can be shared: ${campaignId}`, async ({
    page,
    context,
    playCampaign,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const seed = await playCampaign(campaignId, partyId, candidateId);
    await page.goto(
      `/game/${campaignId}/end-results?sessionId=${seed?.sessionId}`,
    );
    await page.getByTestId("shareResult").click();

    const preview = page.getByTestId("shareCardPreview").locator("img");
    await expect(preview).toBeVisible();
    expect(
      await preview.evaluate((img: HTMLImageElement) => [
        img.naturalWidth,
        img.naturalHeight,
      ]),
    ).toEqual([1200, 630]);

    await page.getByTestId("shareCopy").click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Neked sikerülne?");
    expect(copied).toContain(
      `utm_source=share&utm_medium=result-card&utm_campaign=${campaignId}`,
    );

    const download = page.waitForEvent("download");
    await page.getByTestId("shareDownload").click();
    expect((await download).suggestedFilename()).toMatch(/\.png$/);
  });
}
