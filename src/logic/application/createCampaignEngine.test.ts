import { container } from "tsyringe";
import { createCampaignEngine } from "./createCampaignEngine";
import { mockGameConfig } from "./hooks/MockGameConfig";
import { StateEngine } from "./StateEngine";

const FIXED_SESSION_ID = "fixed-test-session-id";

describe("createCampaignEngine", () => {
  beforeEach(() => {
    const engine = container.resolve(StateEngine);
    (engine as unknown as { sessionId: string }).sessionId = FIXED_SESSION_ID;
  });

  it("should create a new campaign engine instance", () => {
    const result = createCampaignEngine(mockGameConfig, "");
    expect(result).toMatchSnapshot();
  });
});
