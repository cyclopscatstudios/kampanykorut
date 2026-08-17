import { expect, test } from "../helpers/fixtures";

test("change language", async ({ page }) => {
  await page.getByTestId("menuItem-settings").click();
  await expect(page.getByTestId("saveButton")).toBeDisabled();
  await expect(page.getByTestId("showAdvisorFeedback")).toHaveText(
    "Show advisor feedback",
  );
  await page.getByTestId("changeLanguage").click();
  await page.getByTestId("hu").click();
  await expect(page.getByTestId("saveButton")).toBeEnabled();
  await page.getByTestId("saveButton").click();
  // check toaster
  await expect(
    page.getByText("Beállítások sikeresen frissültek!"),
  ).toBeVisible();
  await expect(page.getByTestId("showAdvisorFeedback")).toHaveText(
    "Tanácsadói visszajelzések megjelenítése",
  );
});
