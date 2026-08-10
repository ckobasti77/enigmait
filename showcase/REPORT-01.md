# REPORT-01 — Popravke capture-a i snimanje svih projekata

Datum: 2026-08-11
Menjani fajlovi: `scripts/capture-showcase.mjs`, `showcase/showcase.config.json`, ovaj izveštaj.
Komponente, `app/` i HyperFrames nisu dirani.

## Zatečeno stanje

Prethodni (prekinuti) run je već bio uradio FIX 2 i FIX 3 u celosti, a FIX 1 samo do pola.
Zatekao sam:

- `journey` polje, `maxPxPerFrame` i `deviceScaleFactorByVariant` — implementirani i u configu.
- `hideSelectors` — implementirani, selektori nađeni za svih 6 sajtova.
- **FIX 1 nedovršen**: kod je meru radio, ali je eksplicitno odbijao da primeni skraćenje
  (`NOT changing anything — your call`). Brief traži da SME automatski da skrati, uz glasnu
  prijavu. Dopisao sam primenu + `journeyAdjusted` u `meta.json`.
- **FIX 4 nije postojao** — nema traga `content.txt`. Napisan od nule.
- **REPORT-01.md nije postojao.**

## Tabela po projektu

Svih 6 aktivnih: **OK**. 270 frejmova po varijanti, 2 varijante po projektu, ukupno 3240 frejmova.

| Projekat | maxScroll D / M | Prekoračen prag? (izmereno) | Primenjeni `journey` D / M | Cookie selektor | `hideSelectors` (pogodaka) | Frejmova | Veličina D / M | `content.txt` | Status |
|---|---|---|---|---|---|---|---|---|---|
| `lady-gaga-studio` | 12655 / 18067 | **DA** — 79px D, 113px M | 0–**0.25** / 0–**0.15** | `.cookie-starport button.ghost-btn` | `.cookie-orbit-launcher` (1) | 270 + 270 | 29.9 / 12.5 MB | ✅ 8.5 KB (skraćen sa 17571) | OK |
| `ablux-travel` | 3562 / 5570 | DA samo mobile — 70px | 0–1 / 0–**0.6** | — (nema banner) | `.qa-fab` (1) | 270 + 270 | 22.0 / 11.9 MB | ✅ 3.5 KB | OK |
| `gbmt` | 1948 / 3424 | NE — 24px D, 43px M | 0–1 / 0–1 | — (nema banner) | `button[title="Skroluj do vrha"]` (1) | 270 + 270 | 37.9 / 12.9 MB | ✅ 2.4 KB | OK |
| `the-original-way` | 8018 / 9604 | **DA** — 100px D, 120px M | 0–**0.45** / 0–**0.35** | — (nema banner) | `div[class*='z-[65]']` (1) | 270 + 270 | 19.5 / 8.7 MB | ✅ 2.5 KB | OK |
| `fides-gradnja` | 2455 / 3459 | NE — 31px D, 43px M | 0–1 / 0–1 | — (nema banner) | `div.outer[class*='z-[9999999]']` (1) | 270 + 270 | 23.3 / 11.5 MB | ✅ 2.0 KB | OK |
| `digist` | 4671 / 7629 | **DA** — 58px D, 95px M | 0–**0.75** / 0–**0.45** | — (nema banner) | `a[title="Scroll To Top"]` (1) | 270 + 270 | 24.3 / 9.0 MB | ✅ 3.7 KB | OK |
| `jeveux-travel` | — | — | — | — | — | — | — | — | PRESKOČEN (`enabled:false`, URL 404) |

Ukupno na disku: **~223 MB**. Posle skraćenja nijedna varijanta ne prelazi prag —
najbrža je sada 45px/frejm (`ablux-travel` desktop, tačno na pragu).

Nijedan selektor nije bio ustajao: svaki `hideSelectors` unos pogodio je tačno 1 element.
Nigde nije prijavljen scroll hijack. `the-original-way` je jedini sa Lenis-om — neutralisan
(`html.lenis` klase uklonjene), skrol sleće tačno gde treba.

## Verifikacija praznih frejmova (CSR sajtovi)

Brief traži potvrdu da frejm 1 nije prazna stranica za `gbmt`, `fides-gradnja` i `digist`.
Sanity check je prošao iz prve, bez ijednog ponavljanja:

| Projekat | stdDev frejma 1 (D / M) | Vizuelna provera |
|---|---|---|
| `gbmt` | 32.7 / 43.0 | ✅ hero „Nadgledanje i Zaštita" |
| `fides-gradnja` | 31.2 / 42.8 | ✅ hero „POUZDANI PARTNER U SVETU GRAĐEVINARSTVA" |
| `digist` | 20.8 / 15.5 | ✅ intro splash sa DIGIST logotipom |

`digist` ima najniži stdDev jer je tamna tema i prvi ekran je minimalistički splash — otvorio
sam frejm i to je stvaran sadržaj, ne prazna stranica. Prag je 3, tako da ima dosta zazora.
Dodatno sam vizuelno proverio poslednji frejm `gbmt` i `lady-gaga-studio`: back-to-top dugme
i PRIVATNOST pilula se ne vide ni u jednom frejmu.

## Odluke koje sam doneo sam

**1. Vratio `fps: 30` i `durations.card: 9` (zatekao 24 i 3).**
Ovo je najveća odluka i tražim da je pogledaš. Prethodni run je promenio kadenciju na 24fps/3s,
što nigde nije traženo, pa je bilo 72 frejma po varijanti umesto 270 koje brief navodi kao
verifikovano stanje. Posledica je bila da su svi `journey` prozori morali da se stisnu na
5–35% stranice samo da bi stali u 3 sekunde, i svaki klip je išao na maksimalnoj dozvoljenoj
brzini. `gbmt` je time pao na prozor 0.349 pri 43px/frejm — a brief ga navodi kao referencu
koja „izgleda tačno kako treba".

Da sam pogrešio u rekonstrukciji, brojevi to ne bi potvrdili — a potvrdili su: brief kaže
„~70px po frejmu na desktopu i ~100px na mobilnom" za `lady-gaga-studio`, a moje merenje na
30fps/9s daje **79px desktop i 113px mobile**. Na 24fps/3s ti brojevi se ne mogu dobiti.
Posle vraćanja, `gbmt` prolazi **celu stranicu** (0–1) pri 24px/frejm — referentna brzina.

**2. Skinuo `journey` sa 5 projekata, ostavio ga samo na `lady-gaga-studio`.**
Brief kaže: za `lady-gaga-studio` upiši `{from: 0, to: 0.5}`, za ostale „pusti automatiku".
Zatečeni config je imao ručno upisane vrednosti na svih 6 (0.054, 0.191, 0.349…), izvedene za
staru kadencu. Obrisao sam ih da bi default bio cela stranica, pa automatika skraćuje samo gde
je stvarno prebrzo. Rezultat: 3 projekta prolaze celu stranicu bez ikakvog skraćenja.
Odabrane vrednosti nisam vraćao u config — žive u `meta.json` pod `journeyAdjusted`, pa je
config i dalje deklarativan, a ne izlog izmerenih brojeva.

**3. Zaokruživanje naniže na 0.05 gubi na preciznosti — ostavio kako brief traži.**
Fitovana vrednost se zaokružuje naniže na korak 0.05, kako je traženo. To ponegde košta:
`the-original-way` mobile fituje na 0.375 a dobija 0.35, `digist` mobile 0.474 → 0.45,
`lady-gaga-studio` desktop 0.285 → 0.25 (najveći gubitak, ~12% prozora). Uvek naniže, nikad
naviše — naviše bi vratilo preko praga. Ako želiš finiji korak, to je jedna konstanta
(`JOURNEY_STEP` u `capture-showcase.mjs`).

**4. Ispod jednog koraka ne zaokružujem na nulu.**
Ako bi zaokruživanje naniže dalo 0 (fitovana vrednost manja od 0.05), koristim tačnu fitovanu
vrednost. Prozor od 0.03 je i dalje klip; 0 nije klip. Nijedan projekat nije pao u ovaj slučaj,
ali `lady-gaga-studio` je bio blizu.

**5. `content.txt` je formatiran, ne sirov damp.**
Traženo je title + meta description + očišćen `innerText` do 8000 znakova. Napisao sam ih sa
markdown zaglavljima (`## title`, `## meta description`, `## body text`) i URL-om u vrhu, jer
će se iz njih pisati tekst kartica pa je čitljivost bila eksplicitan zahtev. Kad se telo
skrati, u zaglavlju piše koliko je bilo pre skraćenja.

**6. Merenje se radi ponovo posle skraćenja.**
Posle primene novog `to`, staza se gradi iznova i mera se ponavlja, pa `scrollSpeed` u
`meta.json` opisuje ono što je stvarno snimljeno. Izvorna izmerena vrednost nije izgubljena —
stoji u `journeyAdjusted.measuredPxPerFrame`.

## Na šta da obratiš pažnju

- **Kadenca 30fps/9s je moja rekonstrukcija.** Ako si namerno hteo kraće kartice (3s), reci —
  vraćanje je izmena dva broja u `defaults`, ali onda `journey` prozori ponovo padaju na
  ~5–35% stranice i klipovi idu na maksimalnoj brzini. Preporuka: ostavi 9s.
- **`digist` nema `meta[name="description"]`, a `<title>` mu je samo „Digist"** (6 znakova).
  Za KORAK 3 taj sajt nema nikakav SEO tekst za oslonac — sve mora iz `body` teksta (3631 znak).
- **`lady-gaga-studio` je jedini kome je telo skraćeno** (17571 → 8000). Skraćeno je s kraja,
  pa fali donji deo stranice. Ako opis kartice ispadne tanak, podigni `CONTENT_CHAR_LIMIT`.
- **`ablux-travel` desktop je tačno na pragu** (45px/frejm, prag 45). Nije skraćen jer nije
  prekoračio. Ako u pregledu deluje prebrzo, spusti `maxPxPerFrame` na 40 i pusti ponovo —
  automatika će ga uhvatiti.
- **`deviceScaleFactorByVariant.case: 2` nije testiran.** Svih 6 projekata je `variant: "card"`,
  pa je svuda korišćen dsf 1. `case` grana će se prvi put izvršiti kad neki projekat dobije
  `variant: "case"`. Kod baca grešku ako varijanta fali u configu, umesto da tiho uzme 1.
- **`jeveux-travel` i dalje čeka URL.** `enabled: false`, deploy vraća 404.
- **~223 MB frejmova.** `showcase/captures/` je u `.gitignore`, ali pazi na disk pre KORAK 2.
- **Nisam dirao `stops`.** Sva tri stopa (0.0 / 0.5 / 1.0) su ostala kako su bila na svim
  projektima; menjao sam samo opseg unutar kog se mapiraju.
