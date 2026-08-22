import type { ProjectMockupSize } from "@/constants/projectMockups";

/**
 * Svi brojevi 3D vitrine projekata na `/projects`.
 *
 * Isti razlog zbog kojeg postoji `disciplinesTiming.ts`: geometrija, kamera i
 * tajming se podešavaju gledanjem u ekran, a komponente se čitaju. Kad su brojevi
 * ovde, podešavanje je jedan fajl i nijedan JSX.
 *
 * JEDINICA JE VISINA EKRANA MONITORA (~1). Sve ostalo je izvedeno iz nje, pa
 * promena kamere ne traži prepravku uređaja i obrnuto.
 */

/* ---------------------------------------------------------------------------
   Snimci: koliko su piksela veliki, i šta to znači za šejder.

   Odnos stranica ulazi u materijal kao uniforma, pa mora da bude poznat PRE
   nego što tekstura stigne - inače bi prvi frejm posle svakog koraka bio
   nategnut dok se `texture.image` ne pročita. Sve četiri veličine su identične
   kroz svih šest projekata (`scripts/capture-mockups.mjs` ih slika na fiksnim
   viewport-ima), pa je ovo konstanta a ne merenje.
   --------------------------------------------------------------------------- */

export const MOCKUP_PIXELS: Record<
  ProjectMockupSize,
  { width: number; height: number }
> = {
  desktop: { width: 1600, height: 1350 },
  laptop: { width: 1440, height: 1350 },
  tablet: { width: 800, height: 1718 },
  mobile: { width: 390, height: 1266 },
};

export const MOCKUP_ASPECT: Record<ProjectMockupSize, number> = {
  desktop: MOCKUP_PIXELS.desktop.width / MOCKUP_PIXELS.desktop.height,
  laptop: MOCKUP_PIXELS.laptop.width / MOCKUP_PIXELS.laptop.height,
  tablet: MOCKUP_PIXELS.tablet.width / MOCKUP_PIXELS.tablet.height,
  mobile: MOCKUP_PIXELS.mobile.width / MOCKUP_PIXELS.mobile.height,
};

/**
 * Redosled uređaja je i redosled ključeva u `PROJECT_MOCKUPS`. Monitor nosi
 * `desktop`, laptop `laptop` (i video), tablet `tablet`, telefon `mobile`.
 */
export const DEVICE_ORDER = [
  "desktop",
  "laptop",
  "tablet",
  "mobile",
] as const satisfies readonly ProjectMockupSize[];

/* ---------------------------------------------------------------------------
   Geometrija uređaja.
   --------------------------------------------------------------------------- */

export type DeviceGeometry = {
  /** `RoundedBox args` tela (kod laptopa: poklopca). */
  body: [number, number, number];
  bodyRadius: number;
  /** Vidljiv ram oko ekrana, po ivici RAVNE prednje strane - vidi `screenSize`. */
  bezel: number;
};

export const DEVICE_GEOMETRY: Record<ProjectMockupSize, DeviceGeometry> = {
  desktop: { body: [1.92, 1.15, 0.055], bodyRadius: 0.022, bezel: 0.036 },
  laptop: { body: [1.56, 1.02, 0.032], bodyRadius: 0.016, bezel: 0.032 },
  tablet: { body: [0.74, 1.02, 0.026], bodyRadius: 0.026, bezel: 0.024 },
  mobile: { body: [0.4, 0.82, 0.024], bodyRadius: 0.03, bezel: 0.012 },
};

/* ---------------------------------------------------------------------------
   Gotovi modeli.

   Monitor i telefon NISU pravljeni ovde - to su isti GLB-ovi koje vrti sekcija
   disciplina na početnoj (`constants/disciplines.ts`). Modelovan uređaj sa
   pravim proporcijama, stalkom i dugmadima pobeđuje zaobljenu kutiju u svakom
   kadru, a usput je i konzistentno: ista scena, isti uređaji, dve strane sajta.

   Tablet i laptop ostaju proceduralni. Tablet zato što je `ui-ux-design.glb`
   PEJZAŽNI i nosi olovku zalepljenu u isti mesh kao telo - okrenut u portret
   olovka bi štrčala uvis, a ostavljen pejzažno ne bi primio portretni tablet
   snimak. Laptop zato što ga u toj kolekciji nema kao uređaj sa odvojenim
   ekranom.

   `screenAspect` se NE meri iz geometrije: ekran monitora je blago zakrivljen i
   nagnut, pa bi bbox po x/y dao netačan odnos. Stoji kao broj, jer je to broj
   koji uređaj i ima.
   --------------------------------------------------------------------------- */

export type GlbDevice = {
  url: string;
  /** Ime mesh-a tela u GLB-u. */
  mesh: string;
  /** Ime mesh-a ekrana. Njemu ide slajd šejder. */
  screen: string;
  /** Visina celog modela u svetskim jedinicama, po kojoj se skalira. */
  height: number;
  screenAspect: number;
};

export const GLB_DEVICES: Partial<Record<ProjectMockupSize, GlbDevice>> = {
  desktop: {
    url: "/assets/models/disciplines/web-development.glb",
    mesh: "web-development",
    screen: "web-development_screen",
    height: 1.22,
    screenAspect: 16 / 9,
  },
  mobile: {
    url: "/assets/models/disciplines/mobile-app-development.glb",
    mesh: "mobile-app-development",
    screen: "mobile-app-development_screen",
    height: 0.86,
    screenAspect: 9 / 19.5,
  },
};

/**
 * Ravan ekrana, IZVEDENA iz tela - i to je jedini način da ne štrči.
 *
 * `RoundedBox` iz drei-ja ekstrudira zaobljen pravougaonik sa `bevelSize =
 * radius`, pa je njegova RAVNA prednja strana manja od siluete za `radius` sa
 * SVAKE strane: telo od 0.40 sa radijusom 0.048 ima prednju stranu od samo 0.304.
 * Ekran zadat kao broj lako promaši tu granicu - telefonu je ranije bio 0.362 i
 * ivice slike su visile preko oboda, što se na snimku vidi kao da slika ne stoji
 * u ekranu. Otuda računanje umesto kucanja: širina siluete, minus dva radijusa
 * (bevel), minus dva bezela.
 */
export const screenSize = (size: ProjectMockupSize): [number, number] => {
  const { body, bodyRadius, bezel } = DEVICE_GEOMETRY[size];
  const inset = 2 * (bodyRadius + bezel);
  return [body[0] - inset, body[1] - inset];
};

/**
 * Koliko ekran štrči ispred prednje strane kućišta, u svetskim jedinicama.
 *
 * NIJE nula i ne sme da bude. Koplanarna ravan i prednja strana rama su isti
 * depth uzorak, pa se bore za piksel i trepere; 2 mm na rastojanju kamere od
 * ~4.6 jedinice je nekoliko stotina puta iznad rezolucije 24-bitnog depth
 * bafera na toj daljini, a vizuelno je tačno ono što treba - staklo koje sedi U
 * ramu, a ne slika nalepljena NA ram. `polygonOffset` bi rešio isto tako, ali
 * menja vidljiv artefakt za nevidljiv.
 */
export const SCREEN_LIFT = 0.002;

/** Z ravni ekrana u lokalnom prostoru uređaja. */
export const screenZ = (size: ProjectMockupSize) =>
  DEVICE_GEOMETRY[size].body[2] / 2 + SCREEN_LIFT;

/** Odnos stranica same ravni ekrana - druga polovina `cover` računa u šejderu. */
export const screenAspect = (size: ProjectMockupSize) => {
  const [width, height] = screenSize(size);
  return width / height;
};

/**
 * Šarka laptopa.
 *
 * Poklopac se okreće oko svoje DONJE IVICE, ne oko svog centra - zato zaseban
 * pivot. `lean` je negativan: rotacija oko X za -θ vodi vrh poklopca u -Z, tj.
 * unazad od kamere, što je jedini nagib koji se čita kao otvoren laptop. Blago,
 * jer svaki stepen nagiba plaća se čitljivošću snimka.
 */
export const LAPTOP_HINGE = {
  pivot: [0, -0.52, -0.01] as [number, number, number],
  lean: -0.16,
  deck: {
    size: [1.56, 0.028, 0.86] as [number, number, number],
    radius: 0.012,
    position: [0, -0.52, 0.4] as [number, number, number],
  },
} as const;

/* ---------------------------------------------------------------------------
   Raspored i kamera.

   Dva preseta, ista geometrija. Menjaju se SAMO pozicije, skala i kamera - ništa
   se ne rekompajlira kad se prozor prevuče preko 768px.

   Cik-cak je isti kao u CSS klasteru (`globals.css`, blok `.mockup-*`): monitor
   levo-nazad, laptop desno-sredina, tablet levo-napred, telefon desno-napred, pa
   manji uređaj uvek stoji ispred većeg. Fallback i 3D moraju da izgledaju kao
   braća, jer u istoj sesiji mogu da se smene.

   SVI YAW-ovi SU "TOE-IN": uređaj levo od centra rotira +Y, desno -Y, tako da
   svaka ravan gleda ka kameri. To je i ono što drži snimke čitkim - ne stil.
   Nijedan nagib ne prelazi ~18°, jer preko toga anizotropno filtriranje prestaje
   da spasava sitan tekst i snimak se čita kao tekstura umesto kao sajt.
   --------------------------------------------------------------------------- */

export type DevicePlacement = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export type ShowcaseLayout = {
  camera: {
    /**
     * Smer gledanja, ne pozicija. Rastojanje se RAČUNA iz odnosa stranica platna
     * tako da se `fit` uvek vidi ceo.
     *
     * Fiksna pozicija radi za tačno jedan odnos stranica. Ovaj boks je 16/10 dok
     * ga `max-height` ne skrati, na tabletu je skoro kvadratan, na telefonu
     * portretan - a `fov` je vertikalan, pa uži kadar znači MANJE vodoravnog
     * prostora i klaster koji se seče sa strane. Uklapanje po obe ose je jedini
     * način da isti preset preživi sve tri situacije.
     */
    direction: [number, number, number];
    fov: number;
    target: [number, number, number];
    /** Šta mora da stane, u svetskim jedinicama: klaster plus vazduh oko njega. */
    fit: { width: number; height: number };
  };
  devices: Record<ProjectMockupSize, DevicePlacement>;
};

/** ≥768px. Četiri uređaja u jednom redu dubine, monitor kao pozadina kompozicije. */
export const LAYOUT_WIDE: ShowcaseLayout = {
  camera: {
    direction: [0, 0.05, 1],
    fov: 30,
    /**
     * Uklopni boks je tesno oko klastera - to je ono što uređaje čini punom
     * širinom kontejnera umesto da lebde u sredini kadra.
     *
     * BROJEVI SU PROJEKTOVANI, NE GEOMETRIJSKI. Sirovi bbox klastera je 3.14 x
     * 1.81, ali uređaji stoje na različitim dubinama (monitor na z -0.35,
     * telefon na +0.66) i bliži se projektuju veći: telefon je ~1.19x, tablet
     * ~1.10x, monitor ~0.89x. Boks računat po sirovom bbox-u odseca telefon
     * desno i tablet dole - provereno. Projektovani raspon je 3.31 x 1.77 sa
     * centrom na (0.08, 0.00), plus ~7% vazduha.
     *
     * Odnos ovog boksa (~15/8) je i razlog zašto `.project-viewport` drži baš taj
     * odnos stranica: kutija šira od klastera znači uklapanje po visini, praznina
     * levo i desno, i manji uređaji bez ikakve dobiti.
     */
    target: [0.08, 0, 0.1],
    fit: { width: 3.55, height: 1.9 },
  },
  devices: {
    desktop: { position: [-0.72, 0.24, -0.35], rotation: [-0.02, 0.16, 0], scale: 1 },
    laptop: { position: [0.66, -0.06, 0.02], rotation: [0, -0.19, 0], scale: 1 },
    tablet: { position: [-1.06, -0.26, 0.42], rotation: [-0.03, 0.26, 0.03], scale: 1 },
    // Telefon stoji NA palmrestu laptopa: y je izabran tako da mu donja ivica
    // sedne na gornju stranu palmresta, umesto da lebdi ili da prođe kroz njega.
    mobile: { position: [1.26, -0.155, 0.66], rotation: [-0.02, -0.28, -0.03], scale: 1 },
  },
};

/** <768px. Isti uređaji, 2x2, portretni kadar. */
export const LAYOUT_NARROW: ShowcaseLayout = {
  camera: {
    direction: [0, 0.03, 1],
    fov: 34,
    target: [-0.04, 0.06, 0.05],
    fit: { width: 2.05, height: 2.15 },
  },
  devices: {
    desktop: { position: [-0.4, 0.72, -0.3], rotation: [-0.02, 0.2, 0], scale: 0.6 },
    laptop: { position: [0.46, 0.2, -0.05], rotation: [0, -0.22, 0], scale: 0.56 },
    tablet: { position: [-0.42, -0.52, 0.2], rotation: [-0.03, 0.24, 0.03], scale: 0.72 },
    mobile: { position: [0.44, -0.6, 0.35], rotation: [-0.02, -0.26, -0.03], scale: 0.82 },
  },
};

/**
 * Ista 768 linija kao `DPR_NARROW` i `LENS_TRANSMISSION_MIN_WIDTH`.
 *
 * Iznad nje postoji tačno JEDAN kadar. Postojala je verzija koja je od `lg`
 * pomerala kameru udesno da napravi mesto tekstu - i time menjala i pozicije i
 * veličine uređaja, što je bilo pogrešno: kompozicija je fiksna, a tekst se
 * uklapa u prazninu koju ona ostavlja gore desno (iznad poklopca laptopa, desno
 * od monitora). Ne obrnuto.
 */
export const NARROW_QUERY = "(max-width: 767px)";

/** Dva budžeta piksela, isti kao `DisciplineStage` i `ServiceModelStage`. */
export const DPR_DESKTOP: [number, number] = [1, 1.75];
export const DPR_NARROW: [number, number] = [1, 1.5];

/* ---------------------------------------------------------------------------
   Svetlo.

   Ekrani se ne osvetljavaju - oni su `ShaderMaterial` bez osvetljenja, jer je
   osenčen snimak nečitljiv snimak. Ovo je isključivo za kućišta, preko
   proceduralnog PMREM okruženja iz `components/sections/disciplines/environment.ts`.
   --------------------------------------------------------------------------- */

export const LIGHTS = {
  ambient: 0.22,
  key: { position: [2.4, 3.1, 2.6] as [number, number, number], intensity: 1.05 },
  fill: { position: [-3, 0.7, 1.5] as [number, number, number], intensity: 0.32 },
} as const;

/**
 * Odsjaj stakla u šejderu ekrana - UGAŠEN.
 *
 * Stajao je na 0.06 da ekran ne bi izgledao kao nalepnica. Ali odsjaj je aditivan
 * i pokriva ceo gornji levi kvadrant snimka (`smoothstep(0.55, 0.0, x + 0.6y)`),
 * pa je to bio plavičast veo preko tuđeg brenda - tačno ono što se na snimku vidi
 * kao "posivljeno". Snimak sada izlazi tačno onakav kakav je u fajlu.
 *
 * Ostaje kao broj, ne kao obrisan kod: uniforma i grana u šejderu su i dalje tu,
 * pa je povratak jedna vrednost. Ako ekranu ikad zatreba površina, bolje je da
 * dođe od zasebne tanke ravni ispred njega nego od vela preko slike.
 */
export const SCREEN_SHEEN = 0;
export const SCREEN_SHEEN_COLOR: [number, number, number] = [0.78, 0.86, 1];

/* ---------------------------------------------------------------------------
   Tajming.

   Kriva i trajanje su `ServiceCarousel`-ovi, preuzeti kroz `disciplinesTiming.ts`
   da postoji jedan izvor za ceo sajt - ovaj slajder mora da se oseća kao onaj na
   uslugama, jer je isti pokret.
   --------------------------------------------------------------------------- */

/**
 * Koliko settle kasni za krajem tween-a.
 *
 * Postoji da bi tween sigurno stigao do `uProgress = 1` pre nego što React zameni
 * `uCurr` novim snimkom. Vizuelno je nevidljivo: na p=1 šejder već pokazuje 100%
 * sledećeg, dakle isto što i posle zamene. Da je nula, poslednji `onUpdate` bi
 * mogao da upiše p≈0.99 preko VEĆ zamenjene teksture - i slajd bi na kraju
 * poskočio unazad.
 */
export const SETTLE_GRACE_MS = 60;

/**
 * Video se rastvara u snimak pre nego što slajd krene, i vraća se tek kad se
 * slegne.
 *
 * `laptop.webp` je stranica na scroll 0, a klip u t>0 je skrolovan negde drugde -
 * tvrd rez između njih je vidljiv skok sadržaja. Izlaz se završi na 19% slajda, a
 * push kriva kreće sporo, pa je ravan do tada prešla ~5%: rastvaranje se desi dok
 * je kompozicija praktično mirna. Preostalih pola sekunde do zamene `src`-a je
 * ono što garantuje da fade nikad ne meša NOV video sa STARIM snimkom.
 */
export const VIDEO_FADE_IN = 0.32;
export const VIDEO_FADE_OUT = 0.12;

/**
 * Koliko projekata sme da bude rezidentno, na svaku stranu od trenutnog.
 *
 * NIJE optimizacija mreže - 24 webp-a je ukupno ispod 1.5 MB. Teksture na GPU
 * žive dekompresovane: ~32 MB po projektu sa mipovima, pa bi svih šest bilo
 * ~190 MB, što sredovečan Android ne preživi. Prozor od 1 drži ~96 MB, od čega se
 * tokom slajda stvarno semplira 8 tekstura.
 */
export const TEXTURE_WINDOW = 1;
