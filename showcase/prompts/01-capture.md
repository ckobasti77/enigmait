# KORAK 1 — Popravke capture-a i snimanje svih projekata

Radiš u repou `enigma-digital` (Next.js 16, React 19, Tailwind v4, TS, App Router, GSAP, Lenis, Three.js).
Ovo je automatski, nenadgledan rad. Niko ti neće odgovoriti na pitanje — donosi odluke sam,
zapiši ih u izveštaj na kraju i nastavi. Ne staj i ne traži potvrdu.

Pročitaj prvo `AGENTS.md` i drži ga se, posebno "Surgical Changes" i "Simplicity First".
Menjaš SAMO: `scripts/capture-showcase.mjs`, `showcase/showcase.config.json`, i pišeš `showcase/REPORT-01.md`.
Ne diraj komponente, ne diraj `app/`, ne radi HyperFrames.

## Kontekst

`scripts/capture-showcase.mjs` i `showcase/showcase.config.json` već postoje i rade.
Snimaju determinističku frame-sekvencu skrola sa živog sajta. Te sekvence kasnije postaju
video u media pane-u kartica na `app/(pages)/projects/page.tsx` (aspect 16/10).

Verifikovano je da rade: 270 frejmova po varijanti, cookie detekcija radi, pauziranje
`<video>` elemenata radi, sanity check na prvom frejmu radi. Tri stvari treba popraviti.

## FIX 1 — Brzina skrola (najvažnije)

Problem: `ladygagastudio` ima maxScroll 12655px na desktopu i 18067px na mobilnom. Preko
9 sekundi to je ~70px po frejmu na desktopu i ~100px na mobilnom — prebrzo da se išta vidi.
`gbmt` je 1948px i izgleda tačno kako treba. Fiksno trajanje ne može da opsluži oba.

Uvedi po projektu opciono polje `"journey": { "from": 0, "to": 0.55 }`, kao udeo ukupnog
maxScroll-a. Kad postoji, sve `at` vrednosti u `stops` mapiraju se UNUTAR tog opsega, ne
preko cele stranice. Podrazumevano `{ from: 0, to: 1 }`, pa se ponašanje ne menja tamo gde
nije zadato.

Dodaj u `defaults` polje `"maxPxPerFrame": 45`. Posle izgradnje track-a izračunaj najveći
pomeraj između dva susedna frejma. Ako prelazi prag:
- ispiši glasno upozorenje sa izmerenom vrednošću,
- izračunaj i primeni `to` vrednost koja se uklapa u prag (zaokruži naniže na 0.05),
- upiši u `meta.json` i izmerenu vrednost, i prag, i primenjeni `to`, pod ključem `journeyAdjusted`.

Dakle ovde SMEŠ da skratiš automatski, ali nikad tiho — svako skraćivanje mora da bude i u
logu i u meta.json i u izveštaju.

Za `lady-gaga-studio` upiši u config `"journey": { "from": 0, "to": 0.5 }` pre snimanja.
Za ostale projekte pusti automatiku i prijavi mi šta je odabrala.

## FIX 2 — Trajni UI elementi u kadru

Cookie banner se sklanja, ali ostaju widgeti koji se peku u svaki frejm:
- `ladygagastudio`: "PRIVATNOST" pilula, donji levi ugao
- `gbmt`: kružno dugme za povratak na vrh, donji desni ugao

Dodaj po projektu polje `"hideSelectors": []` i pre snimanja injektuj tim selektorima
`display: none !important`. Nađi prave selektore za ova dva i upiši ih u config.
Za svaki od preostalih sajtova otvori stranicu, potraži slične trajne widgete (chat baloni,
back-to-top, newsletter pop-up, "powered by" značke, live-chat), upiši selektore u config i
navedi ih u izveštaju.

## FIX 3 — deviceScaleFactor po varijanti

U kodu je `const DEVICE_SCALE_FACTOR = 1` sa komentarom da kartica 16:10 ionako ne prikaže više.
Za `card` varijantu je to tačno i ostaje. Za `case` varijantu, koja ide skoro punom širinom,
nije dovoljno. Ukloni hardkodovanu konstantu i čitaj iz configa:

```json
"deviceScaleFactorByVariant": { "card": 1, "case": 2 }
```

Config je izvor istine. Kod ne sme tiho da protivreči config fajlu.

## FIX 4 — Izvuci tekstualni sadržaj svakog sajta

Ovo je novo i biće korišćeno u kasnijem koraku za pisanje teksta kartica.
Tokom pripreme stranice (posle učitavanja, pre snimanja), na desktop varijanti izvuci i
snimi u `showcase/captures/<id>/content.txt`:

- `document.title`
- sadržaj `meta[name="description"]`
- `document.body.innerText`, očišćen od višestrukih praznih redova, ograničen na 8000 karaktera

Ovo je jedini izvor iz kog će se pisati opisi projekata, pa neka bude čitljivo.

## ZATIM — snimi sve

Pusti capture za svih 6 aktivnih projekata iz configa. `jeveux-travel` je `enabled: false`, preskoči ga.

VAŽNO ZA IZVRŠAVANJE: pokreći capture **po jednom projektu**, jednu bash komandu po projektu
(`npm run capture -- --project=<id>`), nikad sve odjednom. Jedan projekat traje nekoliko minuta;
sve odjednom bi moglo da probije timeout bash komande i da izgubiš ceo posao.

Za tri client-side renderovana sajta — `gbmt`, `fides-gradnja`, `digist` — obavezno potvrdi da
frejm 1 nije prazna stranica. Ako jeste, produži čekanje i probaj ponovo, najviše dva puta,
pa prijavi neuspeh za taj projekat i pređi na sledeći. Ne zaglavljuj se.

Ako neki projekat padne, zabeleži i nastavi sa ostalima. Bolje pet od šest nego nula.

## Izveštaj

Napiši `showcase/REPORT-01.md`, na srpskom, sa tabelom po projektu:
- maxScroll desktop i mobile
- da li je `maxPxPerFrame` prekoračen, sa izmerenom vrednošću, i koji je `journey` primenjen
- pronađeni cookie selektor
- pronađeni `hideSelectors`
- broj frejmova, veličina na disku
- da li je `content.txt` uspešno izvučen
- status: OK ili opis greške

Na kraju izveštaja: sve odluke koje si doneo sam, i sve na šta treba da obratim pažnju.
