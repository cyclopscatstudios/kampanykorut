import { renderHook } from "@testing-library/react";
import { useStateEngine } from "./useStateEngine";

describe("useStateEngine", () => {
  it("returns a non-empty sessionId string", () => {
    const { result } = renderHook(() => useStateEngine());
    expect(typeof result.current.sessionId).toBe("string");
    expect(result.current.sessionId.length).toBeGreaterThan(0);
  });

  it("exposes saveSession as a function", () => {
    const { result } = renderHook(() => useStateEngine());
    expect(typeof result.current.saveSession).toBe("function");
  });

  it("currentState is null or a non-array object", () => {
    const { result } = renderHook(() => useStateEngine());
    const { currentState } = result.current;
    const valid =
      currentState === null ||
      (typeof currentState === "object" && !Array.isArray(currentState));
    expect(valid).toBe(true);
  });

  it("currentHistory is null or an array", () => {
    const { result } = renderHook(() => useStateEngine());
    const { currentHistory } = result.current;
    const valid = currentHistory === null || Array.isArray(currentHistory);
    expect(valid).toBe(true);
  });

  it("returns the same sessionId across re-renders", () => {
    const { result, rerender } = renderHook(() => useStateEngine());
    const firstId = result.current.sessionId;
    rerender();
    expect(result.current.sessionId).toBe(firstId);
  });
});
