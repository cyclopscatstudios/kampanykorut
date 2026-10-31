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
