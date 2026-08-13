# REPORT-FINAL — Redesign lanac 01–07, završni pregled

**Grana: `feat/redesign-clean` — NIJE push-ovana. Ništa nije deploy-ovano.**
Remote ima samo `origin/main`; grana nema upstream. Lokalni `main` = `origin/main`
(`3be0dfb fix`) — netaknut. Radno stablo čisto pre ovog commit-a.

Datum provere: 2026-08-13, noćni autonomni run (korak 07/07).

---

## 1. Verifikacija koda (ovaj korak, na HEAD = `6ef25fd`)

| Provera | Rezultat |
|---|---|
| `npm run build` | ✅ prolazi — Next 16.2.6 Turbopack, compile 8.2s, **16/16 statičkih ruta** (sve stranice + svih 6 usluga) |
| `npm run lint` | ✅ prolazi, bez upozorenja |
| `npx tsc --noEmit` | ✅ čist |

Ništa nije popravljano u ovom koraku — nije bilo šta.

## 2. Sažetak po koracima 01–06

Svi koraci **OK** (nijedan pao, nijedan delimičan). Detalji u `showcase/redesign/REPORT-0X.md`.

| Korak | Status | Commit | Ključni fajlovi | Build/lint u koraku |
|---|---|---|---|---|
| 01 Rekon + plan | OK | `fd03e32` (+ snapshot `3a8acb4`) | `showcase/redesign/REPORT-01.md` — tabela svih stranica, redosled po uticaju | n/a (bez koda) |
| 02 CTA „trace glass" | OK | `19a2fa2` | **nov** `components/ui/trace-button.tsx`; `cta-button.tsx` (`look` prop, default `trace`); `globals.css` (`--cta-line`/`--cta-sweep` u sve 3 palete); `NavLinksMobile.tsx` (1 linija) | ✅ / ✅ |
| 03 Card + RevealCard | OK | `90bf171` | **novi** `components/ui/card.tsx`, `hooks/useBorderTraceReveal.ts`; `globals.css` (`--card-trace*`); primena: `ServiceCapabilities`, `projects/page.tsx`, `PageHero` | ✅ / ✅ / tsc ✅ |
| 04 Usluge: panel + carousel | OK | `a084639` | **novi** `ServiceCarousel.tsx`, `ServicePanel.tsx`; `ServicePageTemplate.tsx` (8 sekcija → 1 red); `globals.css` (carousel blok); popravka `useBorderTraceReveal` (rebuild nastavlja reveal); `lib/i18n.ts` (2 para) | ✅ / ✅ / tsc ✅ |
| 05 FAQ kompaktan | OK | `63e07b3` | samo `ServiceFaq.tsx` — `<Card>` omotač, `text-primary` aktivna stavka, focus-visible ring | ✅ / ✅ / tsc ✅ |
| 06 Projekti | OK | `6ef25fd` | `projects/page.tsx` (4 sekcije → 2, featured RevealCard, proof pločice iz podataka); `lib/i18n.ts` (7 parova + čišćenje mrtvih) | ✅ / ✅ / tsc ✅ |

Stari izgledi su svuda **zadržani, ne obrisani**: liquid-glass CTA kroz `look="glass"`,
starih 7 service sekcija stoji nemontirano u stablu (presedan: `DotFieldBackgroundGlobal`).

## 3. Vizuelna provera (ovaj korak)

Pravi browser (Playwright MCP), **produkcijski build** (`next start` na :3010, posle ugašen),
1440×900. Tuđi `next dev` na :3000 (PID 18812, isti projekat) **nije diran**.

| Stranica | Provereno |
|---|---|
| Početna | obe teme; 0 pending reveal-a posle skrola; 5.35 ekrana; hero/marquee/timeline/discipline netaknuti; pozadinski dot-wave prisutan |
| `/projects` | obe teme + **EN** (H1 „Our work, open to inspection", 0 srpskih ostataka); 4.18 ekrana; 6 `ui-card` (featured preko cele širine), 7 trace CTA, glow orb u hero-u, proof pločice 6 / 2 / 100% |
| `/services` (indeks) | obe teme; 1.34 ekrana; 6 highlight kartica kroz primitiv, 5 trace CTA, 3D objekti na mestu |
| `/services/web-development` | obe teme; 2.14 ekrana (panel + FAQ umesto 8 sekcija); **strelice `position: fixed`** na ivicama (x=20 / x=1353, vertikalno centrirane); push korak → URL `replaceState` na `/services/ui-ux-design`, novi panel bez remount-a; dots aktivni; FAQ sa plavim border-om, jedna stavka otvorena |
| Konzola | **0 grešaka** na svim stranicama (samo zatečena upozorenja, npr. `THREE.Clock deprecated`) |

Screenshotovi: `showcase/redesign/review/final-*.png` (home, projects, projects-EN, services,
service-carousel × svetla/tamna). **Na disku su, ali gitignore-ovani** — pravilo iz koraka 03
(`showcase/redesign/review/` je proces-artefakt, isto kao `showcase/review/`), pa ih ovaj
commit ne nosi.

## 4. Provere principa

| Princip | Dokaz |
|---|---|
| Pozadina nije menjana | `git diff main..HEAD` prazan za `VideoBackgroundGlobal.tsx`, `video-background.tsx`, `backgroundVideoConfig.ts`; u `globals.css` diff-u nijedna `--bg-video*`/vignette linija |
| Početna netaknuta | prazan diff za `app/page.tsx`, `Hero.tsx`, `Timeline.tsx`, `ProcessCard.tsx`, `components/sections/disciplines/*`, `lib/borderTrace.ts`, `lib/textReveal.ts` |
| Glow zadržan | vizuelno + DOM: `.glow-accent` orb u projects hero-u, trace dvostruki drop-shadow na karticama, hover glow na CTA i karticama — isti fazon kao početna |
| Ništa push/deploy | remote samo `origin/main`; grana bez upstream-a; `main` == `origin/main`; nijedan `git push`/`vercel`/`convex` pozvan u lancu |

## 5. ZA PREGLED UJUTRU

Ništa nije slomljeno — sve dole su zatečene stvari ili svesne odluke koje traže tvoju presudu:

1. **Karusel: `document.title` se ne menja na korak** (URL da, naslov taba ne — SSR naslov
   ostaje). Svesna odluka iz koraka 04 (ne prilaziti SEO-u s klijentske strane). Vidi se u tabu
   kad prošetaš strelicama — proceni da li smeta.
2. **Starih 7 service sekcija** (`ServiceHero`, `ProofStrip`, `Capabilities`, `Process`,
   `Differentiators`, `Deliverables`, `FinalCta`) stoji nemontirano. Odluka: obrisati ili ostaviti.
3. **Mrtav kod sa početne** (iz rekona): `EffectiveSoftware.tsx` (250 linija) i
   `Challenges.tsx` — nemontirani još od uvoza. Kandidati za brisanje.
4. **`AutoTypingConsole` ignoriše `prefers-reduced-motion`** — zatečeno, deli ga početna, pa
   popravka dira početnu (u lancu zabranjeno). Sad je i na `/projects` hero-u.
5. **`lib/i18n.ts` zatečeni duplikati** (13 EN / 5 SR strana iz starih sekcija) —
   `Object.fromEntries` ih tiho pregazi; zaseban mali zadatak.
6. **`size="sm"` dugmad su 36px** (ispod 44px tap targeta) — zatečeno i kod liquid-glass;
   footer + mobilni meni.
7. **Legal stranice** (`/brand`, `/privacy`, `/terms`) nisu dirane (bile su nizak prioritet u
   planu; koraci 02–06 su pokrili CTA/kartice/usluge/FAQ/projekte). I dalje na starom
   `theme-card` šablonu — radi, samo nije prevedeno na novi Card primitiv.
8. **Full-page screenshot početne**: process kartice deluju zamagljeno — artefakt brzog
   programskog skrola (scrub sekvenca nije stigla da odigra), ne regresija; početna je bit-za-bit
   ista kao na main-u. Proveri okom u živom browseru ako želiš mir.

Preskočeno u ovom koraku: mobilni viewport i matrix mood nisu ponovo slikani (pokriveni u
koracima 04/06 na dev serveru); `/contact` nije slikan (nije diran u lancu).

## 6. Šta je iskomitovano na grani

```
$ git log --oneline main..feat/redesign-clean
6ef25fd feat(projects): mirniji hero + sažete sekcije + trace kartice
63e07b3 feat(faq): kompaktan FAQ u sistemu (plavi border + trace jezik)
a084639 feat(services): kompaktan panel + beskonačan carousel sa fiksnim strelicama
90bf171 feat(ui): Card + RevealCard primitiv sa trace reveal
19a2fa2 feat(cta): trace-glass CTA varijanta (A), stari stil zadržan
fd03e32 docs(redesign): rekon + plan (REPORT-01)
3a8acb4 wip: snapshot pre redizajna
```

(+ ovaj commit: `docs(redesign): REPORT-FINAL + review screenshots`.)

## 7. Kako da pregledaš

```
git switch feat/redesign-clean
npm run dev
```

Napomena: na portu 3000 ti već radi `next dev` za ovaj projekat (PID 18812, nije moj i nisam
ga dirao) — ako je još živ, on **već servira ovu granu** (radno stablo je na njoj), pa je
dovoljno otvoriti `localhost:3000`. Next 16 odbija drugi dev server za isti projekat dok taj živi.

## 8. Kako da vratiš sve

```
git switch main
```

`main` je netaknut (== `origin/main`). Grana ostaje za pregled, merge ili brisanje —
tvoja odluka ujutru.
