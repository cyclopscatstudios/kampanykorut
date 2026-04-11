import { useEffect, useState } from "react";
import { MenuStateMachine } from "../MenuStateMachine";
import { useEngine } from "./useEngine";

export function useAppStateMachine() {
  const stateMachine = useEngine(MenuStateMachine);

  const [state, setState] = useState(stateMachine.getCurrentScreen());

  useEffect(() => {
    return stateMachine.subscribe(setState);
  }, [stateMachine]);

  return {
    state,
    transition: stateMachine.transition,
  };
}
