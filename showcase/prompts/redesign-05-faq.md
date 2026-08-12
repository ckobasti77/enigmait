⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-sonnet-5 · EFFORT: medium · MODE: bypassPermissions (autonomno — bez plan/goal, bez odobrenja)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 05/07 na grani feat/redesign-clean.

Detaljan spec: `enigma-claude-code-promptovi.md` (root) — sekcija **PROMPT 4**. Vizuelna referenca:
`enigma-proto.html` (root), sekcija „04". Pročitaj `app/(pages)/services/_components/ServiceFaq.tsx`.

═══ TVRDA PRAVILA ═══
NE push, NE deploy — samo lokalno na grani feat/redesign-clean. Ne diraj main ni početnu. Pozadina ista;
GLOW OSTAJE. Zadrži pristupačan collapse (grid 0fr/1fr, aria-expanded/aria-controls). i18n: tekst u blok
elementima. prefers-reduced-motion poštovan. TS bez `any`. AGENTS.md: minimalne, hirurške izmene.

PREDUSLOV: ako postoji `components/ui/card.tsx` (korak 03), omotač FAQ-a neka bude <Card>. Ako ne postoji,
stiliši dosledno inline (plavi border + cyan hairline) i zapiši u izveštaj.

═══ ZADATAK 05 — FAQ redizajn (kompaktno, u sistemu) ═══
Po PROMPT 4: FAQ u istom jeziku kao kartice — plavi border, cyan hairline gore, „+" koji se rotira u „×",
aktivna stavka naslov u plavoj (--primary). Kratko: prva otvorena, ostale zatvorene. Ne dupliraj logiku
— ista ServiceFaq komponenta (bilo da živi unutar service panela iz koraka 04 ili kao zasebna kompaktna
sekcija).

VERIFIKACIJA (obavezno pre commit-a): `npm run build` i `npm run lint` prolaze; pristupačnost očuvana
(tastatura, aria, focus-visible).
- Ako prolazi: `git add -A && git commit -m "feat(faq): kompaktan FAQ u sistemu (plavi border + trace jezik)"`.
- Ako NE prolazi: vrati sve izmene ovog koraka (`git restore .` pa `git clean -fd` za tvoje nove fajlove),
  ostavi stablo čisto, zapiši uzrok u izveštaj, završi uredno.

IZVEŠTAJ: `showcase/redesign/REPORT-05.md` (urađeno, fajlovi, build/lint, preskočeno + zašto).
