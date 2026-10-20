import { escapeHtml } from "../news/news.html";

export const BUG_REPORTS_PATH = "/api/v1/bug-reports";

export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

export const confirmPath = (token: string) =>
  `${BUG_REPORTS_PATH}/confirm/${token}`;
export const unsubscribePath = (token: string) =>
  `${BUG_REPORTS_PATH}/unsubscribe/${token}`;

function htmlMail(paragraphs: string[], footer: string): string {
  return `<!doctype html>
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.6">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px">
<p style="margin:0 0 16px;font-weight:800;font-size:18px">Kampány<span style="color:#3b65d4">körút</span></p>
${paragraphs.join("\n")}
<p style="margin:24px 0 0;font-size:12px;color:#64748b">${footer}</p>
</div>
</body>
</html>`;
}

const button = (url: string, label: string) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#3b65d4;color:#ffffff;font-weight:700;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">${escapeHtml(label)}</a></p>`;

export function confirmMail({
  title,
  confirmUrl,
}: {
  title: string;
  confirmUrl: string;
}): MailContent {
  const ignore =
    "Ha nem te küldted ezt a bejelentést, hagyd figyelmen kívül ezt a levelet, ezután nem kapsz tőlünk több levelet.";

  return {
    subject: `Megkaptuk a hibabejelentésedet: ${title}`,
    text: [
      `Megkaptuk a hibabejelentésedet: ${title}`,
      "",
      "Ha szeretnél értesítést kapni, amikor kijavítottuk, nyisd meg ezt a linket, és kattints a „Kérek értesítést” gombra:",
      confirmUrl,
      "",
      ignore,
    ].join("\n"),
    html: htmlMail(
      [
        `<p style="margin:0 0 12px">Megkaptuk a hibabejelentésedet: <strong>${escapeHtml(title)}</strong></p>`,
        '<p style="margin:0">Ha szeretnél értesítést kapni, amikor kijavítottuk, kattints ide:</p>',
        button(confirmUrl, "Kérek értesítést"),
      ],
      escapeHtml(ignore),
    ),
  };
}

export function fixedMail({
  title,
  siteUrl,
  unsubscribeUrl,
}: {
  title: string;
  siteUrl: string;
  unsubscribeUrl: string;
}): MailContent {
  const footer =
    "Ezt a levelet azért kaptad, mert értesítést kértél a hibabejelentésed javításáról. Több levelet erről a bejelentésről nem küldünk.";

  return {
    subject: `Kijavítottuk a bejelentett hibát: ${title}`,
    text: [
      `Kijavítottuk a bejelentett hibát: ${title}`,
      "",
      "Köszönjük, hogy szóltál! A javítás a játék következő frissítésével érkezik.",
      `Játék: ${siteUrl}`,
      "",
      footer,
      `Leiratkozás: ${unsubscribeUrl}`,
    ].join("\n"),
    html: htmlMail(
      [
        `<p style="margin:0 0 12px">Kijavítottuk a bejelentett hibát: <strong>${escapeHtml(title)}</strong></p>`,
        '<p style="margin:0">Köszönjük, hogy szóltál! A javítás a játék következő frissítésével érkezik.</p>',
        button(siteUrl, "Irány a játék"),
      ],
      `${escapeHtml(footer)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:#64748b">Leiratkozás</a>`,
    ),
  };
}
