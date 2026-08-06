import { expect, test } from "@playwright/experimental-ct-react";
import { Default } from "./BugReporterModal.stories";

test("renders the bug reporter modal and enables reporting once filled in", async ({
  mount,
}) => {
  const component = await mount(<Default />);

  await expect(component.getByText("Report a bug")).toBeVisible();

  const reportButton = component.getByRole("button", { name: "Report" });
  await expect(reportButton).toBeDisabled();

  await component
    .getByPlaceholder("Briefly describe the problem")
    .fill("Button does nothing");
  await component
    .getByPlaceholder("What happened? What did you expect instead?")
    .fill("Clicking the button has no effect.");

  await expect(reportButton).toBeEnabled();
});

test("cancel closes the modal", async ({ mount }) => {
  const component = await mount(<Default />);

  await component.getByRole("button", { name: "Cancel" }).click();

  await expect(component.getByText("Report a bug")).toHaveCount(0);
});
