import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useElectionState } from "./useElectionState";

describe("useElectionState", () => {
  it("should initialize state", () => {
    const { result } = renderHook(() => useElectionState("2022_ogyv_default"), {
      wrapper: MemoryRouter,
    });

    expect(result.current.state).toMatchSnapshot();
  });
});
