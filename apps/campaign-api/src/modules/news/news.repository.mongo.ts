import { type Connection, type Model, Schema } from "mongoose";
import { NEWS_TYPES, type NewsLang } from "./news.parse";
import type {
  ActiveNewsQuery,
  ArchiveNewsQuery,
  NewsRecord,
  NewsRepository,
} from "./news.repository";

const NewsSchema = new Schema<NewsRecord>(
  {
    githubId: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: [...NEWS_TYPES, null], default: null },
    lang: { type: String, enum: ["hu", "en"], required: true },
    lead: { type: String, default: "" },
    html: { type: String, default: "" },
    markdown: { type: String, default: "" },
    coverSourceUrl: { type: String, default: null },
    cover: {
      type: new Schema(
        { large16x9Url: String, thumbUrl: String },
        { _id: false },
      ),
      default: null,
    },
    cta: {
      type: new Schema({ label: String, url: String }, { _id: false }),
      default: null,
    },
    url: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    visible: { type: Boolean, required: true },
    expiresAt: { type: Date, default: null },
    publishedAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    sourceHash: { type: String, required: true },
    contentComplete: { type: Boolean, default: false },
    syncedAt: { type: Date, required: true },
  },
  { collection: "news", versionKey: false, timestamps: false },
);

NewsSchema.index({ visible: 1, lang: 1, isPinned: -1, publishedAt: -1 });
NewsSchema.index({ visible: 1, lang: 1, type: 1, publishedAt: -1, number: -1 });

function toRecord(doc: NewsRecord & { _id?: unknown }): NewsRecord {
  const record = { ...doc };
  delete record._id;
  return record;
}

export class MongoNewsRepository implements NewsRepository {
  private readonly model: Model<NewsRecord>;

  constructor(connection: Connection) {
    this.model =
      (connection.models.News as Model<NewsRecord> | undefined) ??
      connection.model<NewsRecord>("News", NewsSchema);
  }

  init(): Promise<void> {
    return this.model.init().then(() => undefined);
  }

  async upsert(news: NewsRecord): Promise<void> {
    await this.model.replaceOne({ githubId: news.githubId }, news, {
      upsert: true,
    });
  }

  async findByGithubId(githubId: string): Promise<NewsRecord | null> {
    const doc = await this.model.findOne({ githubId }).lean<NewsRecord>();
    return doc ? toRecord(doc) : null;
  }

  async findVisibleByNumber(number: number): Promise<NewsRecord | null> {
    const doc = await this.model
      .findOne({ number, visible: true })
      .lean<NewsRecord>();
    return doc ? toRecord(doc) : null;
  }

  async hide(githubId: string, syncedAt: Date): Promise<void> {
    await this.model.updateOne(
      { githubId },
      { $set: { visible: false, syncedAt } },
    );
  }

  async listVisibleGithubIds(): Promise<string[]> {
    const docs = await this.model
      .find({ visible: true }, { githubId: 1 })
      .lean<{ githubId: string }[]>();
    return docs.map((doc) => doc.githubId);
  }

  async hasVisible(lang: NewsLang): Promise<boolean> {
    return (await this.model.exists({ visible: true, lang })) !== null;
  }

  async listActive({ lang, limit, now }: ActiveNewsQuery) {
    const docs = await this.model
      .find({
        visible: true,
        lang,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      })
      .sort({ isPinned: -1, publishedAt: -1, number: -1 })
      .limit(limit)
      .lean<NewsRecord[]>();
    return docs.map(toRecord);
  }

  async listArchive({ lang, limit, type, before }: ArchiveNewsQuery) {
    const docs = await this.model
      .find({
        visible: true,
        lang,
        ...(type ? { type } : {}),
        ...(before
          ? {
              $or: [
                { publishedAt: { $lt: before.publishedAt } },
                {
                  publishedAt: before.publishedAt,
                  number: { $lt: before.number },
                },
              ],
            }
          : {}),
      })
      .sort({ publishedAt: -1, number: -1 })
      .limit(limit)
      .lean<NewsRecord[]>();
    return docs.map(toRecord);
  }
}
