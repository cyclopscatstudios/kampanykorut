import electionConfig from "./election_config.json";
import voterEnvironmentRaw from "./voter_environment_config.json";
import candidateListData from "./oevk_constituency_results.json";
import partyListData from "./oevk_list_results.json";
import districts from "./oevk_2022.json";
import capitalCity from "./budapest.json";
import questions from "./ellenzeki_osszefogas/2022_questions.json";
import answerEffect from "./ellenzeki_osszefogas/2022_answer_effects.json";
import endResults from "./end_results.json";
import feedback from "./ellenzeki_osszefogas/advisor_feedback.json";
import feedbackAssets from "./ellenzeki_osszefogas/advisor_feedback_assets.json";
import customGroups from "./custom_groups.json";
import type {
  GameModeConfig,
  RawAnsweEffectProps,
} from "../../../logic/types/campaignEngine.types";

export const config2022: GameModeConfig = {
  electionConfig,
  voterEnvironmentConfig: {
    ...voterEnvironmentRaw,
    listData: candidateListData,
  },
  candidateListData,
  partyListData,
  districts,
  capitalCity,
  questions,
  // TODO fix this later
  answerEffect: answerEffect as RawAnsweEffectProps[],
  endResults,
  advisorFeedbackAssets: feedbackAssets,
  advisorFeedback: feedback,
  customGroups,
};
