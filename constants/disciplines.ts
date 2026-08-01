import type { ServiceFloatingKey } from "@/constants/serviceFloatingObjects";

/**
 * `ServiceFloatingKey` carries seven members - the six service slugs plus `"default"`.
 * Excluding `"default"` by type is what makes the compiler guarantee that all six exist
 * and that no slug is ever mistyped here.
 */
export type DisciplineKey = Exclude<ServiceFloatingKey, "default">;

export type Vec3 = [number, number, number];

export type Discipline = {
  key: DisciplineKey;
  /** Name of the BODY mesh in the GLB. Read through `nodes[meshName]`, like HeroCube. */
  meshName: string;
  /**
   * Name of the SCREEN mesh in the same GLB - a separate primitive with UVs and an empty
   * material. Its material is built in code; the recipe lives in `materials.ts`.
   */
  screenMeshName: string;
  /**
   * The image that goes on that screen. Swapping the placeholder for the real screenshot
   * is this one line and nothing else - no material, geometry, UV or export work.
   */
  screenImage: string;
  modelPath: string;
  stillPath: string;
  material: "anodized" | "steel";
  /** Emissive accent instance positions, object space, after the bbox normalisation. */
  accents: Vec3[];
  /**
   * Axis the accent cylinders point along, object space. For a screen device that is the
   * panel normal, so the accents read as lights set into the face rather than as pins
   * stuck through it. Not in SECTION_SPEC's contract - added because the accent geometry
   * is a cylinder and a bare `Vec3[]` of positions cannot orient one.
   */
  accentAxis: Vec3;
  accentScale: number;
  /**
   * Visual scale correction, default 1.0. Tuned against the Faza C contact sheet.
   *
   * Normalising the bbox to 2.0 on the longest axis keeps one camera working for all six,
   * but it does not equalise perceived size: a thin ring and a solid monolith of the same
   * length do not carry the same visual weight. This is that gap, and it only shows once
   * all six sit side by side - which is why it is not guessed up front.
   */
  displayScale: number;
  /** Target triangle count. The 25,000 ceiling is Faza B's check. */
  triBudget: number;
  /** EN source. The pair already exists in lib/i18n.ts - do not duplicate it. */
  title: string;
  /** EN source. The pair already exists. */
  kicker: string;
  /** EN source. NEW pair, one per discipline - lands with the i18n block in Faza F. */
  lede: string;
};

/** Order inside the pin. The index in this array is the only order that exists. */
export const DISCIPLINE_ORDER = [
  "web-development",
  "ui-ux-design",
  "mobile-app-development",
  "seo-geo",
  "branding",
  "social-media",
] as const satisfies readonly DisciplineKey[];

/**
 * One shared placeholder for all six until the real screenshots arrive. It exists so the
 * screen material and its clearcoat layer can be tuned before a single real image does,
 * and so it is visible straight away that the image sits BEHIND glass rather than being
 * printed on it.
 */
const PLACEHOLDER_SCREEN = "/assets/screens/disciplines/placeholder.webp";

const modelPath = (key: DisciplineKey) =>
  `/assets/models/disciplines/${key}.glb`;
const stillPath = (key: DisciplineKey) =>
  `/assets/stills/disciplines/${key}.webp`;

/**
 * All six rows exist because every value in them is already fixed by SECTION_SPEC, and
 * because Faza D then plugs the scroll engine in without touching this file. Only
 * `web-development` has a GLB on disk today (Faza A); the other five carry the contract
 * and nothing invented - their `accents` stay empty until Faza C measures the geometry
 * they are meant to sit on, and `displayScale` stays at the 1.0 default until the second
 * contact sheet.
 *
 * `href` is deliberately absent - it is derived as `/services/${key}`. The slug is already
 * the join key between `navLinks.to`, the route folder, `serviceDetails` and
 * `ServiceFloatingKey`; a seventh copy would only be a seventh place to drift.
 */
export const disciplines: Record<DisciplineKey, Discipline> = {
  "web-development": {
    key: "web-development",
    meshName: "web-development",
    screenMeshName: "web-development_screen",
    // The first real screen image. Exactly the one-line swap the placeholder exists for -
    // no material, geometry, UV or export work came with it.
    screenImage: "/assets/screens/disciplines/website.webp",
    modelPath: modelPath("web-development"),
    stillPath: stillPath("web-development"),
    material: "anodized",
    // Three lights set into the chin, on the measured front face of the frame
    // (d = 0.0528 along the panel normal, y band -0.407..-0.325), plus two on the base
    // plate (top at y = -0.761). Measured off the GLB, not eyeballed.
    accents: [
      [-0.0885, -0.3624, 0.0926],
      [-0.0199, -0.3624, 0.1065],
      [0.0487, -0.3624, 0.1205],
      [-0.15, -0.7565, 0.15],
      [0.13, -0.7565, 0.16],
    ],
    accentAxis: [-0.1976, 0.1394, 0.9711],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 5676,
    title: "Web development",
    kicker: "Develop. Dominate. Scale.",
    lede: "Next.js, TypeScript and a build pipeline you can audit. Fast on the first paint, still fast in year two.",
  },
  "ui-ux-design": {
    key: "ui-ux-design",
    meshName: "ui-ux-design",
    screenMeshName: "ui-ux-design_screen",
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("ui-ux-design"),
    stillPath: stillPath("ui-ux-design"),
    material: "steel",
    accents: [],
    accentAxis: [0, 0, 1],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 9000,
    title: "UI | UX Design",
    kicker: "Intuitive experiences, beautiful interfaces.",
    lede: "Component systems and motion rules, not a folder of screens. Every state is designed before it is built.",
  },
  "mobile-app-development": {
    key: "mobile-app-development",
    meshName: "mobile-app-development",
    screenMeshName: "mobile-app-development_screen",
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("mobile-app-development"),
    stillPath: stillPath("mobile-app-development"),
    material: "anodized",
    accents: [],
    accentAxis: [0, 0, 1],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 8000,
    title: "Mobile App Development",
    kicker: "From idea to App store.",
    lede: "One codebase, two stores, no compromise on feel. Shipped, reviewed and updated on your schedule.",
  },
  "seo-geo": {
    key: "seo-geo",
    meshName: "seo-geo",
    screenMeshName: "seo-geo_screen",
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("seo-geo"),
    stillPath: stillPath("seo-geo"),
    material: "steel",
    accents: [],
    accentAxis: [0, 0, 1],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 10000,
    title: "SEO & GEO",
    kicker: "Appear at top on Google & Chatbots.",
    lede: "Technical SEO for crawlers and structured answers for AI search. Two audiences, one architecture.",
  },
  branding: {
    key: "branding",
    meshName: "branding",
    screenMeshName: "branding_screen",
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("branding"),
    stillPath: stillPath("branding"),
    material: "anodized",
    accents: [],
    accentAxis: [0, 0, 1],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 6000,
    title: "Branding",
    kicker: "Instantly recognizable. Effortlessly remembered.",
    lede: "A mark, a voice and a system that holds up at 16 pixels and on a building. Documented so your team can use it.",
  },
  "social-media": {
    key: "social-media",
    meshName: "social-media",
    screenMeshName: "social-media_screen",
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("social-media"),
    stillPath: stillPath("social-media"),
    material: "steel",
    accents: [],
    accentAxis: [0, 0, 1],
    accentScale: 0.018,
    displayScale: 1,
    triBudget: 8000,
    title: "Social Media",
    kicker: "Turning followers into fans.",
    lede: "Content that has a reason to exist. We plan the calendar, produce the assets and read the numbers.",
  },
};

export const disciplineHref = (key: DisciplineKey) => `/services/${key}`;
