import { expect, test } from "../fixtures";

test("opens the app", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kampánykörút/);
  await page.getByTestId("menuItem-settings").click();
});
