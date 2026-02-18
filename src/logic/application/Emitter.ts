export type Listener<T> = (event: T) => void;

export class Emitter<T> {
  protected listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  protected notify(event: T) {
    console.log("notify", event);
    this.listeners.forEach((l) => l(event));
  }
}
