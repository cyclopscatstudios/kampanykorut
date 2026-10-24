import { expect, test } from "@playwright/experimental-ct-react";
import { AnswerSelectionFixture } from "./AnswerSelection.fixture";

test("answers support Tab, Enter, Space and pointer selection without submitting", async ({
  mount,
  page,
}) => {
  const component = await mount(<AnswerSelectionFixture />);
  const first = component.getByRole("button", { name: "A Első válasz" });
  const second = component.getByRole("button", { name: "B Második válasz" });
  const next = component.getByRole("button", { name: "Tovább" });
  await expect(next).toBeDisabled();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(next).toBeEnabled();
  await page.keyboard.press("Tab");
  await expect(second).toBeFocused();
  await page.keyboard.press("Space");
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await expect(component.locator("output")).toBeEmpty();
  await first.click();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(second).toHaveAttribute("aria-pressed", "false");
  await next.click();
  await expect(component.locator("output")).toHaveText("first");
});
