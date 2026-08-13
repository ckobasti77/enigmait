⚙ PODEŠAVANJA: MODEL: claude-opus-5 · EFFORT: high · MODE: bypassPermissions (autonomno)

Radiš NOĆU, AUTONOMNO. Repo "enigma-digital" (Next.js+React+TS+Tailwind+GSAP). KRUG 2, KORAK 02/12,
grana feat/redesign-round2.

TVRDA PRAVILA: NE push, NE deploy — samo lokalno na feat/redesign-round2. Pozadina ista; GLOW OSTAJE.
Novi CSS token → u SVE 3 palete u globals.css (:root svetla, .dark tamna, html[data-mood="alt"] matrix).
Sačuvaj postojeće varijante (liquid-glass look="glass", "enigma"). Poštuj prefers-reduced-motion, TS bez any.
AGENTS.md: minimalne hirurške izmene.
Round-1 koje koristiš: components/ui/trace-button.tsx (+ tokeni --cta-line/--cta-sweep, blok .trace-cta u
globals.css), components/ui/cta-button.tsx. Prvo otvori te fajlove + Navbar/NavLinks/LanguageSwitcher.

═══ ZADATAK 02 — CTA puls + ujednačen radius + nav/switcher usklađivanje + ghost vidljivost ═══

1) CTA — hover animacija postaje STALNI LAGANI PULS u loop-u (ne samo na hover, ne brzo):
   - Primarni trace CTA u miru „diše": spor, nežan puls glowa/rima (npr. ~3.2s ease-in-out infinite;
     blago pulsira box-shadow/rim opacity ili --cta-sweep pozicija VEOMA sporo). Nije brzi sweep — „lagano pulsira".
   - Hover ostaje kao blago pojačanje (jači glow / -translateY), ali osnovni puls postoji i bez hovera.
   - prefers-reduced-motion: BEZ pulsa (statičan rim + glow stanje, bez kretanja).

2) UJEDNAČEN RADIUS: uskladi radius glavnih elemenata sa CTA dugmetom (CTA je 14px = rounded-xl).
   - Kartice (components/ui/card.tsx, rounded-[16px]), nav „ostrvo", language switcher, paneli → isti ugao (14px).
   - Najbolje kroz jedan zajednički token/util da bude jedan izvor istine; ne lomi layout.

3) NAV „OSTRVO" + LANGUAGE SWITCHER borderi → u isti jezik kao CTA:
   - Nav ostrvo (kontejner nav linkova) kad smo na vrhu, i language switcher (i na vrhu i kad je skrolovano):
     plavi rim var(--cta-line) + isti nežni puls kao CTA. Kad se skroluje i nav se promeni, primeni dosledno
     (usklađeno stanje u obe faze). Zadrži čitljivost i postojeću pozadinu.

4) SEKUNDARNA (ghost) CTA malo vidljivija: u trace-button.tsx secondary varijanti pojačaj kontrast u miru
   (npr. rim var(--cta-line) umesto --border-soft, tekst malo svetliji) — vidljivije, ali i dalje ispod primarne.

VERIFIKACIJA (pre commit-a): npm run build + npm run lint (+ tsc ako ide) prolaze; puls radi lagano u loop-u;
reduced-motion bez pulsa; radius usklađen; nav+switcher u jeziku CTA; ghost vidljiviji; look="glass" i dalje radi.
- Prolazi: `git add -A && git commit -m "feat(cta,nav): lagani puls CTA, ujednačen radius, nav/switcher u CTA jeziku, vidljiviji ghost"`.
- Ne prolazi: `git restore .` + `git clean -fd` (samo tvoji novi fajlovi), stablo čisto, zapiši uzrok, exit uredno.

IZVEŠTAJ: `showcase/redesign-round2/REPORT-02.md` (urađeno, fajlovi, build/lint, preskočeno + zašto).
