import { container } from "tsyringe";
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
import { PollsterEngine } from "@/shared/domain/PollsterEngine";
import { ConfigEngine } from "../logic/application/ConfigEngine";
import { Emitter } from "../logic/application/Emitter";
import { uuidGenerator } from "../logic/application/IdGenerator";
import { Navigation } from "../logic/application/navigation/Navigation";
import { SettingsEngine } from "../logic/application/SettingsEngine";
import { StateEngine } from "../logic/application/StateEngine";
import { StateHandler } from "../logic/application/StateHandler";
import { StorageEngine } from "../logic/application/StorageEngine";

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

const stateHandler = new StateHandler();
container.registerInstance(StateHandler, stateHandler);

const electionConfigEngine = new ConfigEngine(storageEngine, stateHandler);
container.registerInstance(ConfigEngine, electionConfigEngine);

const navigationService = new Navigation();
container.registerInstance(Navigation, navigationService);

const campaignStateEngine = new StateEngine(
  electionConfigEngine,
  voterEnvironment,
  districtGroupEngine,
  storageEngine,
  uuidGenerator,
  navigationService,
  stateHandler,
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

const effectApplier = new EffectApplier(mandateCalculator, districtGroupEngine);
container.registerInstance(EffectApplier, effectApplier);

const pollsterEngine = new PollsterEngine(mandateCalculator);
container.registerInstance(PollsterEngine, pollsterEngine);
