import { createCampaignEngine } from "./createCampaignEngine";
import { mockGameConfig } from "./hooks/MockGameConfig";

describe("createCampaignEngine", () => {
  it("should create a new campaign engine instance", () => {
    const result = createCampaignEngine(mockGameConfig);
    expect(result).toMatchSnapshot();
  });
});
