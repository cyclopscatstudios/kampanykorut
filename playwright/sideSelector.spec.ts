import { expect, test } from "./fixtures";

test('side selector', async ({ page }) => {
    await page.goto("/new-game/classic/sides/0001_test_campaign")
    await page.pause();
});