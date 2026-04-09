import { container } from "tsyringe";
import { FinalResultScreen } from "../components/ui/gameplay/FinalResultScreen/EndResultScreen";
import { StateHandler } from "../logic/application/StateHandler";
import type { VoterEnvironmentConfig } from "../logic/domain/VoterEnvironment";
import districts from "../assets/jsons/2022/oevk_2022.json";
import candidateList from "../assets/jsons/2022/oevk_constituency_results.json";
import type { ElectionConfig } from "../logic/types/campaignEngine.types";

export function FinalResultDev() {
  const stateHandler = container.resolve(StateHandler);
  stateHandler.set("currentConfig", {
    endResults: {
      playerSideDefeat: {
        title: "Vereség az urnáknál",
        subtitle: "Összefogva sem megy...",
        description:
          "Ötödik alkalommal alakíthat kormányt Orbán Viktor Magyarországon, miután fölényesen megnyerte a 2022-es országgyűlési választást. Az ellenzéki együttműködés minden korábbi várakozással – és méréssel – szemben jelentős különbséggel kapott ki a Fidesz–KDNP-től.",
        imageUri: "src/assets/images/2022/ellenzek_vereseg_ketharmad.jpg",
      },
      playerSideVictory: {
        title: "Győzelem az urnáknál",
        subtitle: "Fordulat Magyarországon",
        description:
          "Történelmi eredmény született a 2022-es országgyűlési választáson: az ellenzéki összefogás többséget szerzett a parlamentben, ezzel véget vetve a Fidesz–KDNP több mint egy évtizedes kormányzásának. A közös jelöltek számos billegő körzetet is meg tudtak nyerni, miközben a listás szavazatokban is erős támogatást kaptak. A választás eredménye új politikai korszak kezdetét jelenti, amelyben az ellenzéki koalíció vállalja a kormányzás felelősségét és a kampány során ígért változások megvalósítását.",
        imageUri: "src/assets/images/2022/ellenzek_gyozelem.jpg",
      },
    },
    electionConfig: {
      playerSide: "ellenzeki_osszefogas",
      parties: [
        { id: "fidesz", name: "Fidesz–KDNP", color: "#F28E2B" },
        {
          id: "ellenzeki_osszefogas",
          name: "Ellenzéki összefogás",
          color: "#20b2aa",
        },
        { id: "mi_hazank", name: "Mi Hazánk", color: "#688d1b" },
      ],
    } as ElectionConfig,
    voterEnvironmentConfig: {} as VoterEnvironmentConfig,
    candidateListData: candidateList,
    partyListData: [],
    districts,
    capitalCity: [],
    questions: [],
    answerEffect: [],
  });
  const results = {
    winnerParty: "ellenzeki_osszefogas",
    mandates: [
      {
        party: "fidesz",
        totalSeats: 80,
        constituencySeats: 87,
        listSeats: 48,
      },
      {
        party: "ellenzeki_osszefogas",
        totalSeats: 112,
        constituencySeats: 19,
        listSeats: 38,
      },
      {
        party: "mi_hazank",
        totalSeats: 6,
        constituencySeats: 0,
        listSeats: 6,
      },
    ],
  } as any;
  return <FinalResultScreen results={results} />;
}
