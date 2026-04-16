import { container } from "tsyringe";
import {
  GameConfigEngine,
  StorageEngine,
  GameStateEngine,
  MenuStateMachine,
  StateEngine,
  Emitter,
} from "@/logic/application";
import {
  DistrictVoteTransformer,
  ResultModifier,
  UnionSwingTransformer,
  VoteShareTransformer,
  VoterEnvironment,
} from "@/logic/domain";
import { DistrictGroupEngine } from "../logic/domain/DistrictGroupEngine";
import { SettingsEngine } from "../logic/application/SettingsEngine";

const emitter = new Emitter();
container.registerInstance(Emitter, emitter);

const storageEngine = new StorageEngine();
container.registerInstance(StorageEngine, storageEngine);

const voterEnvironment = new VoterEnvironment();
container.registerInstance(VoterEnvironment, voterEnvironment);

const districtVoteTransformer = new DistrictVoteTransformer(voterEnvironment);
container.registerInstance(DistrictVoteTransformer, districtVoteTransformer);

const districtGroupEngine = new DistrictGroupEngine();
container.registerInstance(DistrictGroupEngine, districtGroupEngine);

const settingsEngine = new SettingsEngine(storageEngine);
container.registerInstance(SettingsEngine, settingsEngine);

const gameConfigEngine = new GameConfigEngine(storageEngine);
container.registerInstance(GameConfigEngine, gameConfigEngine);

const stateEngine = new StateEngine(storageEngine);
container.registerInstance(StateEngine, stateEngine);

const menuStateEngine = new MenuStateMachine(stateEngine);
container.registerInstance(MenuStateMachine, menuStateEngine);

const gameStateEngine = new GameStateEngine(
  gameConfigEngine,
  voterEnvironment,
  districtGroupEngine,
  storageEngine,
  menuStateEngine,
);
container.registerInstance(GameStateEngine, gameStateEngine);

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
