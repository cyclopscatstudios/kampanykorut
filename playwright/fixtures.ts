// fixtures.ts
import { expect, test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (globalThis as any).localStorage.setItem(
        "kampanykorut_debugMode",
        "true",
      );
    });

    await use(page);
  },
});

export { expect };
