import { type Connection, type Model, mongo, Schema } from "mongoose";
import type { PlayTimeRecord } from "./play-time";
import type { PlayTimeRepository } from "./play-time.repository";

const PlayTimeSchema = new Schema<PlayTimeRecord>(
  {
    sessionId: { type: String, required: true, unique: true },
    campaignId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "paused", "finished"],
      required: true,
    },
    activeMs: { type: Number, required: true },
    segments: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    lastActiveAt: { type: Date, required: true },
    finishedAt: { type: Date, default: null },
    revision: { type: Number, required: true },
  },
  { collection: "playTimes", versionKey: false, timestamps: false },
);

PlayTimeSchema.index({ campaignId: 1, status: 1, startedAt: -1 });

function toRecord(doc: PlayTimeRecord & { _id?: unknown }): PlayTimeRecord {
  const record = { ...doc };
  delete record._id;
  return record;
}

export class MongoPlayTimeRepository implements PlayTimeRepository {
  private readonly model: Model<PlayTimeRecord>;

  constructor(connection: Connection) {
    this.model =
      (connection.models.PlayTime as Model<PlayTimeRecord> | undefined) ??
      connection.model<PlayTimeRecord>("PlayTime", PlayTimeSchema);
  }

  init(): Promise<void> {
    return this.model.init().then(() => undefined);
  }

  async findBySessionId(sessionId: string) {
    const doc = await this.model.findOne({ sessionId }).lean<PlayTimeRecord>();
    return doc ? toRecord(doc) : null;
  }

  async save(record: PlayTimeRecord) {
    if (record.revision === 0) {
      try {
        await this.model.create(record);
        return true;
      } catch (err) {
        if (err instanceof mongo.MongoServerError && err.code === 11000) {
          return false;
        }
        throw err;
      }
    }

    const result = await this.model.updateOne(
      { sessionId: record.sessionId, revision: record.revision - 1 },
      { $set: record },
    );
    return result.modifiedCount > 0;
  }
}
