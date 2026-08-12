⚙ PODEŠAVANJA (runner ih postavlja preko CLI flagova; ovde radi jasnoće):
   MODEL: claude-fable-5 · EFFORT: xhigh · MODE: bypassPermissions (autonomno — review + izveštaj, bez push/deploy)

Radiš NOĆU, AUTONOMNO (bypassPermissions), bez čoveka. Projekat Next.js+React+TS+Tailwind+GSAP
"enigma-digital". KORAK 07/07 (ZAVRŠNI) na grani feat/redesign-clean. Ovaj korak se pušta UVEK — i ako je
neki raniji pao — da ujutru postoji jasan izveštaj.

═══ TVRDA PRAVILA ═══
NE push, NE deploy NIŠTA (bez `git push`, bez `vercel`, bez `npx convex deploy`). Samo lokalno.
Ne diraj main. Ne meni funkcionalnost — ovo je review + verifikacija + izveštaj (dozvoljene su samo sitne
popravke build/lint grešaka ako ih lako rešiš).

═══ ZADATAK 07 — Review, verifikacija, REPORT-FINAL ═══
1) Verifikacija koda:
   - `npm run build`, `npm run lint`, i ako postoji `npx tsc --noEmit`. Zabeleži rezultat svakog.
   - Ako je nešto lako slomljeno (import, tip, sitnica) i sigurno je popraviti — popravi, pa ponovo build.
     Ako je veće — NE diraj, samo detaljno zabeleži u izveštaj kao „za jutarnji pregled".
2) Vizuelna provera (samo ako je Playwright/browser dostupan lokalno; ako nije, preskoči i zapiši to):
   - `npm run dev` na slobodnom portu; screenshot početne, /services, /projects u OBE teme (svetla/tamna)
     i, ako je lako, oba jezika; sačuvaj u `showcase/redesign/review/`. Zatim ugasi dev server.
   - Proveri očima: pozadina ista, glow/reveal prisutan (isti fazon kao početna), stranice kraće/čistije,
     dugmad = trace varijanta, carousel strelice fiksne.
3) Provere principa: pozadina nije menjana; GLOW zadržan; početna netaknuta; ništa nije push-ovano/deploy-ovano.
4) Sastavi `showcase/redesign/REPORT-FINAL.md` (fajl koji Jovan čita ujutru):
   - sažetak po koracima 01–06: status (OK / delimično / palo), ključni fajlovi, build/lint status;
   - „ZA PREGLED UJUTRU": šta ručno pogledati, šta je preskočeno i zašto;
   - `git log --oneline main..feat/redesign-clean` (šta je sve iskomitovano na grani);
   - jasno napiši: „Grana: feat/redesign-clean — NIJE push-ovana. Ništa nije deploy-ovano.";
   - „Kako da pregledaš": `git switch feat/redesign-clean` pa `npm run dev`;
   - „Kako da vratiš sve": `git switch main` (main je netaknut); grana ostaje za pregled ili brisanje.
5) Commit LOKALNO (bez push): `git add -A && git commit -m "docs(redesign): REPORT-FINAL + review screenshots"`.

Ne push-uj i ne deploy-uj ni pod kojim uslovom. Kraj lanca.
