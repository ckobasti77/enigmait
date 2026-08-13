/**
 * Klaster device-mockapa u kartici na `/projects`.
 *
 * Isti obrazac kao `showcaseVideoConfig.ts`: ovde stoji samo ono što mora da zna
 * JS. **Geometrija klastera nije ovde nego u `globals.css`** i to je namerno —
 * raspored se prebacuje na uskom ekranu media query-jem, a vrednost koju CSS
 * menja ne sme da postoji i u JS-u u drugoj verziji.
 */
export const MOCKUP_CLUSTER = {
  /**
   * Koliko pre ulaska u kadar klaster sme da montira svoje slike.
   *
   * Slike se ne renderuju u SSR markup-u uopšte: šest kartica × tri statične
   * slike je 18 zahteva za sadržaj koji je najčešće dva ekrana niže. 200px je
   * isti prag koji `showcaseVideoConfig.ts` koristi za snimke i iz istog
   * razloga — taman da medij stigne da se dekoduje dok kartica ulazi u kadar,
   * premalo da povuče karticu dva ekrana niže.
   *
   * Izuzetak je izdvojeni projekat, vidi `priority` u
   * `components/ui/project-mockup-cluster.tsx`.
   */
  rootMargin: "200px",

  /**
   * Uski raspored: samo laptop i mobilni, monitor i tablet otpadaju.
   *
   * **Ista vrednost stoji u `globals.css`** (`@media (max-width: 639px)` u bloku
   * `.mockup-*`) i mora da se menja na oba mesta zajedno. Razlog što uopšte
   * postoji i u JS-u: CSS ta dva uređaja samo sakriva, a sakrivena slika u
   * nekim browserima svejedno ode na mrežu — pa JS ni ne montira ono što CSS
   * neće pokazati.
   *
   * Prag je 639px (Tailwind `sm` granica), tj. telefon. Kartica u `md` mreži je
   * uža od featured panela, ali klaster se u nju skalira ceo i ne lomi se —
   * pojednostavljenje je za telefon, ne za svaku usku koloniju.
   */
  simplifiedQuery: "(max-width: 639px)",

  /**
   * `sizes` po ekranu, procenjeno iz širine uređaja u klasteru (monitor 64%,
   * laptop 58%, tablet 31%, mobilni 16% širine korice) puta širina same korice
   * (~45vw u mreži na desktopu, ~92vw na telefonu). Next optimizator iz ovoga
   * bira srcset, pa monitor od 300px ne povlači sliku od 1600px.
   */
  imageSizes: {
    desktop: "(min-width: 1024px) 32vw, 58vw",
    laptop: "(min-width: 1024px) 30vw, 54vw",
    tablet: "(min-width: 1024px) 16vw, 30vw",
    mobile: "(min-width: 1024px) 9vw, 22vw",
  },
} as const;
