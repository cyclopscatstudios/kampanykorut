import { createLogger } from "@/shared/logger";
import { injectable } from "tsyringe";
import { Pollster } from "../types/pollsters";
import { defaultPollsters as DEFAULT_POLLSTERS } from "./DefaultPollsters";

const log = createLogger("PollsterEngine");

@injectable()
export class PollsterEngine {
  private pollsters: Pollster[] = [];

  constructor() {
    log.debug("PollsterEngine initialized");
  }

  configure(customPollsters?: Pollster[]) {
    const pollsters = [...DEFAULT_POLLSTERS];
    if (customPollsters) {
      log.debug("Configuring PollsterEngine with custom pollsters", {
        customPollsters,
      });
      this.pollsters = [...pollsters, ...customPollsters];
    }
    this.pollsters = pollsters;
  }
}
