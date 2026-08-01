/**
 * Fiksni video background sajta.
 *
 * Sve što se tiče *jačine* efekta (koliko je zamračen, koliko se vidi) živi u
 * CSS varijablama `--bg-video-*` u `globals.css`, po paleti — jer to mora da se
 * menja zajedno sa temom. Ovde su samo stvari koje mora da zna JS: koji fajl,
 * kada da se učita i kako reaguje na kursor.
 */
export const BACKGROUND_VIDEO = {
  /**
   * Dve verzije istog klipa. Izbor se pravi JEDNOM, pri montiranju, po širini
   * viewporta — namerno ne preko `<source media>`, jer ga browseri ne
   * re-evaluiraju pouzdano posle prvog load-a.
   */
  sources: {
    desktop: "/background.webm",
    mobile: "/background-mobile.webm",
  },
  /** Ispod ove širine ide mobilni encode (960×540, ~0.5 MB umesto ~3.3 MB). */
  mobileMaxWidth: 768,

  /**
   * Prvi frame klipa, kao WebP. Stoji kao `background-image` na medija sloju,
   * ne kao `poster` atribut — tako je vidljiv i pre nego što video uopšte dobije
   * `src`, i ne zavisi od toga kako pojedini browser tretira poster bez src-a.
   * Pošto je to bukvalno frame 0, prelaz poster → video se ne vidi.
   */
  poster: "/background-poster.webp",

  /**
   * Video se ne dira dok stranica ne završi `load`, pa još jedan idle callback
   * preko toga. Hero i fontovi tako dobiju punu propusnost — 3 MB pozadine nema
   * šta da se takmiči sa LCP-om.
   */
  deferUntilLoad: true,
  /** Pauza kad tab nije u fokusu. Dekodiranje 1080p u pozadini je čista baterija. */
  pauseWhenHidden: true,

  /**
   * Koliko je video uvećan preko viewporta. Mora >1 da parallax pomeraj ne
   * otkrije ivicu.
   */
  overscan: 1.06,

  pointer: {
    /**
     * Parallax na pomeraj miša — jedina interakcija. Radi samo na preciznom
     * pokazivaču. Namerno bez ičega što prati strelicu: pozadina se pomera,
     * ali ne crta drugi kursor.
     */
    enabled: true,
    /** Maksimalni pomeraj videa suprotno od kursora, u px. Drži ga malim. */
    parallax: 14,
    /** Lerp faktor po frame-u. Manje = tromiji, teži pomeraj. */
    ease: 0.075,
  },
} as const;
