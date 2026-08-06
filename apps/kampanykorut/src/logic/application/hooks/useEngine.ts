import { container } from "tsyringe";

type Constructor<T = any> = new (...args: any[]) => T;

export function useEngine<T>(cls: Constructor<T>): T {
  return container.resolve(cls);
}
