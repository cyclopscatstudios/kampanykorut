import type { PlayTimeRecord } from "./play-time";

export interface PlayTimeRepository {
  findBySessionId(sessionId: string): Promise<PlayTimeRecord | null>;
  save(record: PlayTimeRecord): Promise<boolean>;
}

export class InMemoryPlayTimeRepository implements PlayTimeRepository {
  private readonly items = new Map<string, PlayTimeRecord>();

  async findBySessionId(sessionId: string) {
    const item = this.items.get(sessionId);
    return item ? structuredClone(item) : null;
  }

  async save(record: PlayTimeRecord) {
    const current = this.items.get(record.sessionId);
    const expected = current ? current.revision + 1 : 0;
    if (record.revision !== expected) return false;
    this.items.set(record.sessionId, structuredClone(record));
    return true;
  }
}
