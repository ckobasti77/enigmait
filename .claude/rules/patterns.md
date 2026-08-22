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
- Theme (and language) cookies are functional preferences and persist unconditionally — Consent Mode's `functionality_storage` is granted by default. The `ConsentProvider` banner only gates GA4/Meta Pixel (analytics/marketing), not these.

## "use client"

- Default to `"use client"` for any component using hooks, event handlers, or browser APIs.
- Exceptions: pure layout wrappers, page files with only server-fetched data, constant exports.
- Server-side logic lives only in `app/(pages)/contact/actions.ts` (server action).

## Service Pages

- `page.tsx` is a **server component**: exports `metadata` from `buildServiceMetadata(slug)` and renders `<ServicePageTemplate slug="…" />` plus a plain `<script type="application/ld+json">` from `buildServiceJsonLd(slug)` (never `next/script` — it does not reach the served HTML)
- All visible content comes from `constants/services/` — one file per slug, registry in `index.ts` keyed `Record<DisciplineKey, ServicePageContent>` so the compiler guarantees all six
- The hero's 3D model is the homepage discipline GLB, rendered by `app/(pages)/services/_components/ServiceModelStage.tsx` (reuses `DisciplineModel`, camera, environment and prefetch from `components/sections/disciplines/` — never edit that folder for service-page needs)
- Every user-facing Serbian string in a content file needs an `[en, sr]` pair in `lib/i18n.ts` (grep both sides before adding — neither side may repeat)
- `PageHero` + `FloatingServiceObjects` (procedural primitives) remain only for the `/services` index
