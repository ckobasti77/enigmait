# Styling Conventions

- Dark-first design: components use dark-mode Tailwind classes (`bg-slate-950`, `text-white`, etc.)
- Light mode is handled via CSS overrides in `globals.css` that remap those classes to theme CSS variables
- Theme-aware utility classes: `.app-shell`, `.theme-card`, `.theme-card-muted`, `.theme-overlay`, `.text-theme-primary`, `.text-theme-muted`, `.border-theme`, `.glow-accent`, `.transition-theme`
- Animations use GSAP ScrollTrigger patterns and CSS keyframes
- The `.card-lift` class provides hover translate/shadow transitions

## Site Grid

Every section on the site shares one measure, taken from the hero. Two classes in `globals.css`, always used as a pair:

- `.site-gutter` on the section shell (`<section>`, `<footer>`, `<main>`) — owns the distance to the viewport edge via `--site-edge-gutter`, safe-area aware. Replaces `px-6`.
- `.site-container` on the wrapper inside it — owns the measure via `--site-content-max` (80rem) plus `mx-auto`. Replaces `mx-auto w-full max-w-6xl`.

They are split so a shell can carry a full-bleed background while its content still lines up, and so container elements with their own padding (CTA cards) keep it. Don't reintroduce `px-6` + `max-w-Nxl` on new sections — the navbar uses the same pair, and that alignment is the point.

## Headings

`h1` and `h2` inside `.app-shell` get the Microgramma display face automatically (unlayered rule in `globals.css`, so it beats `font-*` utilities). The face is extended, so it runs ~30% wider than Aeonik at the same size — headings ported from Aeonik usually want one size step down.

Add `data-display-font="off"` to headings that are chrome rather than headlines (nav dropdown rows, consent banner). `.heading-display` applies the same face to a non-heading element.

## Theme System (`app/_components/ThemeProvider.tsx`)

Custom-built, not using next-themes. Supports animated radial-circle transitions between light/dark. Theme is stored in a cookie (`enigma-theme`) only when functional cookies are consented to. Default is dark.

- Uses `html.dark` class + `data-theme` attribute
- CSS overrides in `globals.css` remap dark-mode utility classes (e.g., `bg-black`, `text-white`) to CSS custom properties in light mode using `html[data-theme="light"]` selectors
- Components use `useTheme()` hook from ThemeProvider
