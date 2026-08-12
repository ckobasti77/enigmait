# REPORT-02 — CTA „Trace glass" (varijanta A), korak 02/07

Grana: `feat/redesign-clean`. Spec: `enigma-claude-code-promptovi.md` → **PROMPT 1**.
Vizuelna referenca: `enigma-proto.html`, klase `.cta` / `.cta-a` / `.cta-ghost` i
`@keyframes sweep`.

## Urađeno

Nova CTA varijanta „trace": plavi rim u miru, na hover jedan svetlosni streak koji
pretrči taj rim + cyan glow — isti jezik kao `ProcessCard` borderTrace i services
dropdown. Postavljena je kao **default** za `CtaButton`, pa je ceo sajt (hero, navbar,
footer, PageHero, ServiceHero, ServiceFinalCta, projects, disciplines, mobilni meni)
dobio novi izgled bez ijedne izmene na pozivnim mestima. Stari liquid-glass je netaknut
i dostupan kroz `look="glass"`.

### Fajlovi

| Fajl | Status | Šta |
|---|---|---|
| `components/ui/trace-button.tsx` | **nov** | `TraceButton` — isti CVA pristup kao `liquid-glass-button.tsx`, iste veličine `sm/default/lg/xl/icon`, `asChild` preko `@radix-ui/react-slot`. |
| `components/ui/cta-button.tsx` | izmenjen | Dodat `look?: "trace" \| "glass"` (default `"trace"`). Postojeći API (`href`, `text`/`children`, `variant`, `size`, `target`, `rel`, `aria-label`, `onClick`) nepromenjen. |
| `app/globals.css` | izmenjen | Tokeni `--cta-line` + `--cta-sweep` u **sve tri palete**; novi blok `.trace-cta*` odmah ispod liquid-glass bloka. |
| `app/_components/NavLinksMobile.tsx` | izmenjen (1 linija) | `className="liquid-glass--on-dark"` → `"liquid-glass--on-dark trace-cta--on-dark"`. |

### Tokeni (sve tri palete)

| Paleta | `--cta-line` | `--cta-sweep` |
|---|---|---|
| svetla (`:root`) | `rgba(2, 132, 199, 0.45)` | `#0284c7 → #6d28d9` |
| tamna (`.dark`) | `rgba(88, 196, 255, 0.55)` | `#38bdf8 → #c084fc` |
| matrix (`html[data-mood="alt"]`) | `rgba(0, 255, 65, 0.45)` | `#00ff41 → #86ffb8` |

Svetla plava je namerno `--process-accent-1` iz svetle palete, a ne re-alpha-ovan
`#58c4ff`: na papiru se 1px rim od svetlijeg plavog izgubi. Matrix ima jednu boju
(streak se odvaja svetlinom, ne drugim tonom) — isto rešenje kao `--nav-trace-*` tamo.

Reuse, bez novih tokena: `--primary`, `--border-soft`, `--glow-accent-1`, `--foreground`,
`--ring`.

### Implementacione odluke

- **Streak je `::before`, ne child element.** `asChild` predaje decu direktno `Link`-u, pa
  bi sloj tražio wrapper koji menja layout ili `Slottable` gimnastiku — a `padding: 1px` +
  `mask-composite: exclude` daje tačno rim, bez ijednog DOM čvora. Zato `Slottable` nije
  korišćen iako ga spec pominje: nema šta da drži.
- **Mask svojstva su pisana bez prefiksa**, po komentaru koji već stoji na
  `.liquid-glass__refraction`: Lightning CSS sam emituje `-webkit-mask*`, a ako se piše i
  jedno i drugo dedupe ostavi samo webkit varijantu. Provereno u build outputu:
  `mask-composite:exclude` **i** `-webkit-mask-composite:xor` su oba u `.next/static/chunks/*.css`.
- **Fill se mešá iz `--cta-line`** (`color-mix` 18% → 4%), ne iz `--primary`. Prva verzija
  je vukla iz `--primary` i u svetloj temi dala teget wash unutar sky-blue rima, jer je
  svetli `--primary` `#1f2c3d`. Sad su rim i wash uvek isti ton, a brojke padnu na
  prototipovih `.10 → .02`.
- **Visine su identične liquid-glass dugmetu** (`h-9/h-11/h-12/h-14/size-12`) da promena
  defaulta ne može da pomeri layout. Horizontalni padding je uži (`px-5/6/7/9` umesto
  `px-6/8/9/11`) — glass veličine su široko podstavljene da pokriju ono što skew pojede na
  gornjoj i donjoj ivici, a ovo dugme stoji uspravno.
- **`.trace-cta--on-dark`** dodat po ugledu na `.liquid-glass--on-dark`, jer je mobilni meni
  taman u svakoj temi (u svetloj temi bi `text-theme-primary` bio taman tekst na tamnom).
  U `NavLinksMobile` stoje obe klase, pa pin preživi eventualni `look` switch.
- **Secondary je ghost bez streaka** (`::before { content: none }`) — hijerarhija prema
  primary-ju je poenta; menja samo rim (`--border-soft` → `--cta-line`) i tekst
  (muted → `--primary`), po spec-u.

## Verifikacija

`npm run lint` — prolazi (bez izlaza). `npm run build` — prolazi, 16 ruta, TS bez grešaka,
bez `any`.

Ostalo je provereno u pravom browseru (Playwright, dev server), preko privremene
harness rute koja je posle obrisana (`git status` je čist osim izmena iznad):

| Provera | Rezultat |
|---|---|
| `look="glass"` (primary + secondary) | i dalje `liquid-glass liquid-glass--primary/secondary`, skew i `::before` netaknuti — stari izgled očuvan |
| default (bez `look`) | `trace-cta trace-cta--primary` na svim CTA, uključujući navbar i hero |
| svetla tema | rim `rgba(2,132,199,0.45)`, wash 8.1% istog tona, hairline tamni (`--foreground` 7%) |
| tamna tema | rim `rgba(88,196,255,0.55)`, wash 9.9%, hairline beli |
| matrix tema | rim `rgba(0,255,65,0.45)`, sweep `#00ff41 → #86ffb8` |
| hover | `trace-cta-sweep` odigra jednom do kraja (`background-position: -40%`), `translateY(-2px)`, `box-shadow: inset … , 0 0 0 1px rgba(88,196,255,.25), 0 10px 30px rgba(56,189,248,.28)` — 1:1 sa prototipom |
| `prefers-reduced-motion: reduce` | 0 animacija, `::before` opacity 0, `transform: none`, strelica se ne pomera; rim pređe na `--primary` @70%, **glow ostaje** (state, ne kretanje) |
| radius | 14px (`rounded-xl` = `calc(--radius + 4px)`) — isto kao `.cta-a` u prototipu |
| tap target | default 44px, lg 48px, xl 56px |

## Poštovana pravina

Bez push-a i bez deploy-a — sve lokalno na `feat/redesign-clean`. Pozadina nije dirana,
glow nije smanjen (dodat je novi glow na hover). Početna (`Hero`, `TechSection`, `Timeline`,
`Disciplines`) nije menjana ni jednim karakterom — hero CTA je dobio novi izgled kroz
`CtaButton` levak, što PROMPT 1 eksplicitno traži („hero" je naveden u listi). Postojeće
varijante sačuvane: liquid-glass kroz `look="glass"`, `"enigma"` varijanta u
`components/ui/button.tsx` nije ni dodirnuta. i18n/text-reveal ugovor nepromenjen — CTA
tekst i dalje ide kroz `Link` (linkovi su u `skipSelector`), nova komponenta ne dira
tekstualne čvorove.

## Preskočeno / napomene za sledeće korake

- **`Slottable` nije korišćen** iako ga spec navodi — vidi „Implementacione odluke". Ako se
  kasnije doda sloj koji GSAP mora da hvata (npr. trace SVG na CTA), tada se uvodi.
- **`size="sm"` je 36px**, ispod 44px tap targeta. To je zatečeno stanje (isto važi za
  liquid-glass `sm`, koji koristi footer i mobilni meni) — nije menjano da se ne pomeri
  layout van opsega ovog koraka. Kandidat za PROMPT 6 (QA).
- **`components/ui/button.tsx`** (shadcn, `"enigma"` varijanta) nije dodirnut; ako se u
  kasnijim koracima negde koristi kao CTA, treba ga prevesti na `CtaButton`.
