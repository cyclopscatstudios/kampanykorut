# Privacy Notice

_Effective: 25 October 2026_

Kampánykörút is a free, non-commercial election campaign simulator that runs in your browser, developed as a hobby project.

Your privacy matters to us. This notice explains what data we process when you use the game, why we need it, and what choices you have regarding your data.

## Who is responsible for your data?

Kampánykörút is an independent hobby project published under the Cyclops Cat Studios project name. Cyclops Cat Studios is not a separate legal entity.

**Controller:** Bekó Dániel

**Project:** Cyclops Cat Studios

**Contact:** hello@kampanykorut.hu

You can send any questions or requests about data processing to this email address.

## What data do we collect?

You can play without registering or creating an account. We do not ask for your name, and you do not need to provide your email address to play.

To improve the game, find errors and handle voluntary bug reports, we do process some technical and usage data.

We do not use advertising trackers, and we do not sell player data.

## Serving the website

The game, its backend service and the bug report database (MongoDB) run in Docker containers on a self-managed virtual server.

**Hosting provider:** Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany (https://www.hetzner.com/)

**Location:** Germany, European Union.

Detailed visitor (HTTP access) logging is not enabled in the HTTPS proxy (Caddy) in front of the server. The system journal (systemd journal), which contains technical system messages, is kept for a maximum of 30 days and limited to 500 MB.

Even so, serving the website technically requires processing connection data, including your IP address. The containers that serve the game and run the backend service may also keep their own technical logs; the backend log may include your IP address for requests sent to it (for example loading news or submitting a bug report). The 30-day limit of the system journal does not apply to these logs; we use them only for operating the service and troubleshooting.

Fonts and all other game files are served from our own server; we do not use an external font service.

**Legal basis:** our legitimate interest in operating the website securely (GDPR Article 6(1)(f)).

## Anonymous usage statistics

We use PostHog to understand how the game is used and where players run into difficulties.

Usage statistics are **enabled by default**: they start automatically when the game loads, and we do not ask for separate consent. You can turn them off in Settings at any time (see below).

The events we send may cover, for example:

- Which campaign and playable side you chose.
- Whether the campaign started and loaded correctly.
- How many turns you played and whether you finished the game.
- The outcome of the game: win, loss or deadlock.
- How long loading took.
- Whether saving failed.
- Which version of the game you used.

PostHog automatically adds the browser and operating system type, the browser identification string (user agent), the device type, the screen size, the time zone, the browser language, the address of the open page, the previous page (referrer) and the page title. We remove the game session identifier from page addresses before sending.

The usage statistics do not record your specific answers to the questions.

**What we do not use:** cookies, a lasting statistics identifier stored in your browser, session replay, automatic click capture, surveys, feature flags or remote configuration. The random identifier that links these events is created only for the current page load, in your browser's memory; reloading the page creates a new one. The statistics do not read the saved games stored in your browser. We do not build a lasting player profile.

**IP address:** because of the network connection, your IP address technically reaches PostHog, but we have configured the service not to store it with the events.

**Purpose:** understanding how the game is used, identifying problems and improving the game.

**Provider:** PostHog, European Union data processing region.

**Retention:** according to the PostHog project's data retention settings; we intend to keep events for no longer than 12 months.

**Legal basis:** our legitimate interest in developing the game (GDPR Article 6(1)(f)). You can object at any time by turning the statistics off or by writing to the email address above.

### How can you turn it off?

You can turn off "Send anonymous usage statistics" in Settings at any time.

After you turn it off, the game stops sending usage statistics from this browser, and from the next page load it no longer starts PostHog at all, so it does not connect to it. Your choice is stored in your browser's local storage (PostHog also places an entry there recording the opt-out) so you do not have to set it again each time. If you turn it back on later, the statistics start again.

Turning it off does not automatically delete statistics events that were already sent.

## Automatic error tracking

We use Sentry to detect and fix software errors.

When an error occurs, the following technical information may be sent:

- The error message and the related technical stack trace.
- Characteristics of your browser and operating system.
- The game version and the address of the affected page.
- Technical events leading up to the error.

In addition, we send performance data, such as page load times, from a small share (about 20%) of sessions even when no error occurs.

Before sending, we automatically remove your in-game decisions (the selected side, your answers and the district you visited) and the game session identifier from error reports and performance data.

**Purpose:** detecting, investigating and fixing software errors.

**Provider:** Sentry (Functional Software, Inc.), free Developer plan.

**Location:** European Union (Frankfurt, Germany).

**Legal basis:** the operator's legitimate interest in the secure and proper operation of the game (GDPR Article 6(1)(f)).

**Retention:** 30 days.

Error tracking works independently of the usage statistics setting.

## Voluntary bug reports

If you use the game's bug report form, your report may be turned into a GitHub Issue in the project's public GitHub repository.

The public issue may contain the title, description and reproduction steps of your report, together with related technical data such as the campaign, browser type, page address and game version.

**Anyone can read GitHub issues.** Please do not include personal or confidential information in your description.

We also store the report in a database running on our own server. If you provide your email address, it is not published on GitHub: we use it only to contact you about your report and to send status updates. Notification emails are sent through Google's Gmail service. You can unsubscribe from status updates at any time; your email address is then deleted immediately.

To prevent abuse and automated submissions, we use Cloudflare Turnstile, which may send technical data to Cloudflare. For the same purpose, we store a salted one-way fingerprint (hash) of your IP address with the report; we do not store the IP address itself for this purpose.

**Legal basis:** our legitimate interest in handling reports and preventing abuse (GDPR Article 6(1)(f)); for email notifications, your consent (GDPR Article 6(1)(a)), which you can withdraw at any time by unsubscribing.

**Retention:** reports, including your email address and IP fingerprint, are automatically deleted from our own database 12 months after submission. Public GitHub issues may remain as part of the project's documentation.

## Data stored in your browser

Saved games and game settings are stored in your browser's local storage.

They let you continue playing later and keep the settings you chose.

Saved games are not automatically sent to our server and are not stored in a central player account.

You can remove local data by clearing your browser's site data. Doing so may also delete your saved games.

## External providers

We use the following external services to run the game:

| Service              | Purpose                                   | Location                       |
| -------------------- | ----------------------------------------- | ------------------------------ |
| Hetzner Online GmbH  | Website, backend and database hosting     | Germany, EU                    |
| PostHog              | Usage statistics                          | EU                             |
| Sentry               | Error and performance monitoring          | EU (Frankfurt)                 |
| GitHub               | Public bug reports                        | United States / international  |
| Google (Gmail)       | Bug report notification emails            | Global, may be outside the EEA |
| Cloudflare Turnstile | Filtering automated submissions and abuse | Global                         |

GitHub, Google and Cloudflare may process data outside the European Economic Area. In such cases, the providers apply the safeguards set out in their own privacy terms (these differ by provider, for example the EU–US Data Privacy Framework or the European Commission's standard contractual clauses). For Gmail, we cannot guarantee that data stays exclusively within the European Union.

## What are your rights?

Under the conditions set out in the GDPR, you can request:

- Information about the processing and access to your data.
- Correction of inaccurate data.
- Erasure of your data or restriction of its processing.
- You can object to processing based on legitimate interest.
- Where applicable, you can exercise your right to data portability.

You can send your request to hello@kampanykorut.hu.

Because we do not use registration-based user identifiers, we may not be able to link certain statistics events to a specific person. If identification is not possible, we may not be able to fulfil an individual lookup or erasure request.

If you believe that the processing of your data violates your rights, you can lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information: https://www.naih.hu

## Changes to this notice

Data processing may change as the game evolves. We will announce significant changes by updating this notice and, where necessary, by separate notification.

The current version is always available on the Kampánykörút website.
