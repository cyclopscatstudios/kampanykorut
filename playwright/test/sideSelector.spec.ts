import { expect,test } from "../helpers/fixtures";

test("side selector", async ({ page, getCampaignState }) => {
  await page.goto("/new-game/classic/sides/0001_test_campaign");

  await expect(page.getByTestId("candidateSelector")).toBeDisabled();

  await page.getByTestId("partySelector").click();
  await page.getByTestId("green_party").click();

  await page.getByTestId("candidateSelector").click();
  await page.getByTestId("emma_wilson").click();

  expect((await getCampaignState())?.playerSide).toStrictEqual({
    partyId: "green_party",
    candidateId: "emma_wilson",
  });

  await page.getByTestId("partySelector").click();
  await page.getByTestId("red_party").click();

  expect((await getCampaignState())?.playerSide).toStrictEqual({
    partyId: "red_party",
  });
});
