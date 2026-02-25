import { container } from "tsyringe";
import { FinalResultScreen } from "../components/ui/gameplay/FinalResultScreen";
import type { FinalResults } from "../logic/domain/CampaignEngine";
import { StateHandler } from "../logic/application/StateHandler";
import type { ElectionConfig } from "../logic/domain/MandateCalculator.types";
import type { VoterEnvironmentConfig } from "../logic/VoterEnvironment";

export function FinalResultDev() {
    const stateHandler = container.resolve(StateHandler);
    stateHandler.set("currentConfig", {
        finalResultAssets: { playerSideDefeat: "src/assets/images/2022/ellenzek_vereseg_ketharmad.jpg", playerSideVictory: "" },
        electionConfig: {} as ElectionConfig,
        voterEnvironmentConfig: {} as VoterEnvironmentConfig,
        candidateListData: [],
        partyListData: [],
        districts: [],
        capitalCity: [],
        questions: [],
        answerEffect: []
    })
    const results = {
        mandates: [
            {
                party: "fidesz",
                totalSeats: 135,
                constituencySeats: 80,
                listSeats: 55
            }
        ]
    } as FinalResults;
    return (
        <FinalResultScreen results={results} />
    )
}