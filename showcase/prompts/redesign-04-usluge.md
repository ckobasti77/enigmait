⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-opus-5 · EFFORT: xhigh · MODE: bypassPermissions (autonomno; interni plan pre koda — vidi sekciju „PRVO NAPIŠI PLAN")

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 04/07 na grani feat/redesign-clean. OVO JE NAJSLOŽENIJI KORAK.

Detaljan spec: `enigma-claude-code-promptovi.md` (root) — sekcija **PROMPT 3**. Vizuelna referenca:
`enigma-proto.html` (root), sekcija „03" (push/infinite/keyboard logika, `.arrow` stil). Obavezno prvo
pročitaj: ServicePageTemplate.tsx i sve Service*.tsx, sve app/(pages)/services/<slug>/page.tsx (server
komponente sa metadata + JSON-LD), constants/services/*, constants/disciplines.ts (DISCIPLINE_ORDER,
disciplineHref).

═══ TVRDA PRAVILA (nikad ne krši) ═══
NE push, NE deploy — samo lokalno na grani feat/redesign-clean. Ne diraj main ni početnu. Pozadina ista;
GLOW OSTAJE (ambijentalni + reveal glow, isti fazon kao početna) — NE skidaj glow; „čišćenje" je manje
SEKCIJA i SADRŽAJA. NE diraj SEO: <slug>/page.tsx ostaju server komponente sa metadata + JSON-LD.
Poštuj i18n (tekst u blok <span>), prefers-reduced-motion (=> trenutna zamena bez klizanja), TS bez `any`.
AGENTS.md: minimalne, hirurške, ništa spekulativno.

PREDUSLOV: ako postoje `components/ui/trace-button.tsx`/nova CtaButton (korak 02) i `components/ui/card.tsx`
(korak 03) — koristi ih. Ako NE postoje (raniji korak pao), stiliši dosledno inline u istom jeziku i to
zapiši u izveštaj.

═══ PRVO NAPIŠI KRATAK PLAN, PA KODIRAJ ═══
Na početak `showcase/redesign/REPORT-04.md` upiši 5–8 linija plana (koje fajlove praviš/menjaš, kako radi push +
infinite loop + URL sync, kako čuvaš SEO). Zatim implementiraj po tom planu.

═══ ZADATAK 04 — Usluge: sažmi + beskonačan carousel ═══
- Napravi CLIENT komponentu `app/(pages)/services/_components/ServiceCarousel.tsx`: učita sve servicePages
  i DISCIPLINE_ORDER; prima initialSlug; fiksne strelice na ivicama ekrana (vertikalno centrirane),
  dots, i tasteri ← →; next/prev preko modula (beskonačno, oba smera); PUSH animacija (incoming gura
  tekući, kao two-slide track u prototipu); URL sync preko `window.history.replaceState(disciplineHref(next))`
  BEZ Next rutiranja usred animacije; reduced-motion => trenutna zamena; mobilni => swipe + stack fallback.
- ServicePageTemplate.tsx renderuje `<ServiceCarousel initialSlug={slug} />` umesto 8 sekcija.
- KOMPAKTAN PANEL (isti izvor: servicePages[slug]): 8 sekcija -> jedan panel ~1 ekran. Zadrži samo:
  naslov + kratak lede + 1 CTA + ServiceModelStage 3D desno; 3 kratka proof broja; do 3 capability stavke.
  Izbaci kao velike sekcije: ProofStrip/Differentiators/Deliverables/Process (proces max 3 sitna koraka)
  i ServiceFinalCta prev/next (carousel je zamenjuje). GLOW OSTAJE — panel je čist ali „živ".
- PERFORMANSE: lazy-mount ServiceModelStage samo za AKTIVNU uslugu (i eventualno susede), ne svih 6.

VERIFIKACIJA (obavezno pre commit-a): `npm run build` i `npm run lint` prolaze; strelice fiksne + tasteri
+ dots rade; beskonačno u oba smera; push animacija; URL se ažurira; direktan load /services/<slug> radi i
zadržava metadata/JSON-LD; stranica je osetno kraća; reduced-motion i mobilni rade.
- Ako prolazi: `git add -A && git commit -m "feat(services): kompaktan panel + beskonačan carousel sa fiksnim strelicama"`.
- Ako NE prolazi posle razumnog truda: vrati SVE izmene ovog koraka (`git restore .` pa `git clean -fd` za
  tvoje nove fajlove), ostavi stablo čisto i staru stranicu netaknutu, detaljno zapiši šta je zapelo u
  izveštaj, i završi uredno (da lanac nastavi). Bolje čisto staro nego slomljeno novo.

IZVEŠTAJ: `showcase/redesign/REPORT-04.md` (plan na vrhu + urađeno, fajlovi, build/lint, preskočeno + zašto).
