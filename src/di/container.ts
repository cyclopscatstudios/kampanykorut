import { container } from "tsyringe";
import { uuidGenerator } from "../logic/application/IdGenerator";
import { Navigation } from "../logic/application/navigation/Navigation";
import { SettingsEngine } from "../logic/application/SettingsEngine";
import {
  ConfigEngine,
  Emitter,
  StateEngine,
  StateHandler,
  StorageEngine,
} from "@/logic/application";
import {
  DistrictGroupEngine,
  DistrictVoteTransformer,
  EffectApplier,
  MandateCalculator,
  ResultModifier,
  UnionSwingTransformer,
  VoterEnvironment,
  VoteShareTransformer,
} from "@/shared/domain";
import { PollsterEngine } from "../../shared/domain/PollsterEngine";

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

const pollsterEngine = new PollsterEngine();
container.registerInstance(PollsterEngine, pollsterEngine);

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

const mandateCalculator = new MandateCalculator();
container.registerInstance(MandateCalculator, mandateCalculator);

const effectApplier = new EffectApplier(
  electionConfigEngine,
  campaignStateEngine,
  mandateCalculator,
  stateHandler,
  districtGroupEngine,
);
container.registerInstance(EffectApplier, effectApplier);
