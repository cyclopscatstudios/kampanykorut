import { expect, test } from "../helpers/fixtures";

const TOTAL_SEATS = 199;

const playthroughs: {
  campaignId: string;
  partyId: string;
  candidateId: string;
  answerPlan: Record<string, string>;
}[] = [
  {
    campaignId: "2026_tavaszi_szel",
    partyId: "tisza",
    candidateId: "magyar_peter",
    answerPlan: { "2026_ogyv_tisza_v2-1": "B" },
  },
  {
    campaignId: "2022_beke_vs_remeny",
    partyId: "ellenzeki_osszefogas",
    candidateId: "marki_zay_peter",
    answerPlan: {},
  },
  {
    campaignId: "2022_beke_vs_remeny",
    partyId: "fidesz",
    candidateId: "orban_viktor",
    answerPlan: {},
  },
];

test.use({ locale: "hu-HU" });

for (const { campaignId, partyId, candidateId, answerPlan } of playthroughs) {
  test(`${campaignId} / ${candidateId}: playing through all 32 questions reaches computed end-results`, async ({
    page,
    playCampaign,
  }) => {
    const seedData = await playCampaign(
      campaignId,
      partyId,
      candidateId,
      answerPlan,
    );

    expect(seedData?.state?.isEnded).toBe(true);

    const mandates = seedData?.state?.results?.mandates ?? [];
    const totalSeats = mandates.reduce(
      (sum, mandate) => sum + mandate.totalSeats,
      0,
    );
    expect(totalSeats).toBe(TOTAL_SEATS);
    expect(mandates.every((m) => m.totalSeats >= 0)).toBe(true);
    expect(mandates.filter((m) => m.party.startsWith("_"))).toEqual([]);

    await page.goto(
      `/game/${campaignId}/end-results?sessionId=${seedData?.sessionId}`,
    );

    await expect(
      page.getByRole("button", { name: "Választási térkép" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Statisztikák" }).click();
    await expect(page.getByText("Egyéni mandátumok")).toBeVisible();

    await page.getByRole("button", { name: "Előzmények" }).click();
    await expect(page.getByText("32 forduló")).toBeVisible();
  });
}
