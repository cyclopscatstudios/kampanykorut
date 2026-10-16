import {
  HeadBucketCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { StorageConfig } from "../../config/env";

export interface ObjectStorage {
  publicUrl(key: string): string;
  exists(key: string): Promise<boolean>;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  check(): Promise<void>;
}

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint ?? undefined,
      forcePathStyle: config.endpoint !== null,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  publicUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      return true;
    } catch (err) {
      if (err instanceof NotFound) return false;
      throw err;
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: IMMUTABLE_CACHE,
      }),
    );
  }

  async check(): Promise<void> {
    await this.client.send(
      new HeadBucketCommand({ Bucket: this.config.bucket }),
    );
  }
}

export class InMemoryObjectStorage implements ObjectStorage {
  readonly objects = new Map<string, { body: Buffer; contentType: string }>();

  constructor(private readonly baseUrl = "https://cdn.test") {}

  publicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    this.objects.set(key, { body, contentType });
  }

  async check(): Promise<void> {}
}
