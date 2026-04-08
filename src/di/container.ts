import { container } from "tsyringe";
import { GameConfigEngine } from "../logic/application/GameConfigEngine";
import { StorageEngine } from "../logic/application/StorageEngine";
import { GameStateEngine } from "../logic/application/GameStateEngine";
import { AppStateMachine } from "../logic/application/AppStateMachine";
import { StateEngine } from "../logic/application/StateEngine";
import { VoterEnvironment } from "../logic/VoterEnvironment";
import {
  DistrictVoteTransformer,
  ResultModifier,
  UnionSwingTransformer,
  VoteShareTransformer,
} from "@/logic/domain";

const storageEngine = new StorageEngine();
container.registerInstance(StorageEngine, storageEngine);

const gameConfigEngine = new GameConfigEngine(storageEngine);
container.registerInstance(GameConfigEngine, gameConfigEngine);

const gameStateEngine = new GameStateEngine(gameConfigEngine);
container.registerInstance(GameStateEngine, gameStateEngine);

const stateEngine = new StateEngine(storageEngine);
container.registerInstance(StateEngine, stateEngine);

const appStateMachine = new AppStateMachine(stateEngine, gameStateEngine);
container.registerInstance(AppStateMachine, appStateMachine);

const voterEnvironment = new VoterEnvironment();
container.registerInstance(VoterEnvironment, voterEnvironment);

const unionSwingTransformer = new UnionSwingTransformer();
container.registerInstance(UnionSwingTransformer, unionSwingTransformer);

const districtVoteTransformer = new DistrictVoteTransformer(voterEnvironment);
container.registerInstance(DistrictVoteTransformer, districtVoteTransformer);

const voterShareTransformer = new VoteShareTransformer(voterEnvironment);
container.registerInstance(VoteShareTransformer, voterShareTransformer);

const resultModifier = new ResultModifier(
  unionSwingTransformer,
  voterShareTransformer,
  districtVoteTransformer,
);
container.registerInstance(ResultModifier, resultModifier);
