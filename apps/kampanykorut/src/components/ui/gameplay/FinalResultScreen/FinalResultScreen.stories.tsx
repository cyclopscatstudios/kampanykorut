import type { Story } from "@ladle/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { container } from "tsyringe";
import { StorageEngine } from "@/logic/application";
import { campaignState } from "@/shared/domain/mocks/mockCampaignState";
import { CampaignConfig, FinalResults } from "@/shared/types";
import FullscreenBackground from "../../../../ui/Background";
import { FinalResultScreen } from "./EndResultScreen";

const mockResults = {
  totals: {
    candidateListResults: {
      _total: 5409451,
      ellenzeki_osszefogas: 2345397,
      fidesz: 2495493,
      mkkp: 126648,
      mi_hazank: 307064,
      megoldas_mozgalom: 64341,
      normalis_elet: 31495,
      _other: 39013,
    },
    partyListResults: {
      fidesz: 2480620,
      ellenzeki_osszefogas: 2298746,
      mi_hazank: 329651,
      mkkp: 183416,
      megoldas_mozgalom: 58670,
      normalis_elet: 39119,
      _other: 30635,
      _total: 5420857,
    },
  },
  mandates: [
    {
      party: "ellenzeki_osszefogas",
      constituencySeats: 45,
      listSeats: 42,
      totalSeats: 87,
    },
    {
      party: "fidesz",
      constituencySeats: 61,
      listSeats: 44,
      totalSeats: 105,
    },
    {
      party: "mi_hazank",
      constituencySeats: 0,
      listSeats: 7,
      totalSeats: 7,
    },
  ],
  constituencySeats: {
    ellenzeki_osszefogas: 45,
    fidesz: 61,
  },
  listSeats: {
    fidesz: 44,
    ellenzeki_osszefogas: 42,
    mi_hazank: 7,
  },
  compensation: {
    losingVotes: {
      fidesz: 931051,
      mkkp: 126648,
      mi_hazank: 307064,
      megoldas_mozgalom: 64341,
      normalis_elet: 31495,
      _other: 39013,
      ellenzeki_osszefogas: 1113405,
    },
    winnerCompensation: {
      ellenzeki_osszefogas: 300896,
      fidesz: 450976,
    },
    total: {
      fidesz: 1382027,
      mkkp: 126648,
      mi_hazank: 307064,
      megoldas_mozgalom: 64341,
      normalis_elet: 31495,
      _other: 39013,
      ellenzeki_osszefogas: 1414301,
    },
  },
  percentages: {
    candidateListResults: {
      _total: 1,
      ellenzeki_osszefogas: 0.4335739430859065,
      fidesz: 0.46132093626506643,
      mkkp: 0.023412357372310056,
      mi_hazank: 0.056764355569539314,
      megoldas_mozgalom: 0.011894182977163487,
      normalis_elet: 0.005822217448683794,
      _other: 0.007212007281330398,
    },
    partyListResults: {
      _total: 1,
      fidesz: 0.4576066109104151,
      ellenzeki_osszefogas: 0.42405582733505054,
      mi_hazank: 0.06081160229830818,
      mkkp: 0.03383524044260898,
      megoldas_mozgalom: 0.010823011933352973,
      normalis_elet: 0.007216386634069115,
      _other: 0.005651320446195131,
    },
  },
} as FinalResults;

const mockConfig = {
  playableSides: {
    ellenzeki_osszefogas: {
      marki_zay_peter: {
        questions: [],
        answerEffect: [],
        endResults: {
          playerSideVictory: {
            imageUri: "",
            title: "Győzelem!",
            subtitle: "A kampányod sikerrel zárult.",
            description:
              "A választók bizalmat szavaztak neked, és pártod megnyerte a választásokat.",
          },
          playerSideDefeat: {
            imageUri: "",
            title: "Vereség",
            subtitle: "A kampányod nem járt sikerrel.",
            description:
              "A választók nem szavaztak elég bizalmat, pártod ellenzékben marad.",
          },
        },
      },
    },
  },
} as unknown as CampaignConfig;

export const Default: Story = () => {
  const storageEngine = container.resolve(StorageEngine);
  storageEngine.setItem(
    "currentSessionId",
    "546dbcff-c892-461c-be20-b9cb8b2e86a8",
    "localStorage",
  );
  storageEngine.setItem(
    "campaignState",
    JSON.stringify(campaignState),
    "localStorage",
    "546dbcff-c892-461c-be20-b9cb8b2e86a8",
  );

  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <FullscreenBackground path="">
          <FinalResultScreen />
        </FullscreenBackground>
      ),
      loader: () => ({ results: mockResults, config: mockConfig }),
    },
  ]);

  return <RouterProvider router={router} />;
};
