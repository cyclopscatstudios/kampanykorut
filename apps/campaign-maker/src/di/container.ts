import { container } from "tsyringe";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import type { SessionKey } from "../logic/application/SessionKey";

const storageEngine = new StorageEngine<SessionKey>("campaign_maker");
container.registerInstance(StorageEngine, storageEngine);
