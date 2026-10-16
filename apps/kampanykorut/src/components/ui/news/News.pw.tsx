import { expect, test } from "@playwright/experimental-ct-react";
import {
  Archive,
  Detail,
  DetailNotFound,
  LandingSection,
  LandingSectionLoading,
  LandingSectionSingle,
} from "./News.stories";

test("landing section shows the featured news and the next three", async ({
  mount,
}) => {
  const component = await mount(<LandingSection />);

  await expect(
    component.getByRole("heading", {
      name: "Megérkezett a Mod-készítő: írd meg a saját kampányodat",
    }),
  ).toBeVisible();
  await expect(component.getByText("Kipróbálom →")).toHaveAttribute(
    "href",
    "https://kampanykorut.hu/menu",
  );
  await expect(component.getByRole("listitem")).toHaveCount(3);
  await expect(
    component.getByRole("link", { name: /Gyorsabb térkép-betöltés/ }),
  ).toHaveAttribute("href", "/hirek/9");
  await expect(
    component.getByRole("link", { name: /Összes hír|All news/ }),
  ).toHaveAttribute("href", "/hirek");
});

test("landing section without side news falls back to a read-more link", async ({
  mount,
}) => {
  const component = await mount(<LandingSectionSingle />);

  await expect(component.getByRole("listitem")).toHaveCount(0);
  await expect(component.getByText("Kipróbálom →")).toBeVisible();
});

test("landing section shows a skeleton while loading", async ({ mount }) => {
  const component = await mount(<LandingSectionLoading />);

  await expect(component.getByRole("status")).toHaveAttribute(
    "aria-busy",
    "true",
  );
});

test("archive filters by type", async ({ mount }) => {
  const component = await mount(<Archive />);

  await expect(component.getByRole("listitem")).toHaveCount(4);
  await component.getByRole("button", { name: /Kampány|Campaign/ }).click();
  await expect(component.getByRole("listitem")).toHaveCount(1);
  await expect(
    component.getByRole("button", { name: /További hírek|More news/ }),
  ).toBeVisible();
});

test("detail renders the article with CTA and GitHub link", async ({
  mount,
}) => {
  const component = await mount(<Detail />);

  await expect(component.getByRole("heading", { level: 1 })).toHaveText(
    "Megérkezett a Mod-készítő: írd meg a saját kampányodat",
  );
  await expect(component.getByRole("heading", { level: 2 })).toHaveText(
    "Mi újság?",
  );
  await expect(
    component.getByRole("link", { name: /GitHubon|GitHub/ }).last(),
  ).toHaveAttribute(
    "href",
    "https://github.com/cyclopscatstudios/kampanykorut/discussions/12",
  );
});

test("detail explains a missing news item", async ({ mount }) => {
  const component = await mount(<DetailNotFound />);

  await expect(
    component.getByText(/nem található|could not be found/),
  ).toBeVisible();
});
