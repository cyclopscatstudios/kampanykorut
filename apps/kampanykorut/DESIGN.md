---
name: Kampánykörút
description: A Hungarian election campaign simulator played at night in a campaign HQ.
colors:
  hq-navy: "#0f172a"
  panel-ink: "#161e30"
  panel-footer: "#1d2840"
  modal-ink: "#131824"
  campaign-blue: "#3d63c7"
  campaign-blue-lift: "#4a6fd0"
  dialog-rule: "#4462aa"
  modal-rule: "#244185"
  signal-blue: "#60a5fa"
  link-blue: "#60a5fa"
  ice-text: "#eff6ff"
  chalk: "#f8fafc"
  slate-body: "#cbd5e1"
  slate-muted: "#94a3b8"
  slate-disabled: "#64748b"
  secondary-ink: "#1e3a8a"
  results-gold: "#e0a23b"
  gold-ink: "#1a1206"
  newsprint: "#efe6cf"
  press-ink: "#1c1a17"
  press-red: "#8a2a1b"
typography:
  display:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.1px"
  chip:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 800
    letterSpacing: "0.14em"
  newspaper-masthead:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 900
  newspaper-headline:
    fontFamily: "Alfa Slab One, Georgia, serif"
    fontWeight: 400
  newspaper-body:
    fontFamily: "Old Standard TT, Georgia, serif"
    fontWeight: 400
rounded:
  frame: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.campaign-blue}"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.campaign-blue-lift}"
  button-secondary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.secondary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-tertiary:
    backgroundColor: "rgba(148, 163, 184, 0.07)"
    textColor: "{colors.slate-body}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-tertiary-hover:
    backgroundColor: "rgba(148, 163, 184, 0.16)"
  button-hero:
    backgroundColor: "rgba(15, 23, 42, 0.45)"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "50px"
  button-tab-selected:
    backgroundColor: "{colors.campaign-blue}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.lg}"
  button-tab-idle:
    backgroundColor: "rgba(148, 163, 184, 0.05)"
    textColor: "{colors.slate-body}"
    rounded: "{rounded.lg}"
  button-disabled:
    backgroundColor: "rgba(148, 163, 184, 0.08)"
    textColor: "{colors.slate-disabled}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "rgba(96, 165, 250, 0.10)"
    rounded: "{rounded.md}"
  dialog:
    backgroundColor: "{colors.panel-ink}"
    rounded: "{rounded.xl}"
  dialog-footer:
    backgroundColor: "{colors.panel-footer}"
    padding: "12px"
  modal:
    backgroundColor: "{colors.modal-ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  text-input:
    backgroundColor: "#1f2937"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  chip-new:
    backgroundColor: "{colors.results-gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  game-header:
    backgroundColor: "rgba(15, 23, 42, 0.92)"
    height: "60px"
  newspaper-ribbon:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.md}"
---

# Design System: Kampánykörút

## Overview

**Creative North Star: "The Night Campaign HQ"**

Kampánykörút looks like a campaign war room after dark. A full-bleed photograph of the place or the moment sits behind everything, dimmed to half brightness. On top of it floats one deep-navy frame (`hq-navy` at 92% opacity, 1200 × 750 on desktop, edge to edge on phones) that holds the whole game. Inside the frame, everything is screen light: slate text on navy, translucent glass panels drawn with 1px inset hairlines, and one royal campaign blue that marks the action you can take now. Results gold is held back until the count comes in.

The density is that of a working tool, not a poster. Controls are compact (30/40/50px heights), labels are bold Montserrat at small sizes, and panels are separated by hairlines and faint tint, not heavy shadows. Expression comes from the backdrop photography, the map, party colors and the occasional sub-world (the newspaper, the winter season), never from decorating the chrome.

The primary and selected-tab buttons are flat on purpose: no gloss, no blue glow. That choice is written into the theme source and is a standing rejection.

**Key Characteristics:**
- One dark frame over a dimmed photographic backdrop
- One action color (campaign blue); gold only for earned outcomes
- Glass panels: translucent slate fill plus 1px inset hairline
- Montserrat throughout, bold for every control
- Compact, three-step control sizing (30 / 40 / 50px)
- Party colors carry the data; the UI stays blue-slate so they read

## Colors

A cold blue-slate night palette with a single warm exception.

### Primary
- **Campaign Blue** (`campaign-blue`): the primary button and the selected tab. It means "this is the move". `campaign-blue-lift` is its hover state only.
- **Signal Blue** (`signal-blue`): focus rings (2px, offset against `hq-navy`), the 2px rule under the game header, the subtab underline, selected tertiary borders, links (`link-blue`, hover to blue-300).

### Secondary
- **Results Gold** (`results-gold`): outcomes and achievements only: government outcome badges, the winning result on the summary page, chronicle milestones, the "new" campaign chip. Paired with `gold-ink` for text on solid gold, or used as a 2px inset ring over an `amber-400/8` tint with `amber-200` text.

### Neutral
- **HQ Navy** (`hq-navy`): the frame, the game header, the focus-ring offset. Usually applied at 92% over the backdrop.
- **Panel Ink** (`panel-ink`) with **Dialog Rule** (`dialog-rule`) borders: dialogs. **Panel Footer** (`panel-footer`) is the dialog's button tray.
- **Modal Ink** (`modal-ink`) with a 2px **Modal Rule** (`modal-rule`) border: confirmation modals, which sit one layer above dialogs.
- **Chalk** (`chalk`) / **Ice Text** (`ice-text`): primary text on dark, and the light face of the secondary button.
- **Slate Body** (`slate-body`): secondary text and idle controls. **Slate Muted** (`slate-muted`): the most used text color, for metadata, captions and helper copy. **Slate Disabled** (`slate-disabled`): disabled text only.
- **Secondary Ink** (`secondary-ink`): text on the light secondary button.

Party colors come from campaign data, not from this palette, and are shaded by `getPartyColor` during play. They are the only saturated hues allowed in data views.

### Named Rules
**The One Signal Rule.** Campaign blue fills only the primary action and the selected tab. Everything else that is interactive stays glass or light. If two filled blue buttons share a view, one of them is wrong.

**The Earned Gold Rule.** Gold appears only when the player has earned something: a result, an outcome, a milestone, something new. Never on chrome, navigation, or ordinary buttons.

**The Party Colors Own the Data Rule.** Maps, seat bars and vote shares use party colors. UI chrome never borrows a party hue, so no party is visually privileged by the interface.

## Typography

**Display Font:** Montserrat (self-hosted variable 300–700, latin and latin-ext subsets, with system-ui fallback)
**Body Font:** Montserrat
**Newspaper (scoped):** Playfair Display 900 italic (masthead), Alfa Slab One (headlines), Old Standard TT 400/700/italic (body)

**Character:** One geometric sans that does everything. Weight carries the hierarchy: bold for anything clickable or titled, regular for reading, medium for menu labels.

### Hierarchy
- **Display** (700, `text-4xl` → `lg:text-5xl`, tight tracking): menu and screen titles (Heading level 1).
- **Headline** (700, `text-3xl` → `lg:text-4xl`): section titles (level 2); level 3 (`text-2xl` → `lg:text-3xl`) titles modals.
- **Title** (700, `text-xl`–`text-2xl`): panel and card headings (levels 4–5).
- **Body** (400, 16px; 14px in dense panels): question text, explanations, news content.
- **Label** (700, 12 / 14 / 15px by button size, +0.1px tracking): every button and tab.
- **Chip** (800, 9px, 0.14em tracking, uppercase): small status chips such as "new".

`Heading` asks for a `font-display` utility that the theme does not define, so headings currently render in the inherited Montserrat. Add the token or drop the class; don't add a second display face to the core UI.

### Named Rules
**The Bold Controls Rule.** Every button, tab and link is weight 700. Body text never is, except `strong` inside news content.

**The Newsprint Stays in the Paper Rule.** The three serif faces load with the newspaper component and appear nowhere else.

## Layout

- **Frame model:** a fixed 1200 × 750 frame centered on desktop (`md` and up), radius `frame`, `overflow-hidden`. Below `md` the frame fills the viewport and panels become bottom sheets.
- **Game header:** 60px tall, three-column grid (`1fr auto 1fr`), `hq-navy` at 92%, 2px signal-blue bottom rule.
- **Menus:** a centered single column of large (50px) block buttons, 300px wide on phones and 450px from `md`, with 16px between items.
- **Dialogs:** at least 400px wide on desktop, at most 90vw × 85vh, scroll inside. The footer stacks buttons full-width with primary at the bottom on mobile and spreads them apart from `md`.
- **Spacing rhythm:** a 4px base. 8 / 12 / 16 / 20 are the working steps: 12px for headers and footers, 16px for bodies, 20px for modal padding.
- **Breakpoints:** Tailwind defaults; `md` (768px) is the main mobile/desktop switch and `lg` (1024px) only steps headings up.

## Elevation & Depth

Hybrid, and mostly tonal. Depth comes from translucency against the dimmed photo and from 1px inset hairlines (`inset 0 0 0 1px` slate at 14–22%). Drop shadows are reserved for things that float: the frame, hero buttons, dialogs, the newspaper ribbon. The secondary button is the one control with a physical bevel (a top inset highlight and a bottom inset shade), because it is the light object on a dark field.

### Shadow Vocabulary
- **Primary rest** (`0 1px 2px rgba(0,0,0,0.25)`): primary button and selected tab. Hover deepens to `0 2px 6px -1px rgba(0,0,0,0.3)`.
- **Glass hairline** (`inset 0 0 0 1px rgba(148,163,184,0.18), inset 0 1px 0 rgba(255,255,255,0.04)`): tertiary buttons. The hairline rises to 0.32 on hover.
- **Hero float** (`…hairline 0.22…, 0 8px 24px -6px rgba(0,0,0,0.6)`): hero buttons over photography.
- **Secondary bevel** (`inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.45)`).
- **Frame** (`shadow-xl` in black/60): the main game frame.

### Named Rules
**The Hairline Before Shadow Rule.** A surface that sits on the frame gets a 1px inset hairline or a `blue-50/10` border, not a drop shadow. Shadows mean "this floats above the frame".

**The No Glow Rule.** Blue never glows. Primary surfaces get a neutral black shadow only.

## Shapes

Gently rounded, never pill-shaped except for avatars, badges and progress dots (`rounded-full` is common, but only on circles and chips). Controls use 8px (`lg`), cards and inner tiles 6px (`md`), dialogs and modals 12px (`xl`). The outer frame is almost square (2px) so it reads as a screen, not a card. Borders are 1px, except the 2px modal border and the 2px header rule.

## Components

### Buttons
Flat, bold and compact. One component (`@shared/ui/Button`) with eight variants exposed as `data-variant`, which the seasonal skins hook into.
- **Shape:** 8px radius; heights of 30 / 40 / 50px (`sm` / `md` / `lg`), with icon-only versions square at the same sizes.
- **Primary:** campaign blue, chalk text, primary rest shadow; lifts color on hover and nudges down 1px when pressed.
- **Secondary:** a light chalk-to-indigo-50 gradient with secondary-ink text and the bevel shadow. Used for cancel and for the alternate choice in a pair.
- **Tertiary:** the glass button: 7% slate fill, `backdrop-blur-md`, hairline shadow, slate-body text. When selected it gets a `blue-400` border and blue-200 text. It is the default for menu lists.
- **Hero:** navy glass (45%) with `backdrop-blur-lg` and the hero float shadow, for buttons placed directly on photography.
- **Tab / Subtab:** a selected tab is a primary fill; an idle tab is 5% glass. A subtab is text only, with a 2px blue-400 underline offset 10px when selected.
- **Link / Underline:** blue-400 text that lightens to blue-300 on hover, no padding.
- **Focus:** a 2px `signal-blue` ring offset 2px against `hq-navy` on every variant.
- **Disabled:** 8% slate fill, slate-disabled text, faint hairline, `not-allowed` cursor.
- **Motion:** background, box-shadow and transform transitions at 150ms ease-out.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** `bg-blue-400/10`, which reads as a cool tint of the frame.
- **Border:** 1px `blue-50/10`.
- **Shadow Strategy:** none at rest (see Elevation).
- **Hook:** `data-surface="card"` (CommonWrapper, map panel, side panel); a selected answer card gets a blue-300 border.

### Dialogs and Modals
- **Dialog:** panel-ink fill, 1px dialog-rule border, 12px radius, `shadow-xl`, 40% black backdrop. Header has 12px padding, centered text and a bottom rule; body has 16px padding; footer is the panel-footer tray.
- **Modal (confirm):** modal-ink fill, 2px modal-rule border, 20px padding, a 50px blue-900 circle holding a warning icon, a level-3 ice-text heading, then confirm (primary) and cancel (secondary). Sits at `z-60` above dialogs.
- **Bottom sheet:** the mobile form of side panels and dialogs, with a 45% black backdrop that fades in.

### Inputs / Fields
- **Style:** gray-800 fill, 1px gray-600 border, 8px radius, 8 × 12px padding, white text with gray-400 placeholder. Label is 14px medium gray-300.
- **Focus:** the border shifts to blue-500.
- **Error / Disabled:** red-500 border with red-500 helper text; disabled drops to 50% opacity.

### Chips and Badges
- **Badge:** a full pill in a named color at `text-xs`, with an optional check icon.
- **Status tint:** an 8% tint (`amber-400/8`, `green-400/8`, `blue-400/8`) with matching 200-level text, used for outcome and focus states.
- **New chip:** solid results gold, gold-ink text, 9px uppercase extra-bold.

### Navigation
- **Game header:** a three-column bar (left context, centered logo, right actions) with a 2px signal-blue bottom rule. Its slots hold 40px glass pills (`blue-400/10`, `blue-50/10` border, 6px radius).
- **Menus:** stacks of large block tertiary buttons with an icon and a medium-weight ice-text label, plus an optional back button at the end.

### Newspaper (scoped sub-world)
The event announcement is a period newspaper: `newsprint` paper, `press-ink` text, a `press-red` 10px uppercase kicker, Playfair Display masthead, Alfa Slab One headlines and Old Standard TT body. Its entry point is a parchment ribbon that slides in from the left (300ms ease-out) with a soft drop shadow. This sub-world is self-contained and is the only place warm paper tones and serifs appear.

### Winter season (scoped sub-world)
`:root[data-season="winter"]` reskins existing components through their data attributes without changing layout: snowcaps on primary buttons, selected tabs and panel tops; frost corner gradients on glass; icier borders (`#5277bf` on dialogs); a blue color-blend on the backdrop dim; snowfall layers and festive bulbs, all turned off under `prefers-reduced-motion`. New seasonal skins should follow the same pattern: hook `data-*` attributes and never fork components.

## Do's and Don'ts

### Do:
- **Do** build every button with `@shared/ui/Button` and pick a variant; don't hand-roll button styles.
- **Do** put new panels on the glass recipe: translucent slate or blue-400/10 fill, 1px `blue-50/10` border or inset hairline, 6–12px radius.
- **Do** give interactive elements the 2px signal-blue focus ring offset against `hq-navy`.
- **Do** expose `data-variant`, `data-selected`, `data-surface` and `data-panel` on new components so seasonal skins can reach them.
- **Do** use slate-muted for secondary copy and chalk or ice-text for primary copy on dark.
- **Do** respect `prefers-reduced-motion` for any ambient animation.

### Don't:
- **Don't** add gloss, gradients or a blue glow to primary or selected-tab buttons; they are flat on purpose.
- **Don't** use results gold on chrome, navigation or ordinary actions.
- **Don't** use party colors in UI chrome, or UI blue in data that party colors should own.
- **Don't** use the newspaper serifs or parchment tones outside the newspaper.
- **Don't** add a second sans-serif or a display face to the core UI.
- **Don't** put drop shadows on surfaces that sit flat on the frame; use a hairline.
- **Don't** introduce new raw hex panel colors; reuse panel-ink, panel-footer, modal-ink and the rule colors.
