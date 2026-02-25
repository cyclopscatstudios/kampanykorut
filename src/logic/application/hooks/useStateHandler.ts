import { container } from "tsyringe";
import { StateHandler, type StateHandlerType } from "../StateHandler";

export function useStateHandler() {
  const stateHandler = container.resolve(StateHandler);

  const updateState = (key: keyof StateHandlerType, value: unknown) => {
    const currentState = stateHandler.get(key);
    console.log({ currentState, value });
    if (Array.isArray(currentState)) {
      if (Array.isArray(value)) {
        return stateHandler.set(key, [...currentState, ...value]);
      }
      return stateHandler.set(key, [...currentState, value]);
    }
    return stateHandler.set(key, value as any);
  };

  return {
    updateState,
  };
}
