type Events = {
  changeLanguage: string;
};

class EventEmitter<E extends Record<string, any>> {
  private events = new Map<keyof E, Set<(payload: any) => void>>();

  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void) {
    let handlers = this.events.get(event);
    if (!handlers) {
      handlers = new Set();
      this.events.set(event, handlers);
    }

    handlers.add(handler);

    return () => handlers!.delete(handler);
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    this.events.get(event)?.forEach((handler) => handler(payload));
  }
}

export const eventEmitter = new EventEmitter<Events>();
