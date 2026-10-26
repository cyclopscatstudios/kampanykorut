import { expect, test } from "@playwright/test";

const TITLE = "Playwright közösségi kampány";
const CANDIDATE = "Közösségi jelölt";
const QUESTION = "Hogyan vonnád be a helyi közösséget?";
const ANSWER = "Nyílt fórumot szervezek";
const FEEDBACK = "A választók értékelik a közvetlen párbeszédet.";
const EFFECT = "2.5";

test("template edit, persistence, round trip, preview, results and return", async ({
  page,
  context,
}) => {
  await page.goto("/maker/");
  await page.getByRole("link", { name: "Új kampány a sablonból" }).click();
  await expect(page.locator("#campaign-title")).toBeVisible();
  const sourceDraft = new URL(page.url()).pathname.split("/")[3];

  await page.locator("#campaign-title").fill(TITLE);
  await page.goto(`/maker/new-campaign/${sourceDraft}/candidates`);
  await page.locator("#candidate-label").fill(CANDIDATE);
  await page.goto(`/maker/new-campaign/${sourceDraft}/materials`);
  await page.locator("#question-0-title").fill("Közösségi részvétel");
  await page.locator("#question-0-question").fill(QUESTION);
  await page.locator("#question-0-answer-0-label").fill(ANSWER);
  await page.locator("#question-0-answer-0-feedback").fill(FEEDBACK);
  const firstEffect = page
    .locator('[id^="question-0-answer-0-effect-"]')
    .first();
  await firstEffect.fill(EFFECT);
  await expect(page.getByRole("status")).toContainText("Mentve helyben");

  await page.reload();
  await expect(page.locator("#question-0-question")).toHaveValue(QUESTION);
  await expect(page.locator("#question-0-answer-0-label")).toHaveValue(ANSWER);
  await expect(page.locator("#question-0-answer-0-feedback")).toHaveValue(
    FEEDBACK,
  );
  await expect(firstEffect).toHaveValue(EFFECT);
  await page.goto(`/maker/new-campaign/${sourceDraft}/candidates`);
  await expect(page.locator("#candidate-label")).toHaveValue(CANDIDATE);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const exported = await downloadPromise;
  const exportedPath = await exported.path();
  expect(exportedPath).not.toBeNull();

  await page.goto("/maker/");
  await page.locator('input[type="file"]').setInputFiles(exportedPath!);
  await expect(page.locator("#campaign-title")).toHaveValue(TITLE);
  const importedDraft = new URL(page.url()).pathname.split("/")[3];
  expect(importedDraft).not.toBe(sourceDraft);

  await page.goto(`/maker/new-campaign/${importedDraft}/candidates`);
  await expect(page.locator("#candidate-label")).toHaveValue(CANDIDATE);
  await page.goto(`/maker/new-campaign/${importedDraft}/materials`);
  await expect(page.locator("#question-0-question")).toHaveValue(QUESTION);
  await expect(page.locator("#question-0-answer-0-label")).toHaveValue(ANSWER);
  await expect(page.locator("#question-0-answer-0-feedback")).toHaveValue(
    FEEDBACK,
  );
  await expect(
    page.locator('[id^="question-0-answer-0-effect-"]').first(),
  ).toHaveValue(EFFECT);

  await page.goto(`/maker/new-campaign/${importedDraft}/summary`);
  await page.getByRole("button", { name: "Kampány ellenőrzése" }).click();
  await expect(page.getByText("Az ellenőrzés sikeres")).toBeVisible();

  const previewPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "Játékos előnézet" }).click();
  const preview = await previewPromise;
  await preview.waitForLoadState("domcontentloaded");
  await expect(preview.getByText(QUESTION)).toBeVisible();
  await preview.getByRole("button", { name: ANSWER, exact: true }).click();
  await preview.getByRole("button", { name: "Következő" }).click();
  await expect(preview.getByText(FEEDBACK, { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Rendben" }).click();

  for (let turn = 1; turn < 50; turn += 1) {
    const returnButton = preview.getByRole("button", {
      name: "Vissza a Kampánykészítőbe",
    });
    if (await returnButton.isVisible().catch(() => false)) break;
    await preview.locator(".w-full.mb-2 > .cursor-pointer").first().click();
    await preview.getByRole("button", { name: "Következő" }).click();
  }

  const returnButton = preview.getByRole("button", {
    name: "Vissza a Kampánykészítőbe",
  });
  await expect(returnButton).toBeVisible();
  await returnButton.click();
  await expect(preview).toHaveURL(
    new RegExp(`/maker/new-campaign/${importedDraft}/summary$`),
  );
  await preview.goto(`/maker/new-campaign/${importedDraft}/materials`);
  await expect(preview.locator("#question-0-question")).toHaveValue(QUESTION);
  await expect(preview.locator("#question-0-answer-0-label")).toHaveValue(
    ANSWER,
  );
  await expect(preview.locator("#question-0-answer-0-feedback")).toHaveValue(
    FEEDBACK,
  );
  await expect(
    preview.locator('[id^="question-0-answer-0-effect-"]').first(),
  ).toHaveValue(EFFECT);
  await preview.goto(`/maker/new-campaign/${importedDraft}/candidates`);
  await expect(preview.locator("#candidate-label")).toHaveValue(CANDIDATE);
});
