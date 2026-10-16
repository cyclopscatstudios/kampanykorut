import { createHash } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import sharp from "sharp";
import type { ObjectStorage } from "../../integrations/storage/object-storage";

export interface NewsCover {
  large16x9Url: string;
  thumbUrl: string;
}

interface Variant {
  name: string;
  render: (image: sharp.Sharp) => sharp.Sharp;
}

const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 15_000;
const WEBP = { quality: 82 };

const COVER_VARIANTS: Variant[] = [
  {
    name: "cover-16x9",
    render: (image) =>
      image.resize(1200, 675, { fit: "cover", position: "attention" }),
  },
  {
    name: "thumb",
    render: (image) =>
      image.resize(320, 320, { fit: "cover", position: "attention" }),
  },
];

const INLINE_VARIANT: Variant = {
  name: "inline",
  render: (image) => image.resize({ width: 1200, withoutEnlargement: true }),
};

export class NewsImageCopier {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly log: FastifyBaseLogger,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async copyCover(sourceUrl: string): Promise<NewsCover | null> {
    const [large, thumb] = await this.copy(sourceUrl, COVER_VARIANTS);
    return large && thumb ? { large16x9Url: large, thumbUrl: thumb } : null;
  }

  async copyInline(sourceUrl: string): Promise<string | null> {
    const [url] = await this.copy(sourceUrl, [INLINE_VARIANT]);
    return url ?? null;
  }

  private async copy(
    sourceUrl: string,
    variants: Variant[],
  ): Promise<(string | undefined)[]> {
    const prefix = `news/${createHash("sha256").update(sourceUrl).digest("hex").slice(0, 32)}`;
    const keys = variants.map((v) => `${prefix}/${v.name}.webp`);

    try {
      const existing = await Promise.all(
        keys.map((key) => this.storage.exists(key)),
      );

      if (existing.some((exists) => !exists)) {
        const source = await this.download(sourceUrl);
        await Promise.all(
          variants.map(async (variant, i) => {
            if (existing[i]) return;
            const webp = await variant
              .render(sharp(source).rotate())
              .webp(WEBP)
              .toBuffer();
            await this.storage.put(keys[i]!, webp, "image/webp");
          }),
        );
      }

      return keys.map((key) => this.storage.publicUrl(key));
    } catch (err) {
      this.log.warn({ err, sourceUrl }, "Could not copy news image");
      return [];
    }
  }

  private async download(url: string): Promise<Buffer> {
    const res = await this.fetchFn(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Image download failed with ${res.status}`);
    }
    if (Number(res.headers.get("content-length") ?? 0) > MAX_DOWNLOAD_BYTES) {
      throw new Error("Image is too large");
    }

    const chunks: Uint8Array[] = [];
    let size = 0;
    for await (const chunk of res.body) {
      size += chunk.byteLength;
      if (size > MAX_DOWNLOAD_BYTES) throw new Error("Image is too large");
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
