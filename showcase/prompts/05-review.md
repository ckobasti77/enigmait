# KORAK 5 — Neprijateljski review, vizuelna verifikacija i commit

Radiš u repou `enigma-digital`. Ovo je poslednji korak automatskog, nenadgledanog lanca.
Niko ti neće odgovoriti na pitanje. Ne staj i ne traži potvrdu.

Tvoj posao NIJE da potvrdiš da je sve u redu. Tvoj posao je da nađeš šta nije, popraviš to,
i ono što ne možeš da popraviš jasno napišeš čoveku koji ujutru otvara laptop.

## Prvo: šta se uopšte desilo

Pročitaj `showcase/REPORT-01.md` do `REPORT-04.md`. Ako neki od njih ne postoji, taj korak nije
odrađen — zabeleži to i radi sa onim što jeste. Nemoj da pokušavaš da odradiš ceo propali korak
ispočetka ako je obiman; uradi ono što se realno može i jasno napiši šta je ostalo.

**Ne veruj izveštajima na reč.** Za svaku tvrdnju u njima proveri artefakt: ako izveštaj kaže da
je video enkodovan, proveri da fajl postoji i da ima sadržaj; ako kaže da su izmišljeni podaci
uklonjeni, pretraži repo za `Helios`, `Orbit Airlines`, `Northwind`, `Mercury Collective`,
`Amelia Rhodes`, `Jonas Richter`, `+120%`, `97%`. Nula pogodaka je jedini prolaz.

## Tehnička provera

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Sve tri moraju da prođu. Ako nešto pukne — popravi pa ponovi. Ovo je uslov bez kog se ne završava.

## Vizuelna verifikacija — obavezno gledaj slike, ne samo da ih napraviš

Pusti `npm run dev` i Playwright-om otvori `/projects`. Prvo pronađi kako se na ovom sajtu
menjaju tema i jezik (postoje `ThemeSwitcher`, `MoodToggle` i `LanguageSwitcher` u
`app/_components/`) i nauči da ih klikneš iz testa.

Napravi screenshotove u `showcase/review/` za sve kombinacije:
- tema: tamna i svetla
- jezik: srpski i engleski
- viewport: 1440x900 i 390x844

To je osam slika. **Otvori i pogledaj svaku.** Za svaku proveri:

1. Da li se kartice iscrtavaju i da li snimak sajta izgleda kao stvaran sadržaj, a ne kao
   crna/bela mrlja, prazan pravougaonik ili razvučena slika.
2. Da li media pane radi u OBE teme. Podsetnik: `ladygagastudio` je krem-svetli sajt,
   `gbmt` je taman. Ako u svetloj temi bilo gde ispadne crn pravougaonik, to je greška.
3. Da li mikro-potpis izgleda diskretno ili smeta.
4. Da li je raspored sa šest kartica i dalje uravnotežen, i na mobilnom i na desktopu.
5. Da li je ostao ijedan trag izmišljenog sadržaja.

Zatim proveri i ponašanje:
- `document.querySelectorAll("video")` pri otvaranju stranice bez skrolovanja — nijedan ne sme
  da ima postavljen `src` niti da bude u stanju reprodukcije. Ovo je tvrd zahtev iz koraka 4.
- Preko mrežnog panela potvrdi da se pri prvom učitavanju `/projects` ne povlači nijedan
  `.mp4` ni `.webm`. Zabeleži koliko se bajtova stvarno povuče.
- Skroluj do kartica i potvrdi da video krene, pa skroluj dalje i potvrdi da se pauzira.
- Pročitaj konzolu — nijedna greška ne sme da ostane. Upozorenja izlistaj.
- Uključi `prefers-reduced-motion` i potvrdi da nijedan video ne dobije `src`.

## Popravi šta nađeš

Sve što možeš da popraviš bez redizajna — popravi, pa ponovi verifikaciju za taj deo.
Držiš se `AGENTS.md`: hirurške izmene, bez uređivanja koda koji nije u problemu.

Ako nešto zahteva ljudsku odluku (npr. tekst kartice zvuči loše, ili neki sajt jednostavno
ne izgleda dobro u snimku), NE odlučuj sam o dizajnu — opiši problem, predloži dve opcije,
i ostavi kako jeste.

## Commit

Na kraju:

```
git checkout -b feat/project-showcase
git add -A
git commit
```

Poruka commit-a neka opiše šta je urađeno kroz sve korake, u nekoliko redova.
**Nemoj da radiš `git push`.** Nemoj da diraš `main`. Nemoj da deploy-uješ.

## Finalni izveštaj

`showcase/REPORT-FINAL.md`, na srpskom, napisan za čoveka koji ovo čita uz prvu kafu i nije
pratio nijedan korak. Redosled:

1. **Stanje u jednoj rečenici** — da li je gotovo i može li da ide u produkciju.
2. **Šta je urađeno**, kratko, po koracima.
3. **Šta je puklo** i šta si popravio.
4. **Šta traži tvoju odluku** — numerisana lista, svaka stavka sa opisom i dve predložene opcije.
5. **Kontrolna lista neproverljivih tvrdnji** koje su ostale na sajtu (iz REPORT-03).
6. **Brojke**: veličina stranice pri učitavanju, veličina video assetа u repou, rezultat
   lint/tsc/build, broj screenshotova i gde su.
7. **Šta dalje** — konkretni sledeći koraci, uključujući da `jeveux-travel` čeka ispravan URL
   i da mobilne frame-sekvence stoje neiskorišćene za buduće case study stranice.

Budi iskren. Ako nešto izgleda loše, napiši da izgleda loše. Izveštaj koji sve proglasi
uspehom je bezvredan.
