# REPORT-02 — CTA puls + ujednačen radius + nav/switcher u CTA jeziku + vidljiviji ghost

Grana `feat/redesign-round2`. Lokalno, bez push-a i bez deploy-a. Pozadina netaknuta, glow ostaje.

---

## 1. CTA — stalni lagani puls (`.trace-cta--primary::after`)

Primarni trace CTA **diše u miru**: rim i njegov halo narastu i splasnu jednom u
`--cta-pulse-duration` (3.2s, `ease-in-out infinite`). Nije sweep i nije brzo — animira se
**samo `opacity`** sloja koji ne crta ništa osim senke, pa je ciklus kompozitni, bez layout-a i
bez repaint-a dugmeta ispod.

Zašto `::after` a ne animacija na samom dugmetu: `box-shadow` na elementu **je hover stanje**.
Animacija u toku pobeđuje normalnu deklaraciju, pa bi animiranje `box-shadow`-a progutalo hover
glow u celosti. Podeljeno na dva sloja:

| sloj | šta radi |
|---|---|
| `::after` (novo) | rim `0 0 0 1px --cta-line @60%` + halo `0 0 18px --cta-pulse-glow`, `opacity` 0.30 ⇄ 0.85 |
| element (postojeće) | hover: jači prsten + duža senka + `translateY(-2px)`, i dalje netaknuto |

`::before` (hover sweep streak iz Round-1) nije diran — hover je i dalje **pojačanje** preko
pulsa koji nikad ne staje.

**`prefers-reduced-motion: reduce`** → `animation: none`, `opacity: 0.55` (statičan rim + glow,
između doline i vrha). Provereno u pravom browseru sa `emulateMedia`: `animationName: "none"`,
opacity 0.55 nepromenjen posle 1.6s.

Ghost (`--secondary`) **nema** puls — hijerarhija prema primarnom je poenta.

---

## 2. Ujednačen radius — jedan token, jedan izvor istine

Novi `--surface-radius: 14px` (= `rounded-xl` = `--radius + 4px`, tj. tačno ugao CTA dugmeta) i
`--surface-radius-inner: 10px` za kontrolu ugnježdenu u površinu (koncentrični uglovi).

Sve što je pre imalo svoj broj sada čita token:

| element | pre | posle |
|---|---|---|
| `.trace-cta` | `rounded-xl` utility na komponenti | `border-radius: var(--surface-radius)` u CSS-u; `rounded-xl` uklonjen iz CVA |
| `.ui-card` (`--ui-card-radius`) | 16px | `var(--surface-radius)` |
| `.process-timeline` (`--process-card-radius`) | 16px | `var(--surface-radius)` |
| `--nav-panel-radius` (services panel) | 1rem | `var(--surface-radius)` |
| `.nav-surface` (peel ostrvo) | 999px kapsula | `var(--surface-radius)` |
| `.nav-pill` (ostrvo nav linkova) | 999px kapsula | `var(--surface-radius)` |
| `.nav-indicator` | 999px | `var(--surface-radius-inner)` |
| nav link + chevron trigger | `rounded-full` | `rounded-[var(--surface-radius-inner)]` |
| language switcher (kontejner / segmenti) | `rounded-full` | `--surface-radius` / `--surface-radius-inner` |

JS blizanci koji **crtaju** taj ugao pomereni su zajedno sa njim — inače streak preseca ćošak
umesto da ga prati:

- `hooks/useBorderTraceReveal.ts` → `CARD_RADIUS = 14`
- `app/_components/ProcessCard.tsx` → `CARD_RADIUS = 14`
- `app/_components/ServicesDropdown.tsx` → `PANEL_RADIUS = 14`

Layout nigde nije pomeren — radius ne učestvuje u layout-u, a nijedna veličina/padding nije
dirana.

---

## 3. Nav ostrvo + language switcher u jeziku CTA

Nova klasa **`.cta-rim`**: plavi rim `var(--cta-line)` + **isti** puls kao CTA (deli isto
`::after` pravilo i isti `@keyframes cta-breathe`, pa ne mogu da se raziđu).

Nosi je: `.nav-pill` (ostrvo na vrhu), `.nav-surface` (ostrvo kad se skroluje), language
switcher (obe faze).

**Predaja rima između faza** je eksplicitna, tako da u svakom trenutku diše tačno jedan plavi
obris:

- **na vrhu** — pill nosi rim; ostrvo je `opacity: 0`, pa njegov rim ne postoji
- **skrolovano** — `[data-nav-state="peeled"] .nav-pill.cta-rim::after { opacity: 0 }`, ostrvo
  preuzima (pill se ionako rastvara — pozadina i border mu idu u `transparent`)

Postojeća pozadina, `backdrop-filter` i čitljivost nisu dirani — promenjena je samo boja
bordera i dodat je senka-sloj izvan border box-a.

### Regresija uhvaćena i popravljena tokom verifikacije

Prva verzija `.cta-rim` je imala `position: relative`. `.nav-surface` je **apsolutno pozicioniran
grid child** — `relative` ga je vratio u flow, zauzeo je prvu ćeliju i prelomio ceo navbar u dva
reda. Sada `.cta-rim` **namerno ne postavlja `position`** (komentar u CSS-u to i kaže), a
language switcher, koji je bio `static`, nosi `relative` uz klasu.

---

## 4. Ghost (secondary) CTA vidljiviji

```
border-color:  --border-soft  →  color-mix(--cta-line 70%)
color:         text-theme-muted  →  color-mix(--text-primary 70%, --text-secondary)
```

Rim je sada CTA plava povučena na 70%, a mastilo je jedan korak iznad muted-a. Bez fill-a, bez
streak-a i bez pulsa — vidljiviji, ali i dalje ispod primarnog (primarni ima gradijentni wash,
sweep i puls). Boja je u CSS-u a ne u CVA varijanti jer je taj blok van `@layer`-a i pobeđuje
`text-theme-muted` utility (isti trik koji `--on-dark` već koristi).

---

## Fajlovi

| Fajl | Šta |
|---|---|
| `app/globals.css` | `--surface-radius`, `--surface-radius-inner`, `--cta-pulse-duration` (deljeni `:root`); `--cta-pulse-glow` u **sve 3 palete** + u `--on-dark`; blok „The resting breath" (`.cta-rim`, `.trace-cta--primary::after`, `@keyframes cta-breathe`); reduced-motion grana; radius token na `.trace-cta`, `.nav-surface`, `.nav-pill`, `.nav-indicator`, `--ui-card-radius`, `--process-card-radius`, `--nav-panel-radius`; ghost rim + boja; peel handoff pravilo |
| `components/ui/trace-button.tsx` | `rounded-xl` izbačen iz CVA (radius sad dolazi iz tokena); docblock o pulsu i o uglu |
| `app/_components/Navbar.tsx` | `cta-rim` na `.nav-surface` |
| `app/_components/NavLinks.tsx` | `cta-rim` na `.nav-pill`; link + chevron na `--surface-radius-inner` |
| `app/_components/LanguageSwitcher.tsx` | `cta-rim relative` + `--surface-radius` na kontejneru, `--surface-radius-inner` na segmentima |
| `hooks/useBorderTraceReveal.ts` | `CARD_RADIUS` 16 → 14 |
| `app/_components/ProcessCard.tsx` | `CARD_RADIUS` 16 → 14 |
| `app/_components/ServicesDropdown.tsx` | `PANEL_RADIUS` 16 → 14 |
| `.gitignore` | `showcase/redesign-round2/review/` (isti dogovor kao Round-1 — screenshotovi su artefakt procesa) |

---

## Verifikacija

| Provera | Rezultat |
|---|---|
| `npx tsc --noEmit` | ✅ prolazi (bez `any`) |
| `npm run lint` | ✅ prolazi, bez izlaza |
| `npm run build` | ✅ 16/16 strana, compiled successfully |
| Puls radi u loop-u | ✅ uzorkovan `::after` opacity kroz 3.2s: 0.81 → 0.85 → 0.74 → 0.52 → 0.34 → 0.31 → 0.43 → 0.65 |
| Reduced motion | ✅ `animationName: none`, `opacity: 0.55`, nepromenjeno posle 1.6s |
| Radius usklađen | ✅ izmereno u browseru: CTA 14px, `.ui-card` 14px, `.ui-card-shell` 14px, `.nav-pill` 14px, `.nav-surface` 14px, switcher 14px, `.nav-panel-body` 14px |
| Nav + switcher u CTA jeziku | ✅ `borderColor` = `--cta-line`, `::after` = isti `cta-breathe 3.2s infinite` na sve tri površine |
| Predaja rima na peel | ✅ `nav-pill::after` opacity 0 kad je `data-nav-state="peeled"`, ostrvo nosi rim (screenshot) |
| Ghost vidljiviji | ✅ border alpha 0.14 → 0.32, boja pomerena ka primary; `::after` = `none` (bez pulsa) |
| Tri palete | ✅ light `#0284c742`, dark `#38bdf857`, `data-mood="alt"` `#00ff414d` |
| `look="glass"` | ✅ put netaknut — `liquid-glass-button.tsx` i `cta-button.tsx` nisu u diff-u, glass nosi sopstveni `rounded-xl` (isti 14px) i nijedan token koji je diran |
| Konzola | ✅ 0 grešaka (2 postojeća warning-a, nevezana) |

Screenshotovi (gitignored, na disku u `showcase/redesign-round2/review/`):
`round2-02-home-top.png`, `round2-02-home-peeled.png`, `round2-02-home-dark.png`,
`round2-02-dropdown.png`, `round2-02-mobile-top.png`, `round2-02-mobile-peeled.png`.

---

## Odluke i preskočeno

- **`--surface-radius` nije u tri palete.** Pravilo „novi token → sve 3 palete" postoji da boja
  ne bi nedostajala u temi; ovo je **geometrija** koja se ne menja sa temom. Stoji u deljenom
  `:root` bloku (uz `--nav-island-bleed`), koji sve tri palete nasleđuju — jedan broj umesto tri
  koja mogu da se raziđu. Isto važi za `--surface-radius-inner` i `--cta-pulse-duration`.
  `--cta-pulse-glow`, koji **jeste** boja, ide u sve tri palete + u `--on-dark`.
- **Process kartice (početna) ušle su u radius pass** iako ih zadatak ne nabraja poimence:
  „kartice" na 14px a process kartice na 16px bi bile vidljiva nedoslednost, a promena je par
  spregnutih linija (CSS token + `CARD_RADIUS`).
- **Nav ostrvo više nije kapsula.** 999px → 14px je vidljiva promena; to je ono što zadatak
  traži („nav ostrvo → isti ugao"). Komentar u CSS-u koji je pravdao „round ends" je ažuriran.
- **Ghost bez pulsa**, namerno — puls je signal primarne akcije. Ako se traži da i ghost diše,
  dovoljno je dodati mu `.cta-rim`.
- **Nije dirano:** pozadinski video i sve njegove varijable, glow tokeni, `liquid-glass` put,
  `.liquid-glass` radijusi, ostale `rounded-full` sitnice (bedževi, tačke, kružna ikonična
  dugmad) — nisu „glavni elementi" iz zadatka.
