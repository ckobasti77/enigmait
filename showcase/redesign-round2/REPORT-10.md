# REPORT-10 — Auto-capture screenshotova sajtova (4 veličine) za mockape

Krug 2, korak 10/12. Grana `feat/redesign-round2`.

Snimljeno 2026-08-13T04:10:55.880Z. Playwright, po projektu 4 konteksta (desktop 1920×1620, laptop 1440×1350, tablet 834×1791 hasTouch, mobile 390×1266 isMobile+hasTouch), viewport-only screenshot (gornji ~1.5 ekrana, ne full-page), konvertovano u webp preko ffmpeg-a (kvalitet 72, cap širine 1600/1440/800/400).

## Rezultat po projektu

| projekat | desktop | laptop | tablet | mobile |
|---|---|---|---|---|
| lady-gaga-studio | OK | OK | OK | OK |
| ablux-travel | OK | OK | OK | OK |
| gbmt | OK | OK | OK | OK |
| the-original-way | OK | OK | OK | OK |
| fides-gradnja | OK | OK | OK | OK |
| digist | OK | OK | OK | OK |

Svi sajtovi uslikani bez padova.

## Ukupna težina

`public/mockups/` ukupno: 1038 KB (1.01 MB).

## Manifest

`constants/projectMockups.ts` — `PROJECT_MOCKUPS: Record<string, ProjectMockup>`, generisan ovim
skriptom (`scripts/capture-mockups.mjs`). Korak 11 ga čita za mockup slike po projektu/veličini.
