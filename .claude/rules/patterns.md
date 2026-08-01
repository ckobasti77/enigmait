# Code Patterns

## GSAP

- Register plugins at component top: `gsap.registerPlugin(ScrollTrigger)`
- Always wrap in `gsap.context()` and revert on cleanup:
  ```tsx
  const ctx = gsap.context(() => { /* animations */ }, containerRef);
  return () => ctx.revert();
  ```
- Use class selectors (`.timeline-card`, `.hero-text`) to target children within the context ref — avoids stale refs.

## React Three Fiber

- Preload models at module level: `useGLTF.preload("/assets/models/...")`
- Dispose materials created at runtime in `useEffect` cleanup: `material.dispose()`
- Wrap 3D content in `<Suspense fallback={...}>` — never null fallback (causes layout shift)
- Use `<Bounds fit clip observe>` to auto-fit scenes; use raw `window` listeners for global mouse tracking (not R3F events)

## Theme

- Never hardcode colors. Use CSS variables (`--color-primary`, `--text-muted`) or theme-aware utility classes.
- Don't use Tailwind's `dark:` prefix — this project uses a custom `html[data-theme]` system, not Tailwind's built-in dark mode.
- Theme cookie writes are gated on `functional` cookie consent. Don't bypass.

## "use client"

- Default to `"use client"` for any component using hooks, event handlers, or browser APIs.
- Exceptions: pure layout wrappers, page files with only server-fetched data, constant exports.
- Server-side logic lives only in `app/(pages)/contact/actions.ts` (server action).

## Service Pages

- Look up data via `serviceDetails["<slug>"]` from `constants/serviceDetails.ts`
- Open with `<PageHero {...detail} />`
- 3D floating objects per service are configured in `constants/serviceFloatingObjects.ts`
- Embed JSON-LD at the bottom for SEO (`<Script type="application/ld+json">`)
