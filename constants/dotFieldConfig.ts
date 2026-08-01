export type DotFieldInteraction = "pointer" | "auto";

export const DOT_FIELD = {
  /**
   * Ko vodi efekat.
   *
   * "pointer" — miš vodi na uređajima sa preciznim pokazivačem, a na touch
   *             uređajima (nema hover) automatski pada na auto-drift.
   * "auto"    — auto-drift svuda: identično ponašanje na telefonu i na kompu,
   *             bez hovera.
   *
   * ⇐ OVO JE PREKIDAČ. Promeni na "auto" i desktop se ponaša kao telefon.
   */
  interaction: "pointer" as DotFieldInteraction,

  /**
   * VERTIKALNI razmak rešetke u CSS px. Horizontalni je `gap * dotAspect`, pa
   * tačkica i ćelija imaju isti odnos stranica i polje ostaje ravnomerno.
   */
  gap: { desktop: 7.2, mobile: 8.6 },
  /**
   * Odnos širine i visine tačkice. 1 = krug (tako je na referenci),
   * >1 = horizontalna elipsa. Skalira i rešetku, ne samo tačkicu.
   */
  dotAspect: 1.6,
  /** Determinističko rasipanje tačkica (udeo razmaka). Referenca je skoro čist raster. */
  jitter: 0.06,
  /** Gornja granica broja tačkica — preko toga se razmak automatski širi. */
  maxDots: 46000,

  /**
   * Poluprečnik tačkice u mirovanju (CSS px, po visini). Drži ga na ~0.28 × gap
   * — to je odnos izmeren na referenci i ono što ostavlja tamne razmake između
   * usijanih tačkica umesto da se sliju u neprekidnu masu.
   */
  glowRadius: 2,
  /** Koliko tačka naraste na punoj energiji (multiplikator preko 1). */
  growth: 1.3,
  /**
   * Alpha tačkice na punoj energiji. 1 znači da usijana tačka potpuno
   * prekrije baznu — tako akcenat ostane zasićeno azuran umesto da se
   * pomeša sa ljubičastom bazom u bledo lila.
   */
  hotAlpha: 1,
  /**
   * Izduženje po pravcu flow polja. 0 = tačkice zadrže svoj oblik, samo
   * naraste prečnik i promeni se boja — tako je na referenci.
   * >0 ih dodatno razvlači u crtice.
   */
  stretch: 0,
  /** Raspon spore modulacije svetline baznog polja (0 = ravnomerno). */
  levelVariance: 0.45,
  /** Frekvencija te modulacije. */
  levelFrequency: 0.004,

  /** Domet uticaja kursora u CSS px — širina poteza kojim se crta. */
  influenceRadius: { desktop: 95, mobile: 85 },

  /**
   * Trag se ponaša kao crtanje: ono što nacrtaš stoji nepromenjeno `holdMs`,
   * pa se onda gasi za `fadeMs`. Pošto svaka tačkica pamti KADA je dodirnuta,
   * gašenje ide redom — prvo nestaje najstariji deo poteza, a vrh ostaje.
   */
  holdMs: 2600,
  fadeMs: 1600,

  /**
   * Oblik izrasline. Konstruisan tako da je iznutra UVEK pun — nepravilnost
   * živi samo u ivici. Jezgro poluprečnika `coreRatio` je bezuslovno popunjeno,
   * a preko njega se ivica razvlači u krakove, pa nema rupa u sredini.
   */
  filament: {
    /** Krupnoća nepravilnosti ivice u svetskim koordinatama. Manje = krupnije. */
    frequency: 0.004,
    /** Druga oktava — sitniji detalj na ivici. */
    octave2: 2.4,
    /** Gustina krakova oko kursora. Veće = više i tanjih krakova. */
    armCount: 1.35,
    /** Koliko krakovi izlaze van dometa (udeo dometa). */
    armDepth: 0.36,
    /** Koliko svetski šum dodatno kida ivicu (udeo dometa). */
    grainDepth: 0.24,
    /** Udeo dometa koji je uvek pun. Garantuje da nema rupa iznutra. */
    coreRatio: 0.46,
    /** >0 pomera oblik kroz vreme umesto da bude zamrznut. */
    drift: 0,
  },
  /** Frekvencija polja koje određuje pravac izduženja (koristi se samo uz `stretch`). */
  flowFrequency: 0.0025,

  /** Putanja virtuelnog kursora u auto modu. */
  autoDrift: { periodMs: 18000, radiusRatio: 0.38 },

  /** Gornja granica frame rate-a. */
  fps: 45,
  /** Broj pre-renderovanih sprite-ova u gradijentu baza → akcenat. */
  rampSteps: 10,
} as const;
