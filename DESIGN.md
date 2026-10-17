---
name: FIAP Cloud Games
description: Black-and-pink game storefront that serves as the test client for the FCG microservices; inspired by FIAP, square-cornered, system type.
colors:
  accent: "#ed145b"
  accent-fill: "#e01257"
  accent-fill-hover: "#c90e4d"
  accent-ink: "#ff4d85"
  accent-wash: "#1a0710"
  bg: "#000000"
  panel: "#0e0f10"
  panel-2: "#181818"
  line: "#2b2d30"
  line-strong: "#44474c"
  text: "#ffffff"
  muted: "#acc1cc"
  faint: "#7d8f99"
  ok: "#3ecf8e"
  warn: "#f5b94a"
  warn-wash: "#241a07"
  warn-line: "#6b5420"
  danger: "#ff5c7f"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.75rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0.01em"
  section-title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    letterSpacing: "0.2em"
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-sm:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  none: "0px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "72px"
  gutter: "clamp(16px, 4vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-fill-hover}"
    textColor: "{colors.text}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.panel-2}"
  button-sm:
    padding: "0 12px"
    height: "32px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "32px"
  filter-chip-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
  discount-tag:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "3px 7px"
  page-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    width: "40px"
    height: "40px"
  page-button-current:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
  game-card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "12px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  notice:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "16px"
  toast:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    padding: "12px"
    width: "360px"
---

# Design System: FIAP Cloud Games

## Overview

**Creative North Star: "The Night Arcade Ledger"**

A black storefront with one hot pink, ruled into square cells by 1px hairlines. The covers bring the color. The chrome stays black, white and blue-grey so the game art and the pink actions are what you see first. It reads as a game store, but it is a test client: every price, state and limit on screen comes from the gateway, and the system's job is to show those states clearly, not to dress them up.

The identity is inspired by FIAP and starts from the approved mockup (`docs/superpowers/specs/2026-10-16-fcg-frontend-mockup.html`). PRODUCT.md calls it a starting point, so future screens follow it, but it can change when something works better. Density is medium: a fluid grid of 3:4 covers, compact uppercase labels, and generous gaps between sections. Ornament is close to zero. The only decorative device in the chrome is the pink dash in front of section titles.

**Key Characteristics:**
- Pure black ground, near-black panels, 1px grey lines as the main structure.
- One accent hue in two jobs: `accent` as a fill under white text, `accent-ink` as pink text on black.
- Square corners on every surface, control and tag.
- System font stack. Heavy uppercase display, small tracked uppercase labels.
- Authored line icons (24px grid, stroke 2, square caps) and authored SVG covers. No emoji, no icon fonts, no third-party art.

## Colors

A monochrome dark interface with a single saturated pink and three status hues that appear only when there is a status to report.

### Primary
- **FIAP Pink** (`accent`): fills only. Primary buttons, the active genre filter, the current page, discount tags, the section-title dash, the active nav underline, the admin role border, text selection, and the skip link. Text on it is always white.
- **Pink Fill** (`accent-fill`): every pink background that carries white text (buttons, discount tag, active filter and page, count bump, error toast mark). White on it is 4.78:1.
- **Pink Press** (`accent-fill-hover`): hover fill, darker rather than lighter, 5.75:1 under white.
- **Pink Ink** (`accent-ink`): pink used as text or a 1px line on black. Outline buttons, active nav label, links, the focus ring, the focus border on inputs and cards.
- **Pink Wash** (`accent-wash`): very dark pink tint, reserved for pink-tinted backgrounds.

### Neutral
- **Void** (`bg`): page ground, game-card body, mobile nav sheet.
- **Panel** (`panel`): raised surfaces such as the side panel, toasts, notices, inputs, the user menu, and promo cards before the blurred cover backdrop is applied.
- **Panel Step** (`panel-2`): hover fill inside menus and ghost buttons, the cart count at rest, cover backgrounds.
- **Hairline** (`line`): default 1px borders and dividers.
- **Hairline Strong** (`line-strong`): borders on interactive controls (ghost button, input, cart chip, close button), scrollbar thumb.
- **White** (`text`): primary text.
- **Steel** (`muted`): secondary text, labels, inactive nav and chips.
- **Slate** (`faint`): struck-through old prices, placeholders, tertiary icons.

### Status
- **Signal Green** (`ok`): "Grátis" price, the owned ("Na biblioteca") state, the success toast square.
- **Amber** (`warn`, `warn-wash`, `warn-line`): rate-limit and warning notices, and the dev-only mock banner.
- **Alarm Rose** (`danger`): field errors and the error notice icon. It is not the same as the accent: the error toast square uses the accent fill.

### Named Rules
**The Three Pinks Rule.** `accent` (#ed145b) draws lines: section dashes, underlines, highlight borders, the logo dot. `accent-fill` is the background under white text, because white on #ed145b is only 4.33:1. `accent-ink` is pink text on black. Never set small text in `accent` on black. On black, `accent` measures 4.85:1, which is too thin for 11-13px uppercase labels. `accent-ink` measures 6.65:1.

**The Covers Bring the Color Rule.** Chrome stays black, white and blue-grey. Saturated color other than pink comes only from game covers, either directly or through the blurred cover backdrop on promo cards.

## Typography

**Display Font:** system-ui (with Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif)
**Body Font:** same stack
**Label/Mono Font:** same stack. `ui-monospace, Consolas` appears only for inline `code` in the mock banner.

**Character:** A single system family, pinned by PRODUCT.md (no Montserrat or Gotham). Hierarchy comes from weight (400 to 900), uppercase, and tracking, not from a second face. Numbers are tabular everywhere, so prices line up.

### Hierarchy
- **Display** (900, clamp 28-44px, 1.05, -0.01em, uppercase): the lead promotion's game name. One per screen.
- **Headline** (900, 22px, 1.1, uppercase): the game name in the detail panel. Prices beside it are also set at 22px.
- **Section title** (800, 18px, 0.2em tracking, uppercase): page sections ("Em promoção", "Todos os jogos"), always with the pink dash in front.
- **Title** (700, 15px, 1.25): game-card names, clamped to 2 lines. Side and strip promo names use 18px and 15px at 800-900.
- **Body** (400, 15px, 1.5): running text. Descriptions are capped at 52-65ch and set in white at 78-82% opacity.
- **Body small** (13px): notices, toast text, counts, "até dd/mm" dates, menu items.
- **Label** (600-800, 11px, 0.14em, uppercase): buttons, chips, nav, genres, field labels, tabs, role badges.

### Named Rules
**The Tracked Caps Rule.** Every control and metadata label is 11px uppercase with 0.14em tracking. 0.2em is reserved for section titles and the "Mais promoções" strip heading, and 0.3em for the "CLOUD GAMES" wordmark.

**The Pink Dash Rule.** Section titles get a 28x3px `accent` dash before them, with a 12px gap. This is the only decorative mark in the chrome.

## Layout

The content column is centered with a 1320px max width and a fluid gutter (clamp 16-40px). The header is sticky and 64px tall, black at 92% opacity with an 8px backdrop blur. Sections are 72px apart (48px on mobile). Inside a section, blocks are 24px apart.

- **Catalog grid:** `auto-fill` columns at least 176px wide with 16px gaps. Below 640px it switches to exactly 2 columns with 12px gaps. Covers are always 3:4.
- **Promotions:** the lead card and the side column split 1.85fr / 1fr. The lead card is at least 380px tall, with 32px padding and the cover on the right. The side column holds up to two cards. A fourth promotion onward goes into a strip whose cards share the row and scroll horizontally, with snapping, once they would drop below 260px. Below 900px everything stacks. Below 560px the lead cover moves above the text at 56% width.
- **Genre filter:** on desktop it shows "Todos" plus the first 8 genres and a dashed "Mais gêneros (n)" toggle that reveals the rest in place; a selected hidden genre stays visible. Below 640px the toggle hides and the filter becomes a single scrolling row that bleeds to the screen edge and fades out on the right.
- **Header:** below 960px the cart label and wordmark subtitle hide; below 720px the nav collapses into a full-width sheet under a menu button. Below 1080px the user's email hides.
- **Detail panel:** a sheet pinned to the right edge, `min(460px, 100%)` wide. It becomes full screen on mobile.
- **Spacing:** a 4/8 scale (4, 8, 12, 16, 24, 32, 48, 72).

Breakpoints (560, 640, 720, 900, 960, 1080px) are in the sidecar.

## Elevation & Depth

The interface is flat. Depth comes from tone (black ground, `panel` surface, `panel-2` step) and from 1px lines. One shadow, the lift, is used for things that float above the page: the user-menu popover, toasts, and the cover image inside promo cards. The detail panel sits over a 70% black backdrop. Promo cards get their depth from a heavily blurred, darkened copy of the cover behind the content.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.8)`): floating layers and the promo cover only.

### Named Rules
**The Line Before Shadow Rule.** Separate surfaces with a 1px `line` border first. Use the lift shadow only when an element floats above other content.

## Shapes

Every corner is square: `border-radius: 0` on buttons, inputs, cards, chips, tags, toasts, the panel and the pagination. Borders are 1px. State changes the border color (line, then muted or white on hover, then pink on hover for cards and `accent-ink` on focus). The only 2px edges are the active underline on nav and tabs. The empty state uses a 1px dashed `line-strong` border. Colored side stripes are not used anywhere. Icons follow the same geometry: a 24px grid, stroke 2, square caps and miter joins.

## Components

### Buttons
Small, solid and uppercase. They read as controls, not decoration.
- **Shape:** square (0), 1px border in the fill color, 40px tall (32px for small), 16px side padding (12px for small), 11px labels at weight 800. Icons inside are 14px.
- **Primary:** `accent-fill` fill, white label. Hover darkens to `accent-fill-hover`.
- **Outline:** transparent, `accent` border, `accent-ink` label. On hover it fills with `accent` and the label turns white. This is the "+ Carrinho" action on promotions and the detail panel.
- **Ghost:** transparent, `line-strong` border, white label. On hover the fill becomes `panel-2` and the border `muted`. This is the "+ Carrinho" action on catalog grid cards, so pink is not repeated a dozen times on one screen.
- **Disabled:** 50% opacity, `not-allowed` cursor.
- **Focus:** global 2px `accent-ink` outline with a 2px offset.

### Chips
- **Genre filter:** 32px tall, 1px `line` border, `muted` 11px tracked label. On hover the border turns `muted` and the label white. When active (`aria-pressed`), the fill and border are `accent` and the label is white.
- **State chip:** "Na biblioteca" is `ok`-colored text with a check icon and no box. "No carrinho" is a white label in a 1px `line-strong` box that links to the cart.
- **Discount tag:** a solid `accent` block with a white 11px/800 "-X%" label and 0.04em tracking. It sits in the top-left of covers and is larger in the lead promotion and the panel.

### Cards / Containers
- **Game card:** black body, 1px `line` border, a 3:4 cover above a 1px divider, and 12px padding. The name is clamped to 2 lines, followed by the genre label, then price and action pinned to the bottom. The whole card is clickable through the name button's stretched hit area. Hover turns the border `accent` and scales the cover to 1.04. Focus-within uses an `accent-ink` border.
- **Promo card:** `panel` with a blurred cover backdrop. Three sizes: lead, side and strip.
- **Notice:** inline message in `panel` with a 1px `line` border, 16px padding, an 18px icon, a white bold title and muted body text. The warn variant uses an amber wash and border. The error variant uses a `danger` icon.
- **Skeletons:** `panel` to `panel-2` shimmer at 3:4 cover proportions.

### Inputs / Fields
- **Style:** 44px tall, `panel` fill, 1px `line-strong` border, square corners. Labels above use the label style in `muted`.
- **Focus:** the border turns `accent-ink`, plus a 1px `accent-ink` ring and no outline.
- **Error:** `danger` border and a `danger` 13px message below the field.

### Navigation
- **Header:** text wordmark "FIAP." with the dot in `accent` (22px/900) and "CLOUD GAMES" (11px, 0.3em). Nav links are 11px tracked uppercase in `muted`. The active link uses `accent-ink` text with a 2px `accent` underline at the header's bottom edge.
- **Cart chip:** a 36px box with a 1px `line` border, cart icon, label and count square.
- **User menu:** trigger box with a role badge (an `accent` border when the role is admin). The popover is `panel` with the lift shadow.
- **Mobile:** below 720px a menu button opens a black full-width sheet of 48px rows separated by `line` dividers.
- **Tabs (sign-in):** two equal columns with a 2px `accent` underline on the selected tab.
- **Pagination:** 40px square buttons with 1px `line` borders. The current page is filled `accent` with white text. Disabled buttons are at 35% opacity.

### Toast
The toast echoes the simulated notification e-mails. It sits on a `panel` surface with a 1px `line` border and the lift shadow, and is pinned below the header at the top right (max 360px). Tone is shown by a 28px colored icon square: `ok` with a black check, `accent` with a white alert for errors, white for info. There is no colored side stripe. It slides in over 0.35s and fades up and out over 0.2s when dismissed.

### Detail Panel
A modal `dialog` sheet on the right. It has a sticky top bar with a 40px close box, a 3:4 cover capped at 58vh, a headline-sized name, the genre, the price with the end date, the same action as the card, and a description above a 1px divider. It slides in from 48px over 0.42s on `ease-out` and back out over 0.2s on `ease-in`. The backdrop fades to 70% black and back.

### Cart Count Bump (signature motion)
When a game is added, the header count square fills with `accent`, scales to 1.35, and lets out a pink ring over 0.6s. This is the screen's one expressive motion moment. Every other motion is short state feedback: color and border transitions (0.15-0.2s), the panel slide, the toast drop, the 1.04 cover zoom on hover (0.3s), a 0.97 press scale on buttons (0.1s), and skeleton shimmer. `prefers-reduced-motion` reduces all animations and transitions to about 0ms.

### Covers
Authored SVGs in `public/covers/`, 600x800 (3:4), built from flat shapes with a dark gradient fade at the bottom and the title set in heavy uppercase. Games without a cover use a placeholder: a gradient with a faint diagonal band and the game name in 900-weight uppercase, sized to the container.

### Mock Banner (dev only)
A full-width amber strip (`warn-wash` ground, `warn-line` bottom border, `warn` 11px tracked label) that renders only under `npm run dev:mock`. It is not part of the product surface. Never show it in the real build.

## Do's and Don'ts

### Do:
- **Do** put white text on `accent` fills, and use `accent-ink` for any pink text or pink outline on black.
- **Do** keep every corner square and separate surfaces with 1px `line` or `line-strong` borders.
- **Do** set controls and metadata in 11px uppercase with 0.14em tracking, and put the 28x3px pink dash before section titles.
- **Do** draw icons on the 24px grid with stroke 2, square caps and miter joins, inline as SVG with `currentColor`.
- **Do** show status with the status hues (`ok`, `warn`, `danger`) and an icon, and show tone in toasts with the colored icon square.
- **Do** keep covers at 3:4 and treat the cart count bump as the only expressive motion. Honor `prefers-reduced-motion`.

### Don't:
- **Don't** round corners or add pill shapes.
- **Don't** use colored side stripes (left or right border accents) on cards, notices or toasts.
- **Don't** set 11-13px text in `accent` (#ed145b) on black.
- **Don't** use emoji, icon fonts or third-party icon packages. Don't use official FIAP logo files. The wordmark is text.
- **Don't** introduce a webfont or a second family. The system stack is a brand commitment.
- **Don't** add new decorative motion or shadows beyond the lift.
- **Don't** ship the amber mock banner outside `dev:mock`.
