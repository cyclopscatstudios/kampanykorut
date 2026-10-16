import type { FastifyBaseLogger } from "fastify";
import sharp from "sharp";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { InMemoryObjectStorage } from "../../integrations/storage/object-storage";
import { NewsContentProcessor } from "./news.content";
import { NewsImageCopier } from "./news.images";
import type { ParsedNews } from "./news.parse";

const log = { warn: vi.fn() } as unknown as FastifyBaseLogger;
const COVER = "https://github.com/user-attachments/assets/cover";
const INLINE = "https://github.com/user-attachments/assets/inline";

let png: Buffer;

beforeAll(async () => {
  png = await sharp({
    create: { width: 1600, height: 1200, channels: 3, background: "#d23" },
  })
    .png()
    .toBuffer();
});

function fakeFetch(failing: string[] = []) {
  return vi.fn<typeof fetch>(async (input) =>
    failing.includes(String(input))
      ? new Response("nope", { status: 404 })
      : new Response(new Uint8Array(png), {
          headers: { "content-type": "image/png" },
        }),
  );
}

const news = (markdown: string, coverSourceUrl: string | null) =>
  ({ markdown, coverSourceUrl }) as ParsedNews;

describe("NewsImageCopier", () => {
  it("stores a 16:9 cover and a square thumbnail as WebP", async () => {
    const storage = new InMemoryObjectStorage();
    const copier = new NewsImageCopier(storage, log, fakeFetch());

    const cover = await copier.copyCover(COVER);

    expect(cover).toEqual({
      large16x9Url: expect.stringMatching(
        /^https:\/\/cdn\.test\/news\/[0-9a-f]{32}\/cover-16x9\.webp$/,
      ),
      thumbUrl: expect.stringMatching(/\/thumb\.webp$/),
    });

    const stored = (suffix: string) =>
      [...storage.objects].find(([key]) => key.endsWith(suffix))![1];
    const large = stored("/cover-16x9.webp");
    const thumb = stored("/thumb.webp");

    expect(large.contentType).toBe("image/webp");
    await expect(sharp(large.body).metadata()).resolves.toMatchObject({
      format: "webp",
      width: 1200,
      height: 675,
    });
    await expect(sharp(thumb.body).metadata()).resolves.toMatchObject({
      width: 320,
      height: 320,
    });
  });

  it("does not download images that are already stored", async () => {
    const storage = new InMemoryObjectStorage();
    const fetchFn = fakeFetch();
    const copier = new NewsImageCopier(storage, log, fetchFn);

    await copier.copyInline(INLINE);
    await copier.copyInline(INLINE);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("returns null when the image cannot be fetched or decoded", async () => {
    const storage = new InMemoryObjectStorage();
    const notAnImage = vi.fn<typeof fetch>(
      async () => new Response("<html></html>"),
    );

    await expect(
      new NewsImageCopier(storage, log, fakeFetch([COVER])).copyCover(COVER),
    ).resolves.toBeNull();
    await expect(
      new NewsImageCopier(storage, log, notAnImage).copyInline(INLINE),
    ).resolves.toBeNull();
    expect(storage.objects.size).toBe(0);
  });
});

describe("NewsContentProcessor", () => {
  it("renders HTML with copied images and reports completeness", async () => {
    const processor = new NewsContentProcessor(
      new NewsImageCopier(
        new InMemoryObjectStorage(),
        log,
        fakeFetch([INLINE]),
      ),
    );

    const content = await processor.process(
      news(`Szöveg\n\n![belső](${INLINE})`, COVER),
    );

    expect(content.cover).not.toBeNull();
    expect(content.html).toBe("<p>Szöveg</p>");
    expect(content.complete).toBe(false);
  });

  it("works without object storage", async () => {
    const content = await new NewsContentProcessor(null).process(
      news("Csak szöveg.", null),
    );

    expect(content).toEqual({
      html: "<p>Csak szöveg.</p>",
      cover: null,
      complete: true,
    });
  });
});
