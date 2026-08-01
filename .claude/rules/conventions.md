# Conventions

## TypeScript

- `strict: true` — no implicit any, no unchecked nulls
- Path alias: `@/*` → repo root (e.g. `@/constants/serviceDetails`)
- Types are colocated with their data in `constants/` files, not in a separate `types/` folder

## Utilities

- `clsx` — conditional classnames throughout the codebase
- `class-variance-authority` (CVA) — component variants (see `components/ui/button.tsx`)
- `tailwind-merge` — available but used sparingly; prefer `clsx` for most cases

## Constants

- All static data goes in `constants/` as `.ts` files, never inline in components (except long page-specific arrays like FAQ items which stay in the page file)

## ESLint

- Flat config (`eslint.config.mjs`), extends `next/core-web-vitals` + `next/typescript`
- No custom rules beyond Next.js defaults

## New Files

- New service page → `app/(pages)/services/<slug>/page.tsx` + entry in `constants/serviceDetails.ts` + entry in `constants/serviceFloatingObjects.ts`
- New UI primitive → `components/ui/`
- New app-level component → `app/_components/`
