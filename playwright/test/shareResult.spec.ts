import { expect, test } from "../helpers/fixtures";

test.use({ locale: "hu-HU" });

const cases = [
  ["2026_tavaszi_szel", "tisza", "magyar_peter"],
  ["0002_test_mayoral", "lmp", "vitezy_david"],
] as const;

for (const [campaignId, partyId, candidateId] of cases) {
  test(`share card renders and can be shared: ${campaignId}`, async ({
    page,
    playCampaign,
  }) => {
    await page.addInitScript(() => {
      const shared: { text?: string; files?: File[] }[] = [];
      Object.assign(window, { __shared: shared });
      navigator.canShare = () => true;
      navigator.share = async (data) => {
        shared.push(data as { text?: string; files?: File[] });
      };
    });
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

    await page.getByTestId("shareNative").click();
    const shared = await page.evaluate(() =>
      (
        window as unknown as {
          __shared: { text?: string; files?: File[] }[];
        }
      ).__shared.map((data) => ({
        text: data.text,
        type: data.files?.[0]?.type,
      })),
    );
    expect(shared).toHaveLength(1);
    expect(shared[0].text).toContain("Neked sikerülne?");
    expect(shared[0].type).toBe("image/png");

    const download = page.waitForEvent("download");
    await page.getByTestId("shareDownload").click();
    expect((await download).suggestedFilename()).toMatch(/\.png$/);
  });
}
