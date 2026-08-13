# KRUG 2 — KORAK 07/12

**Strelice bez bordera + hover iscrtavanje + scroll preko dots-a**
Grana `feat/redesign-round2` · lokalno, bez push-a.

Dirnuta dva fajla:

- `app/(pages)/services/_components/ServiceCarousel.tsx`
- `app/globals.css` (blok „Services carousel")

---

## 1) Strelica je hit-area, caret je jedino što se vidi

Bio je disk: `1px` border, `--surface-overlay` pozadina, `backdrop-filter: blur(10px)`
i lucide `ChevronLeft/Right` na `1.25rem`. Otišlo je sve osim mete.

Ključna podela je da su **kutija i caret sada dva različita broja**, jer su ranije
bili isti broj — kutija je *bila* nacrtani disk. Sada:

| | kutija (`--service-arrow`) | caret (`--service-caret`) |
|---|---|---|
| desktop | `3.25rem` = **52px** | `2.25rem` = 36px |
| ≤639px | `2.75rem` = **44px** | `1.75rem` = 28px |

Mobilna kutija je *podignuta* sa `2.5rem` (40px) na `2.75rem` — 44px je pod ispod
kojeg tap target ne sme, i to je jedini razlog što kutija nije pratila caret naniže.
Caret je uvećan ~1.8× (20px → 36px), stroke `2.25` u `24`-unit viewBox-u.

Boja: `--service-caret-line: var(--card-trace)`. Brief traži `--primary`/`--cta-line`;
`--cta-line` je taj isti ton na parcijalnoj alfi (dobro za rim na punoj površini,
preslabо za stroke koji lebdi nad stranicom), a `--primary` je u light temi **ink navy
`#1f2c3d`**, ne plava — goli caret bi tamo ispao siv. `--card-trace` je isti ton na punoj
snazi u sve tri palete (light `#0284c7`, dark `#58c4ff`, alt zelena), pa caret ostaje
CTA plava svuda. Zabeleženo u komentaru iznad varijable.

Kontrast bez diska nosi drop-shadow u boji same pozadine
(`color-mix(in srgb, var(--background) 85%, transparent)`) — taman halo u dark,
svetao u light, po konstrukciji.

## 2) Hover: svetlo iz vrha ka oba kraja

Caret nije jedan `path` nego **dva kraka, oba sa `M` na vrhu** (`ArrowCaret`).
To je ceo trik: `stroke-dashoffset` crta path od njegovog *sopstvenog* početka, pa
jedna CSS tranzicija na oba kraka istovremeno izbacuje svetlo iz ugla i vodi ga do
oba vrha — koji stižu zajedno jer im je `pathLength` normalizovan na istu skalu
(`100`), a krakovi su ionako simetrični (45°, `M8 12 L16 4` / `M8 12 L16 20`).
Levа strelica ima vrh na `x=8`, desna na `x=16` — svaka crta iz svog vrha.

Dva sloja: `.service-arrow-arm` (uvek vidljiv, `currentColor`) i `.service-arrow-spark`
(`color-mix(in srgb, var(--card-trace) 55%, var(--text-primary))` + dva
`drop-shadow`-a u `--card-trace-glow` — isti glow recept kao `.ui-card` trace).
Mix ka `--text-primary` je namerno: u dark to daje skoro belu cyan (izmereno
`srgb(0.62 0.86 1.0)` — svetlo koje se crta), u light tamniju, zasićeniju plavu
(`srgb(0.08 0.35 0.49)`), jer bi svetlija varijanta na kremastoj pozadini nestala.
U light temi „svetlo" dakle nosi glow, a ne svetlina stroke-a — to je jedini
čitljiv izbor na toj pozadini i svesna je razmena.

Povlačenje na un-hover ide obrnuto (`0 → 100`), pa se svetlo skuplja od vrhova ka uglu.

`prefers-reduced-motion`: `transition: none` — svetlo i dalje stiže na hover (to je
stanje, a kontrola bez hover odgovora je gora od mirne), ali **bez putovanja**.
Isto pravilo koje `.ui-card:hover` već koristi dva bloka iznad.

## 3) Wheel nad dots redom

Listener je na `.service-dots` i **nigde drugde**. Nad panelom vertikalni gest
ostaje skrol stranice — panel je skoro ceo ekran visok i otimanje njegovog wheel-a
bi zarobilo posetioca na putu ka FAQ-u.

Red je bio strip od 8px — nemoguće nanišaniti. `padding-block: 0.75rem` ga pravi
**32px visokim** bez ijedne vidljive promene (uzeto nazad iz `margin-top`, 1.75rem →
1rem + 0.75rem padding).

Jedan notch = jedan slajd. Ugovor je drugačiji od `useDisciplineIndex` (tamo prag
`120`, jer kursor stoji nad pola sekcije i trzaj ne sme da pomeri model): ovde je
prag **`24`**, pa jedan Chrome notch (~100px) prolazi, a **cooldown `660ms`** — ne prag —
je ono što sprečava da jedan trackpad flick potroši četiri slajda. Delte unutar
cooldown-a se jedu ali se **ne banking-uju**; upravo banking repa flick-a je način
na koji jedan gest postane dva koraka. `660ms` je duže od push-a (620ms) namerno:
korak koji stigne usred push-a `busyRef` ionako odbaci, a progutan notch se čita
kao da red ignoriše.

Lista se wrap-uje, pa nema krajeva na kojima bi se wheel pustio. Zato **budžet**,
isti obrazac koji sekcija disciplina već koristi: `LENGTH - 1` = 5 koraka po poseti,
posle čega se delte puštaju i stranica skroluje dalje. Vraća se kad karusel napusti
viewport (`isIntersecting`). Budžet je samo wheel-ov — tačkice, strelice, tastatura
i swipe se wrap-uju bez ograničenja.

Stanje wheel-a živi u `useRef`, ne u closure-u efekta: listener se re-attach-uje na
svaku promenu indeksa (`step` se menja s njom), a cooldown koji se resetuje pri
re-attach-u je cooldown koji nikad ne okine.

`stopPropagation()` je ono što drži Lenis (sluša na window-u) van ovoga, isto kao
u disciplinama.

---

## Verifikacija

Sve mereno u pravom browseru (Playwright), dev server na `:3000`.

| Provera | Rezultat |
|---|---|
| `npx tsc --noEmit` | ✅ čisto, bez `any` |
| `npm run lint` | ✅ bez izlaza |
| `npm run build` | ✅ 16/16 static, Turbopack 8.6s |
| Strelica: border / background / backdrop | ✅ `0px` / `rgba(0,0,0,0)` / `none` |
| Hit area desktop / mobile (390px) | ✅ **52×52** / **44×44** |
| Caret desktop / mobile | ✅ 36×36 / 28×28 (bilo 20×20) |
| Hover crta iz vrha ka oba kraja | ✅ oba `path`-a `100px → 0px`; presnimljen mid-state na 55 pokazuje simetričan napredak iz ugla, vrhovi još goli |
| Ne-hover strelica miruje | ✅ ostaje `100px` |
| 5 pravih notch-eva nad dots-om | ✅ 5 slajdova, `scrollY` ostao **0** (web-development → … → social-media) |
| Notch unutar cooldown-a | ✅ progutan, bez koraka |
| Notch gore | ✅ prethodni slajd |
| Notch 6–7 (budžet potrošen) | ✅ stranica skroluje (`scrollY` 148 → 298) — nema zamke |
| Wheel nad panelom | ✅ stranica skroluje (370), slajd nepromenjen |
| `prefers-reduced-motion: reduce` | ✅ `transition-property: none`, hover stiže odmah, bez iscrtavanja |
| Wheel pod reduced-motion | ✅ i dalje menja slajd (navigacija, ne animacija) |
| Light tema | ✅ base `rgb(2,132,199)`, spark tamnija plava + glow |
| Dark tema | ✅ base `rgb(88,196,255)`, spark `srgb(0.62 0.86 1.0)` |
| Alt mood | ✅ base `rgb(0,227,95)`, spark svetlija zelena |
| Console | ✅ 0 errors |

Pozadina nedirnuta. Glow ostao — i panelov ambijentalni i novi caret glow.

## Commit

```
feat(services): plave strelice bez bordera + hover iscrtavanje + scroll dots
```
