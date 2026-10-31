import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "0002_test_mayoral";
const SZENTKIRALYI = "szentkiralyi_alexandra";

test.use({ locale: "hu-HU" });

test("mayoral test campaign: the candidate stays in the race", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "lmp", "vitezy_david", {
    bp_test_q2: "A",
  });
  const state = seedData?.state;

  expect(state?.isEnded).toBe(true);
  expect(state?.turn).toBe(4);
  expect(state?.decisionCount).toBe(4);
  expect(state?.candidates?.[SZENTKIRALYI]).toBeUndefined();
  expect(state?.campaignEvents?.triggeredEventIds ?? []).toEqual([]);
  expect(state?.mayoralResult?.votes[SZENTKIRALYI]).toBeGreaterThan(0);
  expect(state?.mayoralResult?.outcome.kind).toBe("winner");
  expect(state?.results?.mandates).toEqual([]);
});

test("mayoral test campaign: the candidate withdraws", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "lmp", "vitezy_david", {
    bp_test_q2: "B",
  });
  const state = seedData?.state;

  expect(state?.isEnded).toBe(true);
  expect(state?.turn).toBe(4);
  expect(state?.decisionCount).toBe(4);
  expect(state?.candidates?.[SZENTKIRALYI]).toMatchObject({
    status: "inactive",
    inactiveReason: "withdrawal",
    endorsedCandidateId: "vitezy_david",
    changedAtTurn: 2,
  });
  expect(state?.campaignEvents).toEqual({
    triggeredEventIds: ["szentkiralyi_alexandra_withdrawal"],
    pendingAnnouncementIds: ["szentkiralyi_alexandra_withdrawal"],
  });
  expect(state?.mayoralResult?.votes).not.toHaveProperty(SZENTKIRALYI);
  const outcome = state?.mayoralResult?.outcome;
  expect(outcome?.kind === "winner" && outcome.candidateId).not.toBe(
    SZENTKIRALYI,
  );
});

test("mayoral test campaign: the game screen shows the Budapest map", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "lmp", "vitezy_david");

  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);

  await expect(page.getByText("0/4")).toBeVisible();
  await expect(page.locator("svg path[data-id]")).toHaveCount(23);
});

test("mayoral test campaign: the end results show the mayoral result", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "lmp", "vitezy_david", {
    bp_test_q2: "B",
  });

  await page.goto(
    `/game/${CAMPAIGN_ID}/end-results?sessionId=${seedData?.sessionId}`,
  );

  await expect(page.getByText(/nyerte a választást/)).toBeVisible();
  await expect(
    page.getByText("Szentkirályi Alexandra visszalépett Vitézy Dávid javára"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Statisztikák" })).toHaveCount(
    0,
  );

  await page.getByRole("button", { name: "Kerületek" }).click();
  await expect(
    page.getByTestId("mayoralDistricts").locator("tbody tr"),
  ).toHaveCount(23);

  await page.getByRole("button", { name: "Választási térkép" }).click();
  await page.locator("svg path[data-id='01-05']").click();
  await expect(page.getByText("V. kerület")).toBeVisible();
});

test("mayoral test campaign: a pending announcement is shown once", async ({
  page,
  seedCampaign,
  getCampaignState,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "lmp", "vitezy_david");
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await expect(page.getByText("0/4")).toBeVisible();

  await page.evaluate((sessionId) => {
    const key = `kampanykorut_campaignState-${sessionId}`;
    const state = JSON.parse(localStorage.getItem(key) ?? "{}");
    localStorage.setItem(
      key,
      JSON.stringify({
        ...state,
        campaignEvents: {
          triggeredEventIds: ["szentkiralyi_alexandra_withdrawal"],
          pendingAnnouncementIds: ["szentkiralyi_alexandra_withdrawal"],
        },
      }),
    );
  }, seedData?.sessionId);
  await page.reload();

  await expect(
    page.getByText("Szentkirályi Alexandra visszalép"),
  ).toBeVisible();
  await page.getByTestId("eventAnnouncementClose").click();
  await expect(page.getByTestId("eventAnnouncementClose")).toHaveCount(0);

  expect((await getCampaignState())?.campaignEvents).toEqual({
    triggeredEventIds: ["szentkiralyi_alexandra_withdrawal"],
    pendingAnnouncementIds: [],
  });

  await page.reload();
  await expect(page.getByText("0/4")).toBeVisible();
  await expect(page.getByTestId("eventAnnouncementClose")).toHaveCount(0);
});
