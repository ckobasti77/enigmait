# CLAUDE.md

Guidance for Claude Code when working in this repository. Detailed rules are in `.claude/rules/`:

- **commands** — dev/build/lint scripts
- **tech-stack** — framework, libraries, tooling
- **architecture** — routing, layout shell, components, constants, server actions, fonts
- **styling** — Tailwind conventions, theme system, utility classes
- **patterns** — GSAP, React Three Fiber, theme, "use client", service page patterns
- **conventions** — TypeScript, utilities (clsx/CVA), constants organization, ESLint, new file placement
- **deployment** — build check + 3-step git push to main

## Non-negotiable

**Text on this site arrives word by word, everywhere, and it is already handled.** Write plain semantic markup for new copy and the site-wide reveal covers it. Never write a text entrance animation of your own — invoke the `text-reveal` skill first, which also covers the `data-reveal="off"` opt-out and what you owe when you use it.
