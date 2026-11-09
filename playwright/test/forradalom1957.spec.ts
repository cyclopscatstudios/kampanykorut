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
    q3_kadar: "A",
  });
  const state = seedData?.state;

  expect(state?.isEnded).toBe(true);
  expect(state?.results?.regions).toHaveLength(16);
  expect(seatTotal(state?.results)).toBe(400);
  expect(state?.candidates?.kadar_part?.status).toBe("dormant");
});

test("1957: excluding Kádár splits the MSZMP", async ({ playCampaign }) => {
  const seedData = await playCampaign(CAMPAIGN_ID, "mszmp", "nagy_imre", {
    q3_kadar: "C",
  });
  const state = seedData?.state;

  expect(state?.candidates?.kadar_part?.status).toBe("active");
  const kadar = state?.results?.mandates.find((m) => m.party === "kadar_part");
  expect(kadar?.totalSeats).toBeGreaterThan(0);
  expect(seatTotal(state?.results)).toBe(400);
});
