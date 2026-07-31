import { container } from "tsyringe";
import { StateHandler, type StateHandlerType } from "../StateHandler";

export function useStateHandler() {
  const stateHandler = container.resolve(StateHandler);

  const updateState = <K extends keyof StateHandlerType>(
    key: K,
    value: StateHandlerType[K],
  ) => {
    return stateHandler.set(key, value);
  };

  const getState = <K extends keyof StateHandlerType>(
    key: K,
  ): StateHandlerType[K] => {
    return stateHandler.get(key);
  };

  return {
    getState,
    updateState,
  };
}
