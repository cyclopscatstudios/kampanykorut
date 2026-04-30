import { container } from "tsyringe";
import {
  GameConfigEngine,
  StorageEngine,
  GameStateEngine,
  Emitter,
  StateHandler,
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
import { Navigation } from "../logic/application/navigation/Navigation";
import { uuidGenerator } from "../logic/application/IdGenerator";

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

const navigationService = new Navigation();
container.registerInstance(Navigation, navigationService);

const stateHandler = new StateHandler();
container.registerInstance(StateHandler, stateHandler);

const gameStateEngine = new GameStateEngine(
  gameConfigEngine,
  voterEnvironment,
  districtGroupEngine,
  storageEngine,
  stateHandler,
  uuidGenerator,
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
