import { container } from "tsyringe";
import { createCampaignEngine } from "./createCampaignEngine";
import { mockGameConfig } from "./hooks/MockGameConfig";
import { StateHandler } from "./StateHandler";

const FIXED_SESSION_ID = "fixed-test-session-id";

describe("createCampaignEngine", () => {
  beforeEach(() => {
    container.resolve(StateHandler).set("sessionId", FIXED_SESSION_ID);
  });

  it("should create a new campaign engine instance", () => {
    const result = createCampaignEngine(mockGameConfig, "");
    expect(result).toMatchSnapshot();
  });
});
