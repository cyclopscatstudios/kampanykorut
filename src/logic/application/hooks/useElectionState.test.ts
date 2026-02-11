import { renderHook } from "@testing-library/react";
import { useElectionState } from "./useElectionState";

describe("useElectionState", () => {
  it("should initialize state", () => {
    const { result } = renderHook(() => useElectionState("2022_ogyv_default"));

    expect(result.current.state).toMatchSnapshot();
  });
});
