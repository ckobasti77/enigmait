# Architecture

## Routing (`app/`)

Next.js App Router. Pages live under `app/(pages)/` using a route group so they share the root layout without adding a URL segment. Each service has its own page under `app/(pages)/services/<service-slug>/page.tsx`.

Service slugs: `web-development`, `ui-ux-design`, `mobile-app-development`, `seo-geo`, `branding`, `social-media`.

## Layout Shell (`app/layout.tsx`)

The root layout wraps everything in:
1. `CookieConsentProvider` - manages cookie consent state
2. `ThemeProvider` - custom light/dark theme system (not next-themes)
3. `div.app-shell` - contains `VideoBackgroundGlobal` (fixed z-0) and content layer (z-10)

The content layer (`z-10`) holds Navbar, page content, Footer, and ScrollToTopButton.

## Background System (`app/_components/VideoBackgroundGlobal.tsx`)

Fixed full-screen looping video (`public/background.webm`), rendered by `components/ui/video-background.tsx`. Two layers inside one isolated stacking context: media (poster + `<video>`) and vignette.

**Blending is load-bearing, not decoration.** The clip is bright dot-waves on pure black, so the media layer uses `mix-blend-mode: screen` over an opaque `--background` — the black keys out and only the waves survive, which is why the dark video never becomes a black slab that breaks light mode. Light mode inverts the clip (`filter: invert(1) hue-rotate(180deg)`) into dark dots on white and switches to `multiply`: same mechanism, opposite direction. `.bg-video-layer` therefore needs BOTH `isolation: isolate` and an opaque background-color — a blend with no backdrop in its own stacking context either does nothing or leaks onto page content.

`--bg-video-opacity` is the dimmer. That is the knob to turn when the background feels too loud — not the vignette, which only exists to hold edge contrast for text.

All colours/strength live in CSS variables (`--bg-video-blend`, `--bg-video-filter`, `--bg-video-opacity`, `--bg-video-vignette`) defined in all three palettes, so theme changes need no JS. Everything JS must know is in `constants/backgroundVideoConfig.ts`.

Loading is deliberately late: `preload="none"`, then src attached after `window.load` + an idle callback, so 3 MB of background never competes with LCP. The poster (frame 0, ~54 KB WebP) is a `background-image` on the media layer rather than the `poster` attribute, so it paints without a src and does not depend on per-browser poster quirks. Source is chosen once at mount by viewport width — `background-mobile.webm` (960×540, ~0.5 MB) under `mobileMaxWidth` — not via `<source media>`, which browsers do not re-evaluate reliably. Playback pauses on `visibilitychange`, retries on first gesture if autoplay is refused, and under `usePrefersReducedMotion()` (which also covers Save-Data and low battery) no video is requested at all — the poster is the whole background.

A small counter-parallax on the media layer is the only interaction, driven by one rAF that stops as soon as the cursor settles and never starts on coarse pointers. It is transform-only, so per-frame cost is compositing, never layout or paint. Deliberately nothing tracks the cursor position visually — an earlier cursor-following gradient was removed as noise; the background moves, it does not draw a second pointer.

## Previous Background (`app/_components/DotFieldBackgroundGlobal.tsx`, unused)

Kept in the tree but no longer mounted. Fixed full-screen canvas dot field (`components/ui/dot-field-background.tsx`), a re-creation of `public/assets/background.avif`. A fine lattice of small horizontal ellipses sits at rest; around the cursor an irregular "growth" forms where dots get wider and shift from the base hue to the accent. Listens to `window` pointermove so it tracks the cursor regardless of `pointer-events` settings. An overlay div on top mutes the intensity.

The trail behaves like **drawing**, not like a decaying blur: every dot stores the timestamp of its last touch, so a stroke holds unchanged for `holdMs` and then erases oldest-end-first over `fadeMs`. A single shared decay factor cannot express that ordering — don't replace the stamp/power pair with one heat buffer.

The lattice is anisotropic: `gap` is the vertical pitch and horizontal pitch is `gap * dotAspect`, so dot and cell share an aspect and the field stays evenly spaced. Keep `glowRadius` near `0.28 * gap` — that ratio is measured off the reference and is what leaves dark gaps between hot dots instead of letting them merge into a wash. Set `dotAspect: 1` for the round dots the reference actually has.

All tuning lives in `constants/dotFieldConfig.ts`. `DOT_FIELD.interaction` is the switch: `"pointer"` drives it from the mouse on precise-pointer devices and falls back to a self-drifting virtual cursor on touch; `"auto"` uses that drift everywhere, so desktop behaves exactly like mobile.

Colours come from CSS variables (`--field-dot`, `--field-accent`, `--field-core`, `--field-overlay`, `--field-blend`, `--field-rest`) defined in all three palettes, so light mode inverts to ink dots on paper and `data-mood="alt"` goes green. The component reads them via `getComputedStyle` and watches `<html>` with a MutationObserver rather than `useTheme()`/`useMood()`, because it mounts outside `MoodProvider`.

Cost per frame is one blit of a pre-rendered static base layer plus a few hundred `drawImage` calls for the live dots. The loop stops entirely when the field has decayed and the cursor is parked, and never starts under `usePrefersReducedMotion()`.

## Text Reveal (`lib/textReveal.ts`, `app/_components/TextRevealGlobal.tsx`)

Every line of copy on the site arrives word by word, in random order, blurred and lifted - the hero's entrance applied site-wide. It is one controller, not a component per section: the copy belongs to a dozen different files and to whatever page gets added next, so the reveal finds it instead of being wrapped around it. `TextRevealGlobal` mounts once in the shell and renders nothing. **`.claude/skills/text-reveal` is the working brief** - read it before writing any text entrance.

"Every line" includes text with no tag to its name: `candidateSelector` covers the block copy (`h1`-`h6`, `p`, `li`, `dt`, `dd`, `blockquote`, `figcaption`) *and* any `span` that is not sitting inside one of them, a link, a button or a label - the eyebrows, kickers and stat captions the pages are full of. Without that second half "everywhere" quietly meant "everywhere with a tag". A bare `<div>` holding text still needs `data-reveal="text"`, or better, a real tag.

Copy is split on the way in, not up front - a legal page is thousands of words, and wrapping all of them at mount buys a long frame for text nobody may scroll to. Past `maxWords` (60) a block fades as one piece instead; a 200-word paragraph split into blurred layers is cost with no effect. A line inside a flex or grid box takes the same fallback for a different reason: word spans are children, so every `gap` and alignment rule in that box would land between the words. Words are wrapped by **moving** the original text node, never cloning it: only text nodes change, so `<a>` and `<strong>` keep their identity and React keeps its handles on them.

The trigger is one `IntersectionObserver` (not ScrollTrigger - there are hundreds of targets and none of them need scrub or refresh) with the root shrunk from the bottom by `enterRatio`, so copy starts once it is 15% into the viewport rather than the instant it clips the fold. The last screenful can never travel that far, so a scroll listener flushes whatever is still pending at the document end - without it the footer's last lines stay invisible forever.

**Hiding is CSS, revealing is JS, and both read the same selectors.** `constants/textRevealConfig.ts` owns `candidateSelector`/`skipSelector` and compiles them into the stylesheet the root layout inlines, so the rule that hides copy before first paint and the controller that brings it back can never drift - anything hidden is guaranteed to have an owner. The rule only applies while an inline script has armed `<html>`, and a watchdog disarms it if the controller never mounts, so a client without JS (or with a broken bundle) gets plain visible text.

Opt out with `data-reveal="off"` on any subtree. The hero, the typed console headline, the process cards and the discipline panels already do - each owns the opacity of its own copy - and navigation, forms, live regions and dialogs are chrome that has to be readable the instant it appears.

**Opting out buys the timing, not the effect.** Copy that leaves the site-wide pass still arrives word by word; it just arrives on its own clock, because the controller reveals an element once and is then finished with it, while a discipline panel has new copy on every step. Those components call `splitWords`/`restoreWords` from this same file rather than rolling a splitter, so the contract with `LanguageProvider` holds everywhere. `DisciplineCopy.tsx` is the reference: kicker, title and lede each word by word, separated by stagger width and blur depth rather than by kind, and only the CTA left as a block - a control that assembles itself out of words reads as copy.

Split elements carry `data-no-translate` while they are split, because `LanguageProvider` translates whole text nodes and one word per node would have it looking up dictionary entries mid-sentence. On a language switch the controller hands every element its original text node back *before* the walker runs - that is why it must mount inside `LanguageProvider`, where React runs the child effect first.

## Process Run (`app/_components/Timeline.tsx`, `ProcessCard.tsx`, `lib/borderTrace.ts`)

Five phase cards threaded onto one vertical spine. `Timeline` owns the section and the scrubbed spine fill; everything else belongs to the card, because the sequence is per-card.

Timing is two constants in `ProcessCard`, and both exist because the obvious values read wrong. `TRIGGER_START` fires at the card's centre a third up from the bottom edge, not at dead centre - the unlock has to run *while* the card travels into view, or the reader is already past it by the time it finishes. `SEQUENCE_SPEED` is a `timeScale` on the whole chain rather than shorter durations on each step, so speeding it up cannot drift the overlaps apart. Together the run lands in ~0.9s.

The unlock is one chain and it only reads if the geometry lines up: a node lands on the spine, a connector grows from it to the card's near edge, and on contact **two streaks split off and run the border in opposite directions**, meeting at the point opposite the entry, where they vanish. The card - blur, image, copy, icon - comes up inside that trace.

The two halves must arrive together, so the entry is always an **edge midpoint**: a rounded rectangle is symmetric about both midlines, so splitting there splits the perimeter in half by construction. Move the entry to a corner and the halves desync. `buildBorderTracePaths` is the geometry; paths carry `pathLength={TRACE_LENGTH}` (1000, not 1 - GSAP rounds what it writes, and a `0.17` dash offset reaches the DOM as `0px`), so the streak is a travelling dash and needs no measuring.

Three couplings are load-bearing and live in two files each:

- `--process-card-w` (CSS) fixes the card width above `lg`, and the connector spans from that width to the centre line. Change one without the other and the line stops touching the card.
- `--process-card-radius` (CSS) and `CARD_RADIUS` (ProcessCard) must match, or the streak cuts across the corner it is meant to follow.
- The `lg` breakpoint decides both the card's side and its entry edge. Below it every card straddles the spine and the connector drops in from above.

The trace is measured off the shell's **border box**, not its content box - it is drawn *on* the border, and two pixels of difference push a 1px stroke off the corner. It also sits outside `.process-card-veil`, so the streak stays sharp while the card behind it is still blurred. For the same reason the shell carries no `backdrop-filter`: the veil animates `filter`, which makes it a backdrop root, and the glass would sample nothing for the whole reveal.

Copy is split with `splitWords`/`restoreWords` from `lib/textReveal.ts` rather than a local splitter, so the `LanguageProvider` contract holds - move the text node, carry `data-no-translate` while split, hand it back before the translation walker runs. The card opts out of the site-wide pass with `data-reveal="off"` because it reveals its copy on its own clock.

Per-phase colour is a pair of CSS variables (`--card-accent` / `--card-glow`) set on the row from `constants/processSteps.ts`; the ramp itself is defined per palette in `globals.css`, so light mode and the alt mood re-tune without the component knowing.

## Shared Components

- `app/_components/` - App-level components (Hero, Timeline, Footer, Navbar, PageHero, etc.)
- `components/ui/` - Reusable UI primitives (button, cta-button, auto-typing-console, wave-background)
- `components/EnigmaLogo.tsx` - SVG logo component

## Constants (`constants/`)

Static data separated from components: nav links, service details, process steps, challenges, legal content (terms, privacy, brand guidelines), and 3D floating object configs.

## Server Actions (`app/(pages)/contact/actions.ts`)

Contact form uses a Next.js server action with nodemailer. Requires env vars: `CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASS`, `CONTACT_EMAIL_FROM`. Optional: `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM_NAME`.

## Fonts

Four local fonts loaded in root layout via `next/font/local`:
- `--font-deltha` (display)
- `--font-terminal` (terminal-grotesque)
- `--font-aeonik` (body, default via `font-aeonik`)
- `--font-broken-console` (monospace accent)
