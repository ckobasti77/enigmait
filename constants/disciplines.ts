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
   * What that second primitive IS, which decides which material `materials.ts` builds for
   * it. Absent means `"display"` - a flat panel with UVs that carries `screenImage` behind
   * glass, which is five of the six.
   *
   * `"lens"` is `seo-geo` alone: the same slot, same node name, same two-primitive export
   * contract, but the mesh is a biconvex lens and the material is transmission rather than
   * an image. It is a field rather than a second mesh name because the alternative was a
   * third primitive, and the export contract knows about exactly two.
   */
  screenKind?: "display" | "lens";
  /**
   * The image that goes on that screen. Swapping the placeholder for the real screenshot
   * is this one line and nothing else - no material, geometry, UV or export work.
   *
   * Unused when `screenKind` is `"lens"` - glass has nothing to map, and that primitive
   * ships without UVs.
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
   * Visual scale correction. Tuned against the six-model contact sheet in Faza E, and
   * measured off it rather than judged by eye.
   *
   * Normalising the bbox to 2.0 on the longest axis keeps one camera working for all six,
   * but it does not equalise perceived size: a magnifier is mostly a circle with a thin
   * handle, a billboard is a filled rectangle, and at the same longest axis the second one
   * weighs far more. This is that gap, and it only shows once all six sit side by side -
   * which is why it is not guessed up front.
   *
   * THE METRIC, so the next person can re-derive these rather than re-argue them. Each
   * model was rendered from the one camera at scale 1.0 and its canvas read back, giving
   * two numbers: the INK (count of covered pixels, sqrt-ed to a length) and the BBOX
   * DIAGONAL. Weight is the geometric mean of the two, and the scale is a common target
   * over that weight.
   *
   * Ink alone is wrong - it scales the magnifier up until it is bigger than everything and
   * clips the frame, because its area is honest but its reach is not. Bbox alone is wrong
   * the other way - it treats the empty half of the magnifier's bounding box as substance.
   * The mean of the two is what agrees with the sheet.
   *
   *   key                       ink    diag    weight   ->  scale
   *   web-development          298.7   492.0    322.4       0.85
   *   ui-ux-design             286.1   504.9    319.6       0.86
   *   mobile-app-development   255.6   414.6    273.7       1.00
   *   seo-geo                  201.8   453.5    254.4       1.06
   *   branding                 245.7   478.7    288.4       0.95
   *   social-media             273.6   442.2    292.5       0.94
   *
   * The common target is 275, not the mean of 292. The mean would ask the phone and the
   * magnifier - the two tallest silhouettes, already at 84% and 80% of the frame height at
   * scale 1.0 - to grow past 88%, and a model that nearly touches both edges reads as
   * cramped rather than as big. Scaling the set slightly down instead keeps every silhouette
   * inside ~85% of the frame with the pointer parallax on top of it.
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
 * All six rows, all six GLBs on disk.
 *
 * Every `accents` array below is MEASURED off its own GLB, in the one basis that means
 * anything on these models: the screen panel's. The export turns each model into its 3/4
 * pose before it writes the file, so object X/Y/Z are not the device's left/up/front - the
 * panel normal is. Each placement was written as "on the left rail, at the depth that rail's
 * front face measures" and converted to object space, which is why the numbers look
 * arbitrary and are not. `accentAxis` is that same panel normal, so the discs read as lights
 * set into the face rather than as pins pushed through it.
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
    displayScale: 0.85,
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
    // The one model in the set with a story in it, so its accent tells that story: one
    // light in the pen's nib, then the stroke the pen is in the middle of making, lying on
    // the glass. The nib is not guessed - it is the vertex of the pen cluster nearest the
    // panel, measured at (u 0.584, v -0.291, n -0.1485) in the panel basis. The stroke is a
    // quadratic through the panel from there, 0.006 proud of the glass so it cannot z-fight.
    accents: [
      [0.5468, -0.3202, 0.2112],
      [0.4417, -0.3547, 0.1584],
      [0.3762, -0.3486, 0.135],
      [0.3083, -0.3356, 0.1057],
      [0.2381, -0.3156, 0.0708],
      [0.1655, -0.2888, 0.0301],
      [0.0905, -0.255, -0.0163],
      [0.0132, -0.2143, -0.0684],
      [-0.0665, -0.1667, -0.1262],
      [-0.1485, -0.1121, -0.1898],
      [-0.2329, -0.0507, -0.2592],
      [-0.3196, 0.0177, -0.3342],
      [-0.4087, 0.093, -0.415],
      [-0.5001, 0.1752, -0.5015],
    ],
    accentAxis: [-0.2281, 0.5741, 0.7864],
    accentScale: 0.022,
    displayScale: 0.86,
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
    // Four status lights down the LEFT rail, and left is not a preference: the frame's
    // frontmost face measures n 0.0577 over the whole of that rail against a panel at
    // 0.0417, while the right rail has already rolled away to 0.022. It is also the rail
    // the fixed 3/4 camera sees, since the camera sits on -u.
    accents: [
      [-0.4688, -0.4153, -0.0768],
      [-0.4628, -0.1359, -0.0934],
      [-0.4568, 0.1436, -0.11],
      [-0.4508, 0.423, -0.1267],
    ],
    accentAxis: [-0.3392, 0.0631, 0.9386],
    accentScale: 0.016,
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
    // The lens. Same slot every other model uses for its display panel - see `screenKind`.
    screenKind: "lens",
    // Never read for this key. Kept so the row stays the same shape as the other five;
    // the lens has no UVs and nothing to sample.
    screenImage: PLACEHOLDER_SCREEN,
    modelPath: modelPath("seo-geo"),
    stillPath: stillPath("seo-geo"),
    material: "steel",
    // This model has no screen, so it has no source of cyan the way the other five do.
    // The place built for it is a groove machined INSIDE the bezel, between the innermost
    // step and the rim of the glass - lit, it reads as an illuminated magnifier.
    //
    // Measured off the mesh, object space, glTF axes, ready for Faza D to instance a ring
    // into: centre [-0.2657, 0.4783, -0.0715], axis [-0.2756, 0, 0.9613] (the lens normal),
    // radius 0.4686..0.4818 (mid 0.4752), channel 0.0133 wide and 0.0114 deep.
    //
    // Expanded here as 32 points on that circle rather than as a `{centre, axis, radius}`
    // triple, so this row stays the same shape as the other five and the model component
    // keeps exactly one way to read an accent. 32 is what makes it read as a ring light
    // rather than as a necklace: the circumference is 2.99, so the lights sit 0.093 apart
    // at 0.032 across. Filling the channel solid would take ~220 instances for a detail
    // nobody would name.
    //
    // The axis is the lens normal, and it does NOT come from averaging the primitive's
    // normals the way the other five do - the lens is biconvex, so its two caps cancel and
    // that average is noise. It is the measured value from Faza C.
    accents: [
      [0.1911, 0.4783, 0.0595],
      [0.1823, 0.571, 0.0569],
      [0.1563, 0.6602, 0.0495],
      [0.1141, 0.7423, 0.0374],
      [0.0573, 0.8143, 0.0211],
      [-0.0119, 0.8734, 0.0013],
      [-0.0909, 0.9173, -0.0214],
      [-0.1766, 0.9444, -0.046],
      [-0.2657, 0.9535, -0.0715],
      [-0.3548, 0.9444, -0.097],
      [-0.4405, 0.9173, -0.1216],
      [-0.5195, 0.8734, -0.1443],
      [-0.5887, 0.8143, -0.1641],
      [-0.6455, 0.7423, -0.1804],
      [-0.6877, 0.6602, -0.1925],
      [-0.7137, 0.571, -0.1999],
      [-0.7225, 0.4783, -0.2025],
      [-0.7137, 0.3856, -0.1999],
      [-0.6877, 0.2964, -0.1925],
      [-0.6455, 0.2143, -0.1804],
      [-0.5887, 0.1423, -0.1641],
      [-0.5195, 0.0832, -0.1443],
      [-0.4405, 0.0393, -0.1216],
      [-0.3548, 0.0122, -0.097],
      [-0.2657, 0.0031, -0.0715],
      [-0.1766, 0.0122, -0.046],
      [-0.0909, 0.0393, -0.0214],
      [-0.0119, 0.0832, 0.0013],
      [0.0573, 0.1423, 0.0211],
      [0.1141, 0.2143, 0.0374],
      [0.1563, 0.2964, 0.0495],
      [0.1823, 0.3856, 0.0569],
    ],
    accentAxis: [-0.2756, 0, 0.9613],
    accentScale: 0.016,
    displayScale: 1.06,
    // Measured, post-bevel: 12,032 on the body plus 880 on the lens. Above the ~10,000
    // this model was scoped at, and deliberately - the knurled grip is 56 grooves, i.e.
    // 112 longitudinal ridges the bevel has to carry, and it is the detail that sells the
    // object. The ceiling that matters is Faza B's 25,000.
    triBudget: 12912,
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
    // Five lights along the top rail of the frame. The rail is the band between the panel's
    // top edge (v 0.6845) and the body's (v 0.7218), so the lights sit on its centre line at
    // v 0.7031; its front face measures n -0.0215 against a panel at -0.0339. `accentScale`
    // is 0.014 rather than the usual 0.018 for the same reason - the rail is 0.037 wide, and
    // a wider light would hang over both of its edges.
    accents: [
      [-0.7447, 0.7031, -0.2329],
      [-0.3698, 0.7031, -0.1253],
      [0.0051, 0.7031, -0.0178],
      [0.38, 0.7031, 0.0898],
      [0.7549, 0.7031, 0.1973],
    ],
    accentAxis: [-0.2758, 0, 0.9612],
    accentScale: 0.014,
    displayScale: 0.95,
    triBudget: 6000,
    title: "Branding",
    kicker: "Instantly recognizable. Effortlessly remembered.",
    lede: "A mark, a voice and a system that holds up at 16 pixels and on a building. Documented so your team can use it.",
  },
  "social-media": {
    key: "social-media",
    meshName: "social-media",
    screenMeshName: "social-media_screen",
    // The only row whose screen image is an ATLAS rather than one picture. The
    // fan is three panels, but `social-media_screen` is ONE mesh carrying all
    // three plates, and its UVs sit in three thirds of this image - left,
    // middle, right, in that order. So it stays one mesh, one texture, one draw
    // call, with no per-instance UV offset anywhere in the material.
    //
    // Replacing the placeholder is still the same one-line swap as the others,
    // with one constraint the others do not have: the replacement must be
    // 1536x910 (three 512x910 tiles side by side). Any other aspect stretches,
    // because the panel geometry derives its 0.94 x 1.6707 screen from exactly
    // that tile ratio.
    screenImage: "/assets/screens/disciplines/social-placeholder.webp",
    modelPath: modelPath("social-media"),
    stillPath: stillPath("social-media"),
    material: "steel",
    // One reaction chip per panel, low on each panel's own face - a badge on a story, which
    // is what a reaction is.
    //
    // The three plates are one mesh but they are NOT coplanar; the fan gives each its own
    // normal, measured off the mesh as [-0.66, 0.06, 0.75], [-0.34, 0.06, 0.94] and
    // [0.05, 0.06, 1.00] about centres [-0.6185, 0.0035, -0.2305], [-0.0037, 0.0423, 0.0540]
    // and [0.6531, 0.0035, 0.2198]. Each chip is placed in ITS OWN plate's basis and pushed
    // 0.022 out along that plate's normal. A first pass put all three on the base at one
    // depth; the outer two ended up a fifth of a unit inside it and were invisible.
    //
    // `accentAxis` can only be one direction for the whole instanced mesh, so the outer two
    // chips sit tilted ~25 deg to their own plate. At 0.02 across that reads as a light
    // catching the panel at an angle, and the 0.022 offset is what keeps the raised edge
    // clear of the surface.
    accents: [
      [-0.7899, -0.3545, -0.3233],
      [-0.1972, -0.3157, 0.0303],
      [0.4655, -0.3545, 0.2727],
    ],
    accentAxis: [-0.3337, 0.0634, 0.9405],
    accentScale: 0.02,
    displayScale: 0.94,
    // Measured, post-bevel: 7,604 on the body plus 78 on the three plates.
    triBudget: 7682,
    title: "Social Media",
    kicker: "Turning followers into fans.",
    lede: "Content that has a reason to exist. We plan the calendar, produce the assets and read the numbers.",
  },
};

export const disciplineHref = (key: DisciplineKey) => `/services/${key}`;
