import { expect, test } from "./helpers/fixtures";

test.describe("Test group", () => {
  test("seed", async ({ page }) => {
    await expect(page).toHaveURL(/\/menu$/);
  });
});
