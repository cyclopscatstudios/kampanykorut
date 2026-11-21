import { useEffect } from "react";
import {
  buildMetaEntries,
  type MetaEntry,
  type PageMeta,
} from "./campaignPage.data";

function findOrCreate(entry: MetaEntry): HTMLElement {
  const selector =
    entry.kind === "canonical"
      ? 'link[rel="canonical"]'
      : `meta[${entry.attr}="${entry.key}"]`;
  const existing = document.head.querySelector<HTMLElement>(selector);
  if (existing) return existing;
  const el = document.createElement(
    entry.kind === "canonical" ? "link" : "meta",
  );
  if (entry.kind === "canonical") el.setAttribute("rel", "canonical");
  else el.setAttribute(entry.attr, entry.key);
  document.head.appendChild(el);
  return el;
}

export function useDocumentMeta(meta: PageMeta | null) {
  useEffect(() => {
    if (!meta) return;
    const previousTitle = document.title;
    const restore = buildMetaEntries(meta, window.location.origin).map(
      (entry) => {
        const el = findOrCreate(entry);
        const attr = entry.kind === "canonical" ? "href" : "content";
        const previous = el.getAttribute(attr);
        el.setAttribute(
          attr,
          entry.kind === "canonical" ? entry.href : entry.content,
        );
        return () => {
          if (previous === null) el.remove();
          else el.setAttribute(attr, previous);
        };
      },
    );
    document.title = meta.title;
    return () => {
      document.title = previousTitle;
      restore.forEach((fn) => fn());
    };
  }, [meta]);
}
