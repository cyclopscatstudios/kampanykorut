import { container } from "tsyringe";
import {
  GameConfigEngine,
  StorageEngine,
  GameStateEngine,
  AppStateMachine,
  StateEngine,
} from "@/logic/application";
import {
  DistrictVoteTransformer,
  ResultModifier,
  UnionSwingTransformer,
  VoteShareTransformer,
  VoterEnvironment,
} from "@/logic/domain";
import { DistrictGroupEngine } from "../logic/domain/DistrictGroupEngine";

const storageEngine = new StorageEngine();
container.registerInstance(StorageEngine, storageEngine);

const voterEnvironment = new VoterEnvironment();
container.registerInstance(VoterEnvironment, voterEnvironment);

const districtVoteTransformer = new DistrictVoteTransformer(voterEnvironment);
container.registerInstance(DistrictVoteTransformer, districtVoteTransformer);

const districtGroupEngine = new DistrictGroupEngine();
container.registerInstance(DistrictGroupEngine, districtGroupEngine);

const gameConfigEngine = new GameConfigEngine(storageEngine);
container.registerInstance(GameConfigEngine, gameConfigEngine);

const gameStateEngine = new GameStateEngine(
  gameConfigEngine,
  voterEnvironment,
  districtGroupEngine,
  storageEngine,
);
container.registerInstance(GameStateEngine, gameStateEngine);

const stateEngine = new StateEngine(storageEngine);
container.registerInstance(StateEngine, stateEngine);

const appStateMachine = new AppStateMachine(stateEngine, gameStateEngine);
container.registerInstance(AppStateMachine, appStateMachine);

const unionSwingTransformer = new UnionSwingTransformer();
container.registerInstance(UnionSwingTransformer, unionSwingTransformer);

const voterShareTransformer = new VoteShareTransformer(voterEnvironment);
container.registerInstance(VoteShareTransformer, voterShareTransformer);

const resultModifier = new ResultModifier(
  unionSwingTransformer,
  voterShareTransformer,
  districtVoteTransformer,
);
container.registerInstance(ResultModifier, resultModifier);
