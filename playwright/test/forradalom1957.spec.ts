import { expect, test } from "../helpers/fixtures";

const CAMPAIGN_ID = "1957_forradalom_oroksege";

test.use({ locale: "hu-HU", viewport: { width: 1440, height: 900 } });

const seatTotal = (
  results: { mandates: { totalSeats: number }[] } | undefined,
) => results?.mandates.reduce((sum, m) => sum + m.totalSeats, 0);

test("1957: Kádár stays, no split, 400 seats in 16 districts", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    kadar_ultimatum: "A",
  });
  const state = seedData?.state;

  expect(state?.isEnded).toBe(true);
  expect(state?.results?.regions).toHaveLength(16);
  expect(seatTotal(state?.results)).toBe(400);
  expect(state?.candidates?.kadar_part?.status).toBe("dormant");
});

test("1957: excluding Kádár splits the MSZMP", async ({ playCampaign }) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    kadar_ultimatum: "C",
  });
  const state = seedData?.state;

  expect(state?.candidates?.kadar_part?.status).toBe("active");
  const kadar = state?.results?.mandates.find((m) => m.party === "kadar_part");
  expect(kadar?.totalSeats).toBeGreaterThan(0);
  expect(seatTotal(state?.results)).toBe(400);
});

test("1957: a focus must be chosen before the first turn", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre");
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await page.getByTestId("campaignIntroConfirm").click();

  await expect(page.getByTestId("focusRequiredNote")).toBeVisible();
  await page.locator("svg path[data-id]").first().click({ force: true });
  await expect(page.getByTestId("visitDistrict")).toBeDisabled();

  await page.getByTestId("politicalStatusButton").click();
  await page.getByRole("tab", { name: "Fókuszok" }).click();
  await expect(page.getByTestId("focusSchedule")).toHaveText(
    "Az 1. kör előtt válassz irányt, különben nem haladhatsz tovább.",
  );
  await expect(page.getByTestId("selectFocus-lassu_reformok")).toBeVisible();
});

test("1957: the map panel names the party leaders and the region's seats", async ({
  page,
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    kadar_ultimatum: "A",
  });
  await page.goto(
    `/game/${CAMPAIGN_ID}/end-results?sessionId=${seedData?.sessionId}`,
  );
  await expect(page).toHaveURL(/coalition/);
  await page.getByTestId("coalitionPartner-fkgp").click();
  await page.getByTestId("coalitionSubmit").click();
  await page.getByTestId("coalitionContinue").click();
  await expect(page).toHaveURL(/end-results/);
  await page.getByRole("button", { name: "Választási térkép" }).click();
  await page.locator("svg path[data-id]").nth(2).click({ force: true });

  const panel = page.getByTestId("districtResult");
  await expect(panel.getByText("Nagy Imre")).toBeVisible();
  await expect(panel.getByText("Magyar Szocialista Munkáspárt")).toBeVisible();
  await expect(panel.getByText(/A régió \d+ mandátuma/)).toBeVisible();
  await expect(panel.getByText(/^\d+ mandátum$/).first()).toBeVisible();
});

test("1957: answers and events move the party on the issues", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    igazsagtetel: "B",
    fold_es_beszolgaltatas: "A",
  });
  expect(seedData?.state?.issuePositions).toMatchObject({
    forradalom: { mszmp: -2 },
    fold: { mszmp: 2 },
  });
});

test("1957: relations bring their consequences", async ({ playCampaign }) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    kethly_feltetelei: "C",
    szakszervezetek: "B",
    szerelvenyek: "C",
  });
  const triggered = seedData?.state?.campaignEvents?.triggeredEventIds;
  expect(triggered).toContain("szdp_kampany");
  expect(triggered).toContain("nyugati_hitel");
  expect(triggered).not.toContain("kethly_nagygyules");
});

test("1957: a region shows how strong its issues are", async ({
  page,
  seedCampaign,
}) => {
  const seedData = await seedCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre");
  await page.goto(`/game/${CAMPAIGN_ID}?sessionId=${seedData?.sessionId}`);
  await page.getByTestId("campaignIntroConfirm").click();
  await page.locator("svg path[data-id]").first().click({ force: true });

  const issues = page.getByTestId("areaIssues");
  await expect(issues).toBeVisible();
  await expect(issues.getByTestId("areaIssue-forradalom")).toBeVisible();
});

test("1957: the smallholders always leave, and turning West costs Pongrátz", async ({
  playCampaign,
}) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    corvin_hangok: "A",
    szerelvenyek: "C",
    hideg_tel: "C",
  });
  const triggered = seedData?.state?.campaignEvents?.triggeredEventIds;
  expect(triggered).toContain("fkgp_kilepes");
  expect(triggered).toContain("pongratz_kilep");
  expect(triggered).not.toContain("tankok_helyett_bankok");
  expect(seedData?.state?.issuePositions?.kelet_nyugat?.mszmp).toBe(2);
});
