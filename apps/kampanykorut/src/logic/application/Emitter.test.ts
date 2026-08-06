import { Emitter } from "./Emitter";

class TestEmitter<T> extends Emitter<T> {
  emit(event: T) {
    this.notify(event);
  }
}

describe("Emitter", () => {
  describe("subscribe", () => {
    it("delivers events to the registered listener", () => {
      const emitter = new TestEmitter<number>();
      const received: number[] = [];

      emitter.subscribe((n) => received.push(n));
      emitter.emit(42);

      expect(received).toEqual([42]);
    });

    it("delivers multiple events in order", () => {
      const emitter = new TestEmitter<string>();
      const received: string[] = [];

      emitter.subscribe((s) => received.push(s));
      emitter.emit("a");
      emitter.emit("b");
      emitter.emit("c");

      expect(received).toEqual(["a", "b", "c"]);
    });

    it("all subscribers receive each event", () => {
      const emitter = new TestEmitter<number>();
      const a: number[] = [];
      const b: number[] = [];

      emitter.subscribe((n) => a.push(n));
      emitter.subscribe((n) => b.push(n));
      emitter.emit(1);

      expect(a).toEqual([1]);
      expect(b).toEqual([1]);
    });

    it("returns an unsubscribe function that stops delivery", () => {
      const emitter = new TestEmitter<number>();
      const received: number[] = [];

      const unsubscribe = emitter.subscribe((n) => received.push(n));
      emitter.emit(1);
      unsubscribe();
      emitter.emit(2);

      expect(received).toEqual([1]);
    });

    it("unsubscribing one listener does not affect others", () => {
      const emitter = new TestEmitter<number>();
      const a: number[] = [];
      const b: number[] = [];

      const unsubA = emitter.subscribe((n) => a.push(n));
      emitter.subscribe((n) => b.push(n));

      emitter.emit(1);
      unsubA();
      emitter.emit(2);

      expect(a).toEqual([1]);
      expect(b).toEqual([1, 2]);
    });

    it("calling unsubscribe twice has no effect", () => {
      const emitter = new TestEmitter<number>();
      const received: number[] = [];

      const unsubscribe = emitter.subscribe((n) => received.push(n));
      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();

      emitter.emit(1);
      expect(received).toEqual([]);
    });

    it("emitting with no subscribers does not throw", () => {
      const emitter = new TestEmitter<string>();
      expect(() => emitter.emit("x")).not.toThrow();
    });
  });
});
