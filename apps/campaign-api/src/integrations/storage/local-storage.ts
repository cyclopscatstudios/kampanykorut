import { createReadStream } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import fp from "fastify-plugin";
import type { ObjectStorage } from "./object-storage";

export const LOCAL_ASSETS_PREFIX = "/api/v1/assets";

const SAFE_KEY = /^[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/;

export class LocalObjectStorage implements ObjectStorage {
  constructor(readonly dir: string) {}

  publicUrl(key: string): string {
    return `${LOCAL_ASSETS_PREFIX}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(this.filePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async put(key: string, body: Buffer): Promise<void> {
    const file = this.filePath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  }

  async check(): Promise<void> {
    await mkdir(this.dir, { recursive: true });
  }

  filePath(key: string): string {
    if (!SAFE_KEY.test(key)) throw new Error(`Invalid asset key: ${key}`);
    return path.join(this.dir, ...key.split("/"));
  }
}

export const localAssets = fp<{ storage: LocalObjectStorage }>(
  async (app, { storage }) => {
    app.get<{ Params: { "*": string } }>(
      `${LOCAL_ASSETS_PREFIX}/*`,
      { schema: { hide: true } },
      async (request, reply) => {
        const key = request.params["*"];

        if (!SAFE_KEY.test(key) || !(await storage.exists(key))) {
          throw Object.assign(new Error("Asset not found"), {
            statusCode: 404,
          });
        }

        return reply
          .type("image/webp")
          .header("cache-control", "public, max-age=31536000, immutable")
          .send(createReadStream(storage.filePath(key)));
      },
    );
  },
  { name: "local-assets" },
);
