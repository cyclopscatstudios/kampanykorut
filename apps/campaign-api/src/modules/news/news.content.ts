import type { NewsCover, NewsImageCopier } from "./news.images";
import type { ParsedNews } from "./news.parse";
import { collectImageSources, renderNewsHtml } from "./news.render";

export interface NewsContent {
  html: string;
  cover: NewsCover | null;
  complete: boolean;
}

export class NewsContentProcessor {
  constructor(private readonly images: NewsImageCopier | null) {}

  async process(news: ParsedNews): Promise<NewsContent> {
    const cover =
      news.coverSourceUrl && this.images
        ? await this.images.copyCover(news.coverSourceUrl)
        : null;

    const sources = collectImageSources(news.markdown);
    const copied = new Map<string, string>();
    for (const source of sources) {
      const url = await this.images?.copyInline(source);
      if (url) copied.set(source, url);
    }

    return {
      html: renderNewsHtml(news.markdown, (src) => copied.get(src) ?? null),
      cover,
      complete:
        (!news.coverSourceUrl || cover !== null) &&
        copied.size === sources.length,
    };
  }
}
