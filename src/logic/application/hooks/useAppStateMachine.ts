import { useEffect, useState } from "react";
import { AppStateMachine } from "../AppStateMachine";
import { useEngine } from "./useEngine";

export function useAppStateMachine() {
  const stateMachine = useEngine(AppStateMachine);

  const [state, setState] = useState(stateMachine.getCurrentScreen());

  useEffect(() => {
    return stateMachine.subscribe(setState);
  }, [stateMachine]);

  return {
    state,
    transition: stateMachine.transition,
  };
}
