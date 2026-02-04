import { useState } from "react";
import { MapCreator } from "./MapCreator";
import questions from "../../../assets/jsons/2022/2022_questions.json";
import { QuestionCard } from "./QuestionCard";
import { EffectApplier } from "../../../logic/domain/EffectApplier";
import type { ElectionConfig } from "../../../logic/domain/MandateCalculator";
import type { VoterEnvironmentConfig } from "../../../logic/VoterEnvironment";
import type {
  CandidateListData,
  PartyListData,
} from "../../../logic/domain/ResultTransformer/PipelineTransform";
import candidateJSON from "../../../assets/jsons/2022/oevk_constituency_results.json";
import partyJSON from "../../../assets/jsons/2022/oevk_list_results.json";

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen() {
  const [candidateData, setCandidateData] =
    useState<CandidateListData[]>(candidateJSON);
  const [partyData, setPartyData] = useState<PartyListData[]>(partyJSON);
  const electionConfig: ElectionConfig = {
    listSeats: 93,
    thresholdPercent: 5,
  };
  const voterEnvironmentConfig: VoterEnvironmentConfig = {
    maxTurnout: 85,
    eligibleVoters: 8215304,
    listData: candidateData,
  };
  const electionEffectapplier = new EffectApplier(
    electionConfig,
    voterEnvironmentConfig,
    candidateData,
    partyData,
  );
  electionEffectapplier.applyEffects([]);
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  return currentView === "MapView" ? (
    <MapCreator setCurrentView={setCurrentView} />
  ) : (
    <QuestionCard
      id={questions[currentQuestion].id}
      question={questions[currentQuestion].question}
      possibleAnswers={questions[currentQuestion].possibleAnswers}
      setCurrentView={setCurrentView}
      currentQuestion={currentQuestion}
      setCurrentQuestion={setCurrentQuestion}
    />
  );
}
