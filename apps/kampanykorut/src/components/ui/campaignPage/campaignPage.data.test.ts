import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignHeader } from "@logic/application/hooks/useGetCampaigns";
import type { ElectionConfig } from "@shared/types/configs/election-config";
import { describe, expect, it } from "vitest";
import { buildCampaignCatalog } from "../../../../plugins/campaignCatalog";
import { applyMetaToHtml } from "../../../prerender/applyMetaToHtml";
import {
  buildCampaignPageData,
  buildCampaignPageMeta,
  ogImagePath,
} from "./campaignPage.data";

const campaign: CampaignHeader = {
  id: "2024_budapest",
  label: "2024: Budapest",
  description: "Leírás ".repeat(40).trim(),
  year: 2024,
  tags: [],
  route: "2024_budapest",
  campaignBanner: "default-banner.png",
  status: "published",
  gameMode: "classic",
};

const electionConfig = {
  playableSides: [
    {
      id: "lmp",
      label: "LMP",
      description: "Párt leírás",
      mainCandidates: [
        { id: "vitezy_david", label: "Vitézy Dávid", description: "Jelölt" },
      ],
      playableCandidates: ["vitezy_david"],
    },
    { id: "nem_jatszhato", label: "Más", mainCandidates: [] },
  ],
  electionAssets: [
    {
      id: "lmp",
      party_logo: "/images/lmp.png",
      candidateAssets: [
        { id: "vitezy_david", portrait: "/images/vd.png", slogan: "" },
      ],
    },
  ],
} as Pick<ElectionConfig, "playableSides" | "electionAssets">;

describe("buildCampaignPageData", () => {
  it("lists only playable sides with their assets", () => {
    const data = buildCampaignPageData(campaign, electionConfig);

    expect(data?.sides).toEqual([
      expect.objectContaining({
        id: "lmp",
        candidate: expect.objectContaining({ id: "vitezy_david" }),
        partyLogo: "/images/lmp.png",
        portrait: "/images/vd.png",
      }),
    ]);
  });

  it("returns null for an unknown side", () => {
    expect(buildCampaignPageData(campaign, electionConfig, "nope")).toBeNull();
  });
});

describe("buildCampaignPageMeta", () => {
  it("builds a short description and side-specific path and image", () => {
    const data = buildCampaignPageData(campaign, electionConfig, "lmp")!;
    const meta = buildCampaignPageMeta(data);

    expect(meta.path).toBe("/kampany/2024_budapest/lmp");
    expect(meta.image).toBe("/og/2024_budapest/lmp.jpg");
    expect(meta.title).toContain("Vitézy Dávid");
    expect(meta.description.length).toBeLessThanOrEqual(161);
  });
});

describe("applyMetaToHtml", () => {
  const template = `<html><head>
    <title>Old</title>
    <meta name="description" content="old" />
    <meta
      property="og:title"
      content="old"
    />
    <link rel="canonical" href="https://kampanykorut.hu/" />
  </head><body><div id="root"></div></body></html>`;

  it("replaces the head tags and fills the root", () => {
    const html = applyMetaToHtml(
      template,
      {
        title: 'A "B" <C>',
        description: "desc",
        path: "/kampany/x",
        image: "/og/x.jpg",
      },
      "<main>body</main>",
    );

    expect(html).toContain("<title>A &quot;B&quot; &lt;C&gt;</title>");
    expect(html).not.toContain('content="old"');
    expect(html.match(/og:title/g)).toHaveLength(1);
    expect(html).toContain(
      '<link rel="canonical" href="https://kampanykorut.hu/kampany/x" />',
    );
    expect(html).toContain('<div id="root"><main>body</main></div>');
  });
});

describe("shipped campaign pages", () => {
  const publicDir = path.resolve(__dirname, "../../../../public");
  const readJSON = (file: string) =>
    JSON.parse(readFileSync(path.join(publicDir, file), "utf-8"));
  const published = buildCampaignCatalog(
    path.join(publicDir, "campaigns"),
  ).filter((c) => c.status === "published");

  it.each(published.map((c) => [c.id, c]))(
    "%s has an OG image for the campaign and each side",
    (_id, header) => {
      const data = buildCampaignPageData(
        header,
        readJSON(`campaigns/${header.route}/election_config.json`),
      )!;
      const images = [
        ogImagePath(header.id),
        ...data.sides.map((s) => ogImagePath(header.id, s.id)),
      ];
      expect(
        images.filter((img) => !existsSync(path.join(publicDir, img))),
      ).toEqual([]);
    },
  );
});
