# REPORT-06 — Čist slajd usluge (levi blok)

**Grana:** feat/redesign-round2
**Korak:** 06/12
**Fajlovi:** `app/(pages)/services/_components/ServicePanel.tsx`, `app/globals.css`
**Bez push-a, bez deploy-a.** Pozadina netaknuta, glow i reveal ostaju, SEO rute
(`services/<slug>/page.tsx`) nisu dodirnute.

---

## Šta je bilo, šta je sada

| pre | posle |
|---|---|
| eyebrow + brojač `01 / 06` | — (skinuto) |
| h1 | h1 |
| lede | lede |
| 3 capability stavke (vertikalna lista) | — (premešteno na dno) |
| CTA | CTA |
| tanka linija + 3 proof broja (`dl`) | 3 capability stavke, horizontalno, na podu panela |

Levi blok je sada tačno: **h1 → lede → CTA → (dno) red od 3 capability stavke.**

Brojač je ispao bez zamene jer ga dots ispod scene već govore, a proof brojevi
zato što je to argument za koji panel nema mesta. **Podaci ostaju** — `stats` i
puna `capabilities` lista i dalje stoje u `constants/services/*`, netaknute; samo
ih markup više ne renderuje. Ništa nije brisano iz `lib/i18n.ts`.

## Kako je red na dnu napravljen

Tri stvari su morale da se poklope da bi „dno" zaista bilo dno:

1. **`.service-panel` postaje flex kolona na `lg`, a grid dobija `flex: 1`.**
   Blok-dete ne nasleđuje `min-height` roditelja, pa je grid stajao 30rem
   panela sa ~55px praznog vazduha ispod sebe — red je visio iznad poda.
2. **Leva kolona ide `align-self: stretch`, a kopija (`.service-panel-lead`)
   dobija `margin-block: auto`.** Kolona uzme punu visinu reda (model box je
   viši), red padne na pod poravnat sa donjom ivicom modela, a h1/lede/CTA ostaju
   optički centrirani. `space-between` ovde ne valja — kod kraćeg lede-a bi kopija
   odlutala ka vrhu.
3. **`min-width: 0` na levoj koloni.** Ovo je bio jedini pravi bug u koraku:
   automatski minimum grid stavke je njena `min-content` širina, pa je red koji
   odbija da se skupi **razvukao levu kolonu i smanjio model na 153px** (mereno na
   1024px). Sa `min-width: 0` kolona ostaje na svojoj `fr` širini, a red iscuri
   preko nje — što je i bila namera.

### Overflow — izmereno, ne procenjeno

Stavke su `flex: 0 0 auto` (+ `white-space: nowrap`), pa red curi umesto da se
gnječi. Podignut je `z-index: 2` da labele ostanu čitljive tamo gde pređu preko
kadra modela.

Prelom **nowrap tek od 1280px**, ne od `lg`. Na 1024–1279 red bi prešao preko
većeg dela modela (bila bi selidba u susednu kolonu, ne „malo strči"), pa se tu
prelama u 2 reda i ostaje u koloni.

Mereno na 1440×900, desna ivica poslednje stavke naspram desne ivice leve kolone
(713px) i naspram unutrašnje ivice panela (1352px):

| usluga | SR | EN |
|---|---|---|
| web-development | 792 (+79) | — |
| ui-ux-design | 780 (+67) | 743 (+30) |
| mobile-app-development | 813 (+100) | **862 (+149)** |
| seo-geo | 770 (+57) | 791 (+78) |
| branding | **846 (+133)** | 784 (+71) |
| social-media | 743 (+30) | 786 (+73) |

Najgori slučaj (EN, mobile-app) staje 490px pre ivice panela — dakle nigde se ne
seče o `overflow: hidden` na shell-u, a red uvek prelazi tek donji, prazan deo
kadra (model je `Bounds fit` centriran u 4/3 boksu).

**Mobilni (390×844):** `flex-wrap: wrap` → 3 reda, sve unutar panela (desna ivica
282 vs 359), `document.scrollWidth` 375 ≤ `innerWidth` 390 — nema horizontalnog
scroll-a.

## Tačka 4 (opciono) — OSTAVLJENA JE PROVIDNA VARIJANTA

Ostavljeno: **`background-color: transparent`** na `.ui-card-shell` unutar
`.service-carousel`, plus tanji rim
(`color-mix(--card-trace 18%, --border-soft)` umesto `22%, --border-strong`).
Glass fallback **nije bio potreban.**

Pravilo je namerno **van `@layer`** — `.theme-card` živi u `@layer components`, a
slojevito pravilo se ne može pobediti specifičnošću.

Kako izgleda:

- **Dark:** najbolji rezultat koraka. Dot-wave pozadina prolazi kroz panel, oba
  ambient glow-a i dalje gore unutar clip-a, hairline drži gornju ivicu. Panel
  čita kao okvir oko pozadine, ne kao ploča preko nje. Tekst je beo na tamnom —
  kontrast nije ni blizu granice.
- **Light:** takođe čitljivo (tamno na svetloj tačkastoj podlozi); rim je sada
  osetno tiši nego ranije i panel je „mekši" objekat. Nije razbijeno — glow i
  hairline nose oblik — ali je ovo strana na kojoj bi se, ako se ikad učini
  preslabo, vratio suptilan glass ili jači rim. Preporuka: pogledati uživo pre
  nego što se ovo prenese na ostale kartice sajta.

Šta je ostalo netaknuto: border trace reveal (dve putanje, ista geometrija),
`.ui-card-hairline`, `.service-panel-glow--lead/--trail`, i pravilo da panel nema
hover lift.

## Verifikacija

| provera | rezultat |
|---|---|
| `npx tsc --noEmit` | ✅ bez greške, bez `any` |
| `npm run lint` | ✅ čisto |
| `npm run build` | ✅ svih 6 `services/*` ruta i dalje `○ (Static)` |
| nema eyebrow-a / brojača | ✅ DOM provera: `.tracking-[0.5em]` i `dl` u panelu → `false` |
| 3 capability na dnu, horizontalno | ✅ svih 6 usluga, 3 stavke, jedna linija ≥1280 |
| overflow ne seče | ✅ tabela gore, SR i EN |
| carousel — svih 6 | ✅ klik kroz sve tačke, svaki panel se renderuje, URL prati |
| reveal + trace | ✅ mid-flight: `blur(0.76px)` + `translateY(1.77px)`, 2 `.ui-card-trace-path`, sleže na `blur(0)` |
| glow | ✅ `.service-panel-glow` opacity 0.75, radial-gradient prisutan |
| reduced-motion | ✅ `emulateMedia({reducedMotion:'reduce'})`: nema trace SVG-a, panel odmah vidljiv (opacity 1, filter none), glow ostaje |
| i18n / text-reveal | ✅ SR→EN prevodi h1, lede, CTA i sve 3 stavke (`li > span`, blok fallback jer je `li` flex — isto kao pre) |
| mobilni prelom | ✅ 390px: 3 reda, bez horizontalnog scroll-a |

Verifikovano Playwright-om nad `npm run dev`, dark i light, 1440 / 1024 / 390.

## Napomena za sledeći korak

Dev server keširao je CSS kroz dve izmene zaredom — merenja koja ne odgovaraju
fajlu treba proveriti u `document.styleSheets` pre nego što se povuče zaključak o
CSS-u (jedan `printf '\n' >> globals.css` je bio dovoljan da watcher krene).
