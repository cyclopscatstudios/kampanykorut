import { createLogger } from "../../../shared/logger/logger";

export type Listener<T> = (event: T) => void;

const log = createLogger("Emitter");

export class Emitter<T> {
  protected listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  protected notify(event: T) {
    log.debug("Emitting event", { event });
    this.listeners.forEach((l) => l(event));
  }
}
