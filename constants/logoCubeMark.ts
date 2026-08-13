/**
 * The Enigma emblem as a wireframe cube.
 *
 * The mark is four square rings, one lying on each of the cube's top, bottom,
 * left and right faces - that is the whole shape of `public/logos/logo-emblem.png`,
 * whose woven look is a solid-render artefact of the bars' thickness. Drawn as
 * lines there is nothing to weave, so the rings are simply projected and stroked.
 *
 * The camera is measured off that PNG, not guessed: rings were projected over a
 * grid of angles and scored by silhouette IoU against the emblem's alpha mask.
 * The optimum lands on 33 deg of azimuth and 22 deg of elevation - the same
 * elevation the hero cube's camera carries (`HeroCube.tsx` sits at 22 deg, on
 * the mirrored side), so the two marks read as one object seen twice.
 *
 * Everything is emitted into the emblem PNG's own 1024 canvas and fitted to the
 * box that PNG's artwork occupies inside it, so swapping the image for this
 * component changes nothing about the mark's size or position in a layout.
 */

type Vec3 = readonly [number, number, number];
type Vec2 = readonly [number, number];

const CAMERA_AZIMUTH = 33; // deg, measured off logo-emblem.png
const CAMERA_ELEVATION = 22; // deg, the hero camera's elevation
const CAMERA_DISTANCE = 9;
const CAMERA_FOV = 28.8; // deg, as HERO_SPEC sets it
/**
 * Half-extent of each ring inside its face. At 1 the rings would meet at the
 * cube's corners and collapse into a plain 12-edge wireframe; the inset is what
 * keeps them four separate squares, which is what the emblem actually is.
 */
const RING_INSET = 0.9;

/** The emblem PNG's own canvas, and the box its artwork occupies inside it. */
export const LOGO_CUBE_VIEWBOX = 1024;
const ARTWORK_BOX = { x: 62, y: 100, width: 879, height: 849 } as const;

/** ~2px at the navbar's 52px - a line, where the PNG had a 46-unit solid bar. */
export const LOGO_CUBE_STROKE = 40;

/**
 * Normalised path length, as on the process-card trace: the four rings are not
 * the same length on screen, and without this each would draw at its own speed
 * off one shared CSS duration. 1000 rather than 1 because a sub-pixel dash
 * offset rounds to `0px` on the way into the DOM.
 */
export const LOGO_CUBE_PATH_LENGTH = 1000;

const D2R = Math.PI / 180;

const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / length, a[1] / length, a[2] / length];
};

const EYE: Vec3 = [
  CAMERA_DISTANCE * Math.cos(CAMERA_ELEVATION * D2R) * Math.sin(CAMERA_AZIMUTH * D2R),
  CAMERA_DISTANCE * Math.sin(CAMERA_ELEVATION * D2R),
  CAMERA_DISTANCE * Math.cos(CAMERA_ELEVATION * D2R) * Math.cos(CAMERA_AZIMUTH * D2R),
];
const FORWARD = normalize(subtract([0, 0, 0], EYE));
const RIGHT = normalize(cross(FORWARD, [0, 1, 0]));
const UP = cross(RIGHT, FORWARD);
const FOCAL = 1 / Math.tan((CAMERA_FOV * D2R) / 2);

/** Perspective projection into a y-up [-1, 1] view. */
const project = (point: Vec3): Vec2 => {
  const offset = subtract(point, EYE);
  const depth = dot(offset, FORWARD);
  return [(FOCAL * dot(offset, RIGHT)) / depth, (FOCAL * dot(offset, UP)) / depth];
};

const s = RING_INSET;
const RINGS: readonly (readonly Vec3[])[] = [
  // top, then the two side faces together, then bottom - the order the CSS
  // staggers the draw in, so the cube assembles lid-first.
  [[-s, 1, -s], [s, 1, -s], [s, 1, s], [-s, 1, s]],
  [[-1, -s, -s], [-1, s, -s], [-1, s, s], [-1, -s, s]],
  [[1, -s, -s], [1, s, -s], [1, s, s], [1, -s, s]],
  [[-s, -1, -s], [s, -1, -s], [s, -1, s], [-s, -1, s]],
];

const projected = RINGS.map((ring) => ring.map(project));
const xs = projected.flat().map(([x]) => x);
const ys = projected.flat().map(([, y]) => y);
const bounds = {
  minX: Math.min(...xs),
  maxX: Math.max(...xs),
  minY: Math.min(...ys),
  maxY: Math.max(...ys),
};

// Centre lines are fitted to the artwork box shrunk by the stroke, so the drawn
// mark - stroke included - ends up exactly where the PNG's pixels were.
const SCALE = Math.min(
  (ARTWORK_BOX.width - LOGO_CUBE_STROKE) / (bounds.maxX - bounds.minX),
  (ARTWORK_BOX.height - LOGO_CUBE_STROKE) / (bounds.maxY - bounds.minY)
);

const toCanvas = ([x, y]: Vec2): Vec2 => [
  ARTWORK_BOX.x + ARTWORK_BOX.width / 2 + (x - (bounds.minX + bounds.maxX) / 2) * SCALE,
  // SVG y grows downward; the projection's grows up.
  ARTWORK_BOX.y + ARTWORK_BOX.height / 2 - (y - (bounds.minY + bounds.maxY) / 2) * SCALE,
];

/**
 * Rotates a ring so it starts at its topmost corner and runs clockwise. The dash
 * offset always draws from a path's first point, so without this the four rings
 * would each start wherever the cube's vertex order happened to put them and the
 * draw would read as four unrelated strokes instead of one gesture.
 */
const orderForDraw = (ring: Vec2[]): Vec2[] => {
  let start = 0;
  for (let i = 1; i < ring.length; i += 1) {
    if (ring[i][1] < ring[start][1]) start = i;
  }
  const rotated = [...ring.slice(start), ...ring.slice(0, start)];
  const area = rotated.reduce((sum, point, i) => {
    const next = rotated[(i + 1) % rotated.length];
    return sum + (point[0] * next[1] - next[0] * point[1]);
  }, 0);
  // Positive shoelace area in a y-down space means counter-clockwise on screen.
  return area > 0 ? [rotated[0], ...rotated.slice(1).reverse()] : rotated;
};

export const LOGO_CUBE_RINGS: readonly string[] = projected.map((ring) => {
  const points = orderForDraw(ring.map(toCanvas));
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
});

/**
 * The hero's gradient axis projects to (0.823, 0.569) in screen space, so the
 * emblem's ramp runs the same diagonal - the two marks share one light.
 *
 * The ramp is pinned to the mark's own extent along that axis, not to the
 * artwork box's corners: the box is a rectangle and the cube is not, so
 * corner-to-corner spends both end stops on empty canvas and the emblem loses
 * the saturated cyan and violet it is recognised by.
 */
const GRADIENT_AXIS_RAW: Vec2 = [0.823, 0.569];
const gradientAxisLength = Math.hypot(GRADIENT_AXIS_RAW[0], GRADIENT_AXIS_RAW[1]);
// Unit length, so a point's position along the ramp is just its dot product.
const GRADIENT_AXIS: Vec2 = [
  GRADIENT_AXIS_RAW[0] / gradientAxisLength,
  GRADIENT_AXIS_RAW[1] / gradientAxisLength,
];
const gradientExtent = projected
  .flat()
  .map(toCanvas)
  .map(([x, y]) => x * GRADIENT_AXIS[0] + y * GRADIENT_AXIS[1]);
const gradientStart = Math.min(...gradientExtent);
const gradientEnd = Math.max(...gradientExtent);

export const LOGO_CUBE_GRADIENT = {
  x1: GRADIENT_AXIS[0] * gradientStart,
  y1: GRADIENT_AXIS[1] * gradientStart,
  x2: GRADIENT_AXIS[0] * gradientEnd,
  y2: GRADIENT_AXIS[1] * gradientEnd,
} as const;

/** The hero cube's ramp, sampled off the same logo. */
export const LOGO_CUBE_GRADIENT_STOPS: readonly (readonly [number, string])[] = [
  [0, "#01BCF9"],
  [0.25, "#0084F7"],
  [0.5, "#0841F4"],
  [0.75, "#4E1BF3"],
  [1, "#8405E5"],
];
