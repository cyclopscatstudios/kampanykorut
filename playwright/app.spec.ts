import { test, expect } from "@playwright/test";

test("opens the app", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kampánykörút/);
  await page.getByTestId("menuItem-settings").click();
});
