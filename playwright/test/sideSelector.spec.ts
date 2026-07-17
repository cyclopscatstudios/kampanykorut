import { test, expect } from "../fixtures";

test("side selector", async ({ page }) => {
  await page.goto("/new-game/classic/sides/0001_test_campaign");
  await expect(page.getByTestId("candidateSelector")).toBeDisabled();
  await page.getByTestId("partySelector").click();
});
