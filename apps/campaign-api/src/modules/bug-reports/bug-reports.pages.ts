import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply } from "fastify";
import { Type } from "typebox";
import { escapeHtml } from "../news/news.html";
import type { BugReportRecord } from "./bug-reports.repository";
import type { BugReportService } from "./bug-reports.service";
import { confirmPath, unsubscribePath } from "./bug-reports.templates";

const FORM_BODY_LIMIT_BYTES = 4096;

const TokenParams = Type.Object({
  token: Type.String({ pattern: "^[A-Za-z0-9_-]{43}$" }),
});

const STYLES = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#e2e8f0;font-family:Montserrat,system-ui,sans-serif;line-height:1.6;padding:1.5rem}
main{max-width:32rem;width:100%;border:1px solid rgba(148,163,184,.2);border-radius:8px;background:rgba(148,163,184,.05);padding:2rem}
.brand{display:block;margin-bottom:1.5rem;color:#fff;font-weight:800;font-size:1.1rem;text-decoration:none}.brand b{color:#3b65d4}
h1{margin:0 0 .75rem;font-size:1.5rem;line-height:1.25;color:#fff}
p{margin:0 0 1rem;color:#cbd5e1}
button,.link{display:inline-block;border:0;cursor:pointer;background:#3b65d4;color:#fff;font:inherit;font-weight:700;padding:.65rem 1.1rem;border-radius:6px;text-decoration:none}
button:hover,.link:hover{background:#2952c8}
`;

interface Page {
  title: string;
  paragraphs: string[];
  action?: { url: string; label: string };
  link?: { url: string; label: string };
}

function renderPage({ title, paragraphs, action, link }: Page): string {
  return `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} – Kampánykörút</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>${STYLES}</style>
</head>
<body>
<main>
<a class="brand" href="/">Kampány<b>körút</b></a>
<h1>${escapeHtml(title)}</h1>
${paragraphs.map((p) => `<p>${p}</p>`).join("\n")}
${action ? `<form method="post" action="${escapeHtml(action.url)}"><button type="submit">${escapeHtml(action.label)}</button></form>` : ""}
${link ? `<a class="link" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>` : ""}
</main>
</body>
</html>`;
}

function sendPage(reply: FastifyReply, page: Page, status = 200) {
  return reply
    .status(status)
    .header("cache-control", "no-store")
    .header("referrer-policy", "no-referrer")
    .header("x-robots-tag", "noindex")
    .type("text/html; charset=utf-8")
    .send(renderPage(page));
}

const quotedTitle = (report: BugReportRecord) =>
  `<strong>${escapeHtml(report.title)}</strong>`;

const INVALID_LINK: Page = {
  title: "Érvénytelen vagy lejárt link",
  paragraphs: [
    "Ez a link nem érvényes, vagy már lejárt. Ha új értesítést szeretnél, küldd be újra a hibát a játékból.",
  ],
  link: { url: "/", label: "Vissza a játékhoz" },
};

const isConfirmable = (report: BugReportRecord | null, now: Date) =>
  report !== null &&
  report.email !== null &&
  report.confirmExpiresAt !== null &&
  report.confirmExpiresAt > now;

export function bugReportPages(
  service: BugReportService,
  { now = () => new Date() }: { now?: () => Date } = {},
): FastifyPluginAsyncTypebox {
  return async (app) => {
    app.addContentTypeParser(
      ["application/x-www-form-urlencoded", "multipart/form-data"],
      { parseAs: "string", bodyLimit: FORM_BODY_LIMIT_BYTES },
      (_request, _body, done) => done(null, {}),
    );

    const routeOptions = {
      schema: { hide: true, params: TokenParams },
    };

    app.get(confirmPath(":token"), routeOptions, async (request, reply) => {
      const report = await service.findConfirmable(request.params.token);
      if (!report || !isConfirmable(report, now())) {
        return sendPage(reply, INVALID_LINK, 404);
      }
      if (report.confirmedAt) {
        return sendPage(reply, {
          title: "Már kértél értesítést",
          paragraphs: [
            `Szólunk, ha kijavítottuk ezt a hibát: ${quotedTitle(report)}`,
          ],
          link: { url: "/", label: "Vissza a játékhoz" },
        });
      }
      return sendPage(reply, {
        title: "Kérsz értesítést a javításról?",
        paragraphs: [
          `A bejelentett hiba: ${quotedTitle(report)}`,
          "Ha kijavítottuk, egyetlen levelet küldünk erre a címre, utána töröljük.",
        ],
        action: {
          url: confirmPath(request.params.token),
          label: "Kérek értesítést",
        },
      });
    });

    app.post(confirmPath(":token"), routeOptions, async (request, reply) => {
      const report = await service.confirm(request.params.token);
      if (!report) return sendPage(reply, INVALID_LINK, 404);

      return sendPage(reply, {
        title: "Megerősítve",
        paragraphs: [
          `Köszönjük! Szólunk, ha kijavítottuk ezt a hibát: ${quotedTitle(report)}`,
        ],
        link: { url: "/", label: "Vissza a játékhoz" },
      });
    });

    app.get(unsubscribePath(":token"), routeOptions, async (request, reply) => {
      const report = await service.findUnsubscribable(request.params.token);
      if (!report) return sendPage(reply, INVALID_LINK, 404);

      return sendPage(reply, {
        title: "Leiratkozás",
        paragraphs: [
          "Ha leiratkozol, azonnal töröljük az email címedet, és erről a bejelentésről nem kapsz több levelet.",
        ],
        action: {
          url: unsubscribePath(request.params.token),
          label: "Leiratkozom",
        },
      });
    });

    app.post(
      unsubscribePath(":token"),
      routeOptions,
      async (request, reply) => {
        const report = await service.unsubscribe(request.params.token);
        if (!report) return sendPage(reply, INVALID_LINK, 404);

        return sendPage(reply, {
          title: "Leiratkoztál",
          paragraphs: [
            "Töröltük az email címedet, erről a bejelentésről nem kapsz több levelet.",
          ],
          link: { url: "/", label: "Vissza a játékhoz" },
        });
      },
    );
  };
}
