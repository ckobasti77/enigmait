import { BufferAttribute, BufferGeometry } from "three";

import type { Discipline, Vec3 } from "@/constants/disciplines";

/**
 * THE THREE CARDS BEHIND THE GLASS, and the placement that makes the lens read as a lens.
 *
 * `seo-geo` is a magnifier, and until now it magnified nothing: there was no geometry behind
 * the lens, so the only transmissive material on the site did no visible work. This module
 * builds what it looks at - Google, ChatGPT and Claude, the two kinds of search the discipline
 * is named for, standing a little way behind the glass.
 *
 * THE CARDS DO NOT MOVE. Nothing here reads the pointer, and the mesh this geometry ends up in
 * has no `useFrame`. The model turns with the cursor and the backdrop stays put, so the
 * magnified circle SWEEPS ACROSS the cards - which is the whole illusion. A backdrop that
 * turned with the model would be rigidly locked to the lens and would read as a sticker on the
 * glass, however far behind it sat.
 *
 * One geometry, three quads, one atlas, ONE DRAW CALL. The quads sit at slightly different
 * depths inside that single geometry, so the group still has depth to it without costing a
 * mesh each - `SECTION_SPEC` allows this model four draw calls and it stays inside that.
 */

/**
 * Distance behind the lens, along the lens normal, in the GLB's object space.
 *
 * This is the knob for how much the magnified circle travels. The model turns +-12 deg about
 * the origin; the lens centre sits at an XZ radius of ~0.29 so it swings ~0.12 on its own,
 * and the normal turning +-12 deg moves the sight line by a further `2 * d * tan(12deg)`.
 * At 0.6 that totals ~0.39 of travel across a cluster ~1.14 wide - about a third of it, which
 * is plainly visible without the lens ever running off the edge of the cards.
 *
 * Further back means more travel and a smaller apparent card; closer means the opposite.
 */
export const BACKDROP_DISTANCE = 0.6;

/**
 * Cell aspect of `seo-geo-logos.webp` (512 x 620 per card). Kept as the ratio rather than the
 * pixel pair because only the shape matters here - `scripts/build-lens-logo-atlas.mjs` owns
 * the pixels.
 */
const ATLAS_COLUMNS = 3;
const CELL_ASPECT = 620 / 512;

/**
 * Card width in object space. The lens aperture is 0.948 across, so a cluster ~1.14 wide
 * leaves the cards standing ~0.09 proud of the rim on each side - enough that the un-magnified
 * card is visible around the glass at the same time as the magnified one is visible through it.
 * That side-by-side comparison is what tells the eye it is looking at a magnifier.
 */
const CARD_W = 0.44;
const CARD_H = CARD_W * CELL_ASPECT;

/**
 * THREE SEPARATE CARDS WITH AIR BETWEEN THEM - not a mosaic. The gap is the point: with the
 * depth stagger below it is what makes them read as three objects floating at three distances
 * rather than one sheet cut into three.
 *
 * The offsets are set independently rather than derived from the card size, because the two
 * axes answer different constraints.
 *
 * ACROSS: the cluster has to be wider than the 0.948 aperture, so a card is visible at its own
 * size beside the glass at the same moment its middle is visible enlarged through it. That
 * side-by-side is what says "magnifier" rather than "picture of a logo".
 *
 * DOWN: it has to stay inside the frame. The lens sits high on the model - centre at y 0.478 -
 * and the camera only reaches y 1.171 at this depth, so there is barely 0.6 of headroom above
 * it. Spacing the rows as far apart as the columns puts the top two cards through the ceiling
 * and they get cut off square, which reads as a bug rather than as a crop. So the rows sit
 * closer together than the columns do and the cluster ends up landscape.
 */
const COLUMN_STEP = 0.3;
const ROW_TOP = 0.24;
const ROW_BOTTOM = -0.3;

/**
 * Depth stagger - the only thing here that is taste rather than geometry. Small on purpose:
 * enough that the three do not read as one flat card cut into three, not so much that the far
 * one visibly shrinks.
 */
const CARDS: { cell: number; x: number; y: number; z: number }[] = [
  { cell: 0, x: -COLUMN_STEP, y: ROW_TOP, z: 0 },
  { cell: 1, x: COLUMN_STEP, y: ROW_TOP, z: -0.06 },
  { cell: 2, x: 0, y: ROW_BOTTOM, z: -0.12 },
];

/**
 * Three quads written straight into one buffer.
 *
 * UVs are laid out for a texture at its DEFAULT `flipY` (true) - i.e. an image loaded the way
 * the DOM hands it over, top row at v = 1. Deliberately NOT prepared with
 * `prepareScreenTexture`, which sets `flipY = false` because glTF puts its UV origin top-left:
 * correct for the authored screen meshes, upside down for a quad built here.
 */
export function buildLensBackdropGeometry(): BufferGeometry {
  const positions = new Float32Array(CARDS.length * 4 * 3);
  const normals = new Float32Array(CARDS.length * 4 * 3);
  const uvs = new Float32Array(CARDS.length * 4 * 2);
  const indices = new Uint16Array(CARDS.length * 6);

  const halfW = CARD_W / 2;
  const halfH = CARD_H / 2;

  CARDS.forEach((card, index) => {
    const u0 = card.cell / ATLAS_COLUMNS;
    const u1 = (card.cell + 1) / ATLAS_COLUMNS;

    // Bottom-left, bottom-right, top-left, top-right.
    const corners: [number, number, number, number][] = [
      [card.x - halfW, card.y - halfH, u0, 0],
      [card.x + halfW, card.y - halfH, u1, 0],
      [card.x - halfW, card.y + halfH, u0, 1],
      [card.x + halfW, card.y + halfH, u1, 1],
    ];

    corners.forEach(([x, y, u, v], corner) => {
      const p = (index * 4 + corner) * 3;
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = card.z;
      normals[p] = 0;
      normals[p + 1] = 0;
      normals[p + 2] = 1;

      const t = (index * 4 + corner) * 2;
      uvs[t] = u;
      uvs[t + 1] = v;
    });

    const base = index * 4;
    const i = index * 6;
    indices[i] = base;
    indices[i + 1] = base + 1;
    indices[i + 2] = base + 2;
    indices[i + 3] = base + 2;
    indices[i + 4] = base + 1;
    indices[i + 5] = base + 3;
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * The fill card: how big, and how far behind the cards it sits.
 *
 * Generous on purpose. It is never drawn to the screen (see `LensBackdrop` in
 * `DisciplineModel.tsx`), only into the transmission buffer, so making it comfortably larger
 * than anything the lens can reach costs one flat quad and removes a whole class of edge case -
 * the lens sweeps, and a fill that ran out at the wrong moment would show as a bright crescent.
 */
export const BACKDROP_FILL_SIZE = 2.4;
export const BACKDROP_FILL_DEPTH = -0.2;

/**
 * How far the fill leans from `--background` toward `--surface-section`.
 *
 * Zero, i.e. the page colour exactly. It was briefly 0.5, on the theory that the fill should
 * stand in for the lift the background video's screen blend gives the real page - but measured
 * against the render that lean moved the darkest pixel inside the lens by three counts out of
 * thirty, so it was buying nothing and hiding what the residual lift actually is (see
 * `createLensMaterial`). Kept as a named knob rather than deleted because it is the right place
 * to compensate if the glass is ever made to sit closer to the page.
 */
export const BACKDROP_FILL_LIFT = 0;

export type LensBackdropTransform = {
  position: Vec3;
  rotationY: number;
};

/**
 * Where the cluster stands, derived from the model rather than typed next to it.
 *
 * Both numbers come out of `constants/disciplines.ts`: `lensCentre` is the measured centre of
 * the glass and `accentAxis` is the lens normal (the same vector the accent ring is built on).
 * Deriving the transform means the backdrop cannot drift away from the lens if the model is
 * ever re-exported - there is one source for where the glass is, not two.
 *
 * The plane's own normal is +Z, so aligning it to the lens normal is a single yaw. That the
 * pitch is zero is a fact about the model, not an approximation: the magnifier is exported with
 * `TILT_DEG = 0`, which is why `accentAxis` has an exact 0 in Y.
 */
export function lensBackdropTransform(
  discipline: Discipline,
  distance: number = BACKDROP_DISTANCE
): LensBackdropTransform | null {
  const centre = discipline.lensCentre;
  if (!centre) return null;

  const [nx, ny, nz] = discipline.accentAxis;
  const length = Math.hypot(nx, ny, nz) || 1;
  const n: Vec3 = [nx / length, ny / length, nz / length];

  return {
    position: [
      centre[0] - n[0] * distance,
      centre[1] - n[1] * distance,
      centre[2] - n[2] * distance,
    ],
    rotationY: Math.atan2(n[0], n[2]),
  };
}
