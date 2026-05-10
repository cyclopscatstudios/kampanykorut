import { container } from "tsyringe";
import {
  ConfigEngine,
  StorageEngine,
  StateEngine,
  Emitter,
  StateHandler,
} from "@/logic/application";
import {
  DistrictVoteTransformer,
  EffectApplier,
  MandateCalculator,
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

const electionConfigEngine = new ConfigEngine(storageEngine);
container.registerInstance(ConfigEngine, electionConfigEngine);

const navigationService = new Navigation();
container.registerInstance(Navigation, navigationService);

const stateHandler = new StateHandler();
container.registerInstance(StateHandler, stateHandler);

const campaignStateEngine = new StateEngine(
  electionConfigEngine,
  voterEnvironment,
  districtGroupEngine,
  storageEngine,
  uuidGenerator,
  navigationService,
);
container.registerInstance(StateEngine, campaignStateEngine);

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

const mandateCalculator = new MandateCalculator(electionConfigEngine);
container.registerInstance(MandateCalculator, mandateCalculator);

const effectApplier = new EffectApplier(
  electionConfigEngine,
  campaignStateEngine,
  mandateCalculator,
  stateHandler,
  districtGroupEngine,
);
container.registerInstance(EffectApplier, effectApplier);
