import electionConfig from "./election_config.json";
import voterEnvironmentRaw from "./voter_environment_config.json";
import candidateListData from "./oevk_constituency_results.json";
import partyListData from "./oevk_list_results.json";
import districts from "./oevk_2022.json";
import capitalCity from "./budapest.json";
import questions from "./2022_questions.json";
import answerEffect from "./2022_answer_effects.json";
import type {
  AnsweEffectProps,
  GameModeConfig,
} from "../../../logic/application/hooks/useElectionState";
import ellenzek_vereseg from '../../images/2022/ellenzek_vereseg_ketharmad.jpg';
import ellenzek_gyozelem from '../../images/2022/ellenzek_gyozelem.jpg';

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
  answerEffect: answerEffect as AnsweEffectProps[],
  finalResultAssets: {
    playerSideDefeat: ellenzek_vereseg,
    playerSideVictory: ellenzek_gyozelem,
  }
};
