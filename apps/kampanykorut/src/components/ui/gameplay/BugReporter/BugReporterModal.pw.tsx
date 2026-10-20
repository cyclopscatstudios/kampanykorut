import { expect, test } from "@playwright/experimental-ct-react";
import type { Locator } from "@playwright/test";
import {
  Default,
  ServerError,
  Success,
  Unavailable,
} from "./BugReporterModal.stories";

async function fillReport(component: Locator) {
  await component
    .getByPlaceholder("Briefly describe the problem")
    .fill("Button does nothing");
  await component
    .getByPlaceholder("What happened? What did you expect instead?")
    .fill("Clicking the button has no effect.");
}

test("renders the bug reporter modal and enables reporting once filled in", async ({
  mount,
}) => {
  const component = await mount(<Default />);

  await expect(component.getByText("Report a bug")).toBeVisible();
  await expect(component.getByText("Email address (optional)")).toBeVisible();

  const reportButton = component.getByRole("button", {
    name: "Report",
    exact: true,
  });
  await expect(reportButton).toBeDisabled();

  await fillReport(component);

  await expect(reportButton).toBeEnabled();
});

test("cancel closes the modal", async ({ mount }) => {
  const component = await mount(<Default />);

  await component.getByRole("button", { name: "Cancel" }).click();

  await expect(component.getByText("Report a bug")).toHaveCount(0);
});

test("sends the report with the environment and the optional email", async ({
  mount,
  page,
}) => {
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/v1/bug-reports", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      json: { id: "abc", issueNumber: null },
    });
  });
  const component = await mount(<Default />);

  await fillReport(component);
  await component.getByPlaceholder("you@example.com").fill("me@example.com");
  await component.getByRole("button", { name: "Report", exact: true }).click();

  await expect(
    component.getByText("Thank you, your report has been recorded."),
  ).toBeVisible();
  expect(body).toEqual({
    title: "Button does nothing",
    description: "Clicking the button has no effect.",
    steps: "",
    email: "me@example.com",
    environment: {
      campaign: "Országgyűlési választás 2026",
      url: "https://kampanykorut.hu/game",
      browser: "Ladle",
      version: "story",
    },
  });
});

test("shows the issue number and the email notice on success", async ({
  mount,
}) => {
  const component = await mount(<Success />);

  await fillReport(component);
  await component.getByPlaceholder("you@example.com").fill("me@example.com");
  await component.getByRole("button", { name: "Report", exact: true }).click();

  await expect(
    component.getByRole("button", { name: "Sending…" }),
  ).toBeDisabled();
  await expect(
    component.getByText("Thank you, your report has been recorded (#123)."),
  ).toBeVisible();
  await expect(component.getByText(/We sent you an email/)).toBeVisible();

  await component.getByRole("button", { name: "Close" }).click();
  await expect(component.getByText("Report a bug")).toHaveCount(0);
});

test("keeps the form and offers GitHub when sending fails", async ({
  mount,
}) => {
  const component = await mount(<ServerError />);

  await fillReport(component);
  await component.getByRole("button", { name: "Report", exact: true }).click();

  await expect(component.getByRole("alert")).toContainText(
    "could not be sent right now",
  );
  await expect(
    component.getByRole("button", { name: "Report on GitHub" }),
  ).toBeVisible();
  await expect(
    component.getByPlaceholder("Briefly describe the problem"),
  ).toHaveValue("Button does nothing");
  await expect(
    component.getByRole("button", { name: "Report", exact: true }),
  ).toBeEnabled();
});

test("explains when bug reporting is unavailable", async ({ mount }) => {
  const component = await mount(<Unavailable />);

  await fillReport(component);
  await component.getByRole("button", { name: "Report", exact: true }).click();

  await expect(component.getByRole("alert")).toContainText(
    "Bug reporting is not available right now",
  );
});
