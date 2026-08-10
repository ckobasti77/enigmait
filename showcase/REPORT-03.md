# REPORT-03 — Pravi podaci o projektima i uklanjanje izmišljenog sadržaja

Datum: 2026-08-11
Menjani fajlovi: `constants/projects.ts` (nov), `app/(pages)/projects/page.tsx`, `lib/i18n.ts`,
ovaj izveštaj. Capture i encode skripte, `showcase.config.json` i frejmovi nisu dirani.

## Tabela po projektu

Svih šest ima kompletan set medija u `public/showcase/<id>/` (`card.mp4`, `card.webm`,
`card-sm.mp4`, `card-sm.webm`, `poster.webp`) — proveren je disk, nije pretpostavljeno iz
REPORT-02. `media` je zato postavljen na svih šest, `null` nije upotrebljen ni jednom.
Kartice ga još ne koriste; to je KORAK 4.

| Projekat | Tag | Scope | Media | Izvor teksta |
|---|---|---|---|---|
| `lady-gaga-studio` | Lepota i nega | Web sajt · Web-shop · Galerija pre i posle · Upit za termin | ✅ | `content.txt` (title, meta description, telo: tretmani, cene i stanje zaliha, „PRE/POSLE" komparator) + `notes` (Šabac, web-shop, komparator) |
| `ablux-travel` | Turizam | Web sajt · Katalog aranžmana · Srpski i engleski · Forma za upit | ✅ | `content.txt` (verski turizam, letovanja, rent-a-bus, „Pošalji upit", SR/EN prekidač) + `notes` (dvojezično, nema banner) |
| `gbmt` | Video nadzor i iskopi | Web sajt · Stranica po delatnosti · Kontakt stranica | ✅ | `content.txt` (title „Lider u Video Nadzoru i Iskopnim Radovima", nav: Video nadzor / Iskopi / Kontakt, „flota bagera") + brief |
| `the-original-way` | Moda | Web-shop · Katalog i korpa · Srpski i engleski · Svetla i tamna tema | ✅ | `content.txt` (korpa i „NASTAVI NA PLAĆANJE", „Switch to English", „Promeni temu", „Manje stvari. Bolje izabranih.") |
| `fides-gradnja` | Građevinarstvo | Web sajt · Galerija radova · Ponuda nekretnina · Kontakt stranica | ✅ | `content.txt` (nav: O NAMA / GALERIJA / NEKRETNINE / KONTAKT, „nekretnine kroz sopstvene investicije") |
| `digist` | Digitalni marketing | Web sajt · Predstavljanje usluga · Sadržaj na engleskom · Kontakt forma | ✅ | `content.txt` (ceo sajt na engleskom, „your hotel, restaurant, or café", sekcije Services / About / Team) |
| `jeveux-travel` | — | — | — | NIJE NA STRANICI — `enabled:false`, URL 404 (REPORT-01) |

Nijedan opis ne sadrži procenat, rok, broj korisnika ni bilo koji drugi broj. Nemamo pristup
analitici nijednog od ovih sajtova, pa bi svaki broj bio nepotkrepljen.

## Spisak tvrdnji koje su ostale na stranici, a ne mogu se dokazati iz repoa

Ovo je kontrolna lista za ujutru. Ništa ovde nije izmišljen podatak — to su tvrdnje koje
može da potvrdi samo čovek koji zna kako je posao išao.

**Autorstvo (nosi celu stranicu).**
1. „Sajtovi koje smo izradili" i celokupan `scope` svakog projekta tvrde da je Enigma
   izradila tih šest sajtova. U repou ne postoji nikakav dokaz autorstva — samo
   `showcase.config.json` u kom su navedeni kao naši. Ako neki od njih nije naš rad ili je
   bio samo delimičan (npr. samo dizajn, bez izrade), to mora da se ispravi pre objave.
2. `scope` stavke tvrde i **šta je od toga bio naš posao**. Ja sam ih izveo iz onoga što
   sajt vidljivo radi, ne iz ugovora. Sajt ima web-shop — to ne znači automatski da smo mi
   radili web-shop.

**Adrese.**
3. „adresa vodi na sajt uživo" i „Šest projekata koje možete otvoriti i proveriti": tri
   projekta (`the-original-way`, `fides-gradnja`, `digist`) stoje na `*.vercel.app`
   adresama. One su odgovarale u vreme capture-a (REPORT-01), ali `vercel.app` adresa nije
   nužno produkcioni sajt klijenta. Ako klijent ima svoj domen, treba upisati njega; ako
   je reč o demo deploy-u, tvrdnja „sajt uživo" je preterana.
4. `jeveux-travel` je i dalje 404. Nije na stranici, ali ako je to naš rad, sada nedostaje.

**Nedovoljno proverene `scope` stavke** (ostalo je proverljivo iz `content.txt`):
5. `lady-gaga-studio` → „Upit za termin". Sajt ima dugmad „Zakaži termin" i „Rezerviši glam
   termin", ali iz izvučenog teksta se ne vidi da li iza njih stoji forma, kalendar ili
   samo telefon. Namerno sam izbegao „Zakazivanje termina", koje bi tvrdilo sistem za
   rezervacije.
6. `digist` → „Kontakt forma". Sajt kaže „feel free to send us a message" i ima dugme
   „Contact"; da li je iza njega forma ili `mailto:` nisam mogao da utvrdim.

**Obećanja o načinu rada** (nisu tvrdnje o prošlosti, ali ih neko mora stajati iza):
7. „Postavljamo sajt, predajemo pristupe i ostajemo dostupni za izmene, dopune i sadržaj
   koji stiže kasnije."
8. „Vraćamo se sa predlogom opsega posla, rokom i cenom."
9. „Prvo razumemo posao i ljude koji na sajt dolaze…" — opis procesa, ne dokaz.

**Van `/projects`, ali u istoj kategoriji problema** (nisam menjao, van je opsega KORAK-a 3):
10. `app/(pages)/services/page.tsx`: `30+ Isporučena lansiranja`, `8 wks Prosečna isporuka`,
    `98% Zadržavanje klijenata`.
11. `constants/services/*.ts`, po četiri statistike na svakoj od šest stranica usluga:
    `95% Usklađenost stakeholder-a`, `3x Rast prepoznatljivosti`, `99.5% Sesije bez pada`,
    `4.8 Prosečan rast ocene`, `+40% Prosečan rast konverzije`, `+18 NPS poeni`,
    `5x Rast angažovanja`, `2x Rast pratilaca` i tako dalje — ukupno 24 broja istog tipa
    kao tri koja sam upravo skinuo sa `/projects`. Neki su formulisani kao *cilj*
    („Cilj rasta saobraćaja", „Cilj performansi"), što je pošteno; većina nije.
12. `lib/i18n.ts:1263` — `["VP Product, Northwind Ventures", …]`, mrtav unos iz nekog
    ranijeg čišćenja. Nijedna komponenta ga ne koristi; nisam ga dirao jer nije nastao iz
    moje izmene.

## Šta je uklonjeno i zašto

- **Četiri izmišljena case study-ja** (Helios Labs, Orbit Airlines, Northwind Bank,
  Mercury Collective) — zamenjena sa šest stvarnih projekata iz `constants/projects.ts`.
- **Cela sekcija sa utiscima klijenata** (Amelia Rhodes, Jonas Richter) — obrisana, bez
  zamene i bez praznog stanja. Izmišljena osoba sa imenom, prezimenom i funkcijom je
  najteži oblik ovog problema i nema poštenu zamenu dok ne stigne stvarna izjava.
- **Sve tri statistike** (+120% / 12 / 97%) — ceo blok obrisan. Nisam zadržao „6 projekata"
  kao zamenski broj: kartice su odmah ispod i mogu da se prebroje, pa bi to bila dekoracija,
  a ne dokaz.
- **Prateći copy koji je tvrdio neproverljivo**: „Dokazana isporuka", „Product priče
  projektovane za merljive ishode", „Specijalizovani smo za lansiranja gde su ulozi visoki",
  „Svaki angažman isporučuje merljivo pre i posle", „Kompletna biblioteka case study-ja
  dostupna je na zahtev" (ne postoji), „Zatražite kompletan deck" (ne postoji),
  „Planirate lansiranje visokog uloga?", „dokazi iz sličnih lansiranja".
- **`metadata.description` stranice** — tvrdila je „SaaS, travel, fintech i retail
  lansiranja" i biblioteku case study-ja; sada nabraja šest stvarnih delatnosti.
- **Sekcija „Kako gradimo"** (Discovery sprintovi / Prototip scena / Operacije lansiranja) —
  zadržana kao sekcija, prepisana u „Kako radimo". Stari tekst nije izmišljao brojeve, ali
  je opisivao „service blueprinting", „motion studije" i „engineering spike-ove", što ne
  odgovara poslu koji stoji na ovoj istoj stranici. Struktura, ikone i klase su netaknute.
- **Iz `lib/i18n.ts`**: uneti parovi za svu novu kopiju; obrisani parovi izmišljenih case
  study-ja, izjava i funkcija, kao i `["Average traffic growth", …]` i
  `["Markets launched", …]`, koje je moja izmena ostavila bez korisnika.

## Odluke koje sam doneo sam

**1. Dirao sam `lib/i18n.ts`, iako nije u spisku fajlova iz brief-a.**
Sajt je dvojezičan i `LanguageProvider` prevodi cele tekstualne čvorove preko rečnika. Bez
novih `[en, sr]` parova, `/projects` na engleskom bi ostao na srpskom — nova kopija bi
izgledala kao regresija, a stari parovi bi visili mrtvi. Ovo smatram delom iste izmene,
ne proširenjem opsega. Provereno u pravom browseru: prekidač EN prevodi sve — naslove,
tagove, opise, `scope` pilule i CTA pasuse.

**2. Ostavio sam `md:grid-cols-2` za šest kartica.**
Brief traži da proverim da raspored diše. Tri kolone bi na `xl` svela media pane na oko
380px širine, a on je `16/10` i u KORAK-u 4 dobija video enkodovan na 1440×900 — sitna
slika bi obesmislila ceo capture. Šest kartica u dve kolone su tri reda, što je normalan
portfolio ritam. Raspored nisam menjao ni na jednom breakpoint-u.

**3. Dodao sam adresu sajta kao link na kartici.**
Ovo je jedini strukturni dodatak. Pošto sa stranice izlaze svi brojevi, karticama je ostao
samo opis — a jedini dokaz koji stvarno imamo jeste da sajt postoji i da se može otvoriti.
Link je diskretan (`font-accent`, `text-theme-muted`, hover cyan), koristi postojeće
theme klase i stoji u dnu tela kartice, van media pane-a — dakle ne sudara se sa videom
ni mikro-potpisom iz KORAK-a 4. `target="_blank" rel="noreferrer"`.

**4. `scope` pilule su nove, ali koriste postojeći jezik kartice.**
Iste su kao tag pilula, samo bez cyan boje (`text-theme-muted`), da tag ostane
prepoznatljiv kao delatnost, a scope se čita kao lista. Nema novih boja ni radijusa.

**5. Zadržao sam `category` polje iako ga stranica ne koristi.**
Predloženo je u brief-u i preslikava `category` iz `showcase.config.json` jedan-na-jedan.
Svih šest je `"web"`. Da nije bilo u brief-u, izbacio bih ga kao spekulativno.

**6. Nisam preuzeo „100+ PROJEKATA" sa sajta Fides Gradnje.**
To je klijentova tvrdnja o sebi, na njihovom sajtu. Doslovno stoji u `content.txt`, pa bi
po slovu pravila smela da se prenese, ali prepisana na naš sajt čita se kao naš dokaz —
a mi je ne možemo potkrepiti. Isto važi za „Godina osnivanja: 2022" kod ABLux-a i
„Dostava za 48h" kod Studija Lady Gaga: ničiji tuđi broj nije ušao u kopiju.

**7. `summary` piše šta sajt radi za biznis, tehnologija je izostavljena u potpunosti.**
Ni jedan opis ne pominje framework. Ono što se moglo utvrditi iz `notes` (SSR vs CSR,
Lenis, Next.js) izostavljeno je namerno: klijentu koji bira agenciju to ne znači ništa, a
u `scope` ne spada jer nije isporučena stavka.

**8. „Kontakt" kao `scope` stavka je preimenovan u „Kontakt stranica" / „Kontakt forma".**
Reč „Kontakt" već postoji u rečniku kao prevod za „Contact Us" (navigacija), a srpska
strana je ključ mape — drugi unos bi tiho pregazio prvi. Preciznije ime rešava i koliziju
i neodređenost.

## Verifikacija

- `npx tsc --noEmit` — prolazi, bez izlaza.
- `npm run lint` — 0 grešaka. Ostaje jedno **postojeće** upozorenje u
  `scripts/encode-showcase.mjs:60` (`'label' is defined but never used`); skripte nisam
  dirao po brief-u.
- `npm run build` — prolazi, `/projects` se i dalje prerenderuje statički.
- Provera rečnika skriptom: 1218 parova, nijedan duplikat ključa nije nastao mojom
  izmenom. Postoji 18 **ranije postojećih** duplikata (npr. „Politika privatnosti" ↔
  `Privacy policy`/`Privacy Policy`, „Community management", „Let's define your roadmap") —
  nisam ih dirao, ali vredi znati da kod njih poslednji unos tiho pobeđuje.
- Playwright, pravi browser, `/projects` na 1440×900: šest kartica se iscrtava, tekst se
  otkriva reč po reč kad uđe u viewport (site-wide reveal radi na novoj kopiji), pilule i
  linkovi stoje. Jedina greška u konzoli je `favicon.ico 404`, postoji i pre izmene.
- U posluženom HTML-u nema više nijednog pojavljivanja stringova `Helios`, `Orbit`,
  `Northwind`, `Mercury`, `Amelia`, `Jonas`, `+120%`.

## Na šta da obratiš pažnju

- **Tačka 1 i 2 sa kontrolne liste su blokada za objavu.** Sve ostalo je kozmetika u
  poređenju sa pitanjem da li smo mi zaista izradili tih šest sajtova i u kom obimu.
- **Stranica je sada kraća za dve sekcije.** Tako je i planirano („bolje kraća iskrena
  stranica"), ali vizuelno se to najviše vidi u hero-u, koji je ostao bez trake sa
  statistikama. Ako deluje prazno, prostor treba popuniti nečim proverljivim (npr. logotipi
  klijenata koji su dali saglasnost), ne novim brojevima.
- **24 statistike na stranicama usluga su isti problem, samo na drugom mestu.** Ako se
  `/projects` čisti zato što izmišljeni brojevi ne smeju napolje, `/services` i šest
  stranica usluga traže isti prolaz. To je zaseban zadatak i nisam ga započinjao.
- **Media je upisana, ali se ne koristi.** `constants/projects.ts` već pokazuje na svih
  30 fajlova; kartica i dalje prikazuje dizajnirani cover sa monogramom. KORAK 4 samo
  treba da pročita `project.media`.
