/**
 * Snimci klijentskih sajtova u karticama na `/projects`.
 *
 * Isti obrazac kao `backgroundVideoConfig.ts`: ovde stoji samo ono što mora da
 * zna JS. Razlika u odnosu na pozadinu je broj — pozadina je jedan video na
 * ekranu, ovde ih je šest na jednoj stranici, pa se sve odluke prave po
 * kartici, a ne po stranici.
 */
export const SHOWCASE_VIDEO = {
  /**
   * Ispod ove širine ide `card-sm` encode (720×450 umesto 1440×900). Isti prag
   * kao kod pozadine, i bira se JEDNOM pri montiranju — ne preko
   * `<source media>`, jer ga browseri ne re-evaluiraju pouzdano posle prvog
   * load-a (detaljno objašnjeno u `backgroundVideoConfig.ts`).
   */
  mobileMaxWidth: 768,

  /**
   * Koliko pre ulaska u viewport kartica sme da povuče svoj video.
   *
   * Ovo je jedini razlog zašto `src` uopšte ne postoji u JSX-u: šest kartica
   * × ~1.9 MB webm je ~9 MB pri otvaranju stranice, za sadržaj koji možda
   * niko neće doskrolovati. 200px je taman toliko da video stigne da dekoduje
   * prvi frejm dok kartica ulazi u kadar, a premalo da povuče kartice koje su
   * dva ekrana niže.
   */
  rootMargin: "200px",

  /**
   * Kartica koja je izašla iz kadra pauzira. Dekodiranje šest klipova u
   * paraleli je merljiv trošak i na desktopu, a vidi se najviše jedan-dva.
   */
  pauseWhenOffscreen: true,

  /** Pauza kad tab nije u fokusu — isto kao pozadina, iz istog razloga. */
  pauseWhenHidden: true,

  /**
   * Video se ne dira dok stranica ne završi `load`, pa još jedan idle callback
   * preko toga — čak i za karticu koja je odmah u kadru. Hero i fontovi tako
   * dobiju punu propusnost; isti razlog kao kod pozadine.
   */
  deferUntilLoad: true,

  /**
   * I posle `load`-a, prvi video čeka da korisnik makar jednom skroluje.
   *
   * Ovo nije opreznost preko mere nego geometrija stranice: na 1440×900 prvi
   * red kartica počinje na ~771px, dakle ~130px medija pane-a je iznad
   * preloma. Sam `IntersectionObserver` bi to pročitao kao „u kadru" i povukao
   * dva klipa (~3.5 MB) na otvaranju stranice, iako niko nije ni pogledao dole.
   * Zahtev je da otvaranje `/projects` ne košta nijedan video bajt, a ne košta
   * ni ovako: da bi se kartica uopšte videla, mora da se skroluje.
   *
   * `window.scrollY > 0` pri montiranju već važi kao skrol — reload na
   * sredini stranice ne sme da ostavi kartice zaključane na posteru.
   */
  deferUntilScroll: true,
} as const;
