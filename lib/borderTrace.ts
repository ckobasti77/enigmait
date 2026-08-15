/**
 * Geometry for the two light streaks that unlock a process card.
 *
 * The connector from the spine lands on one edge of the card and splits there.
 * Both halves then run the card's border in opposite directions and meet at the
 * mirrored point on the opposite edge, where they vanish. The two halves arrive
 * *together* even when they are not the same geometric length, because both are
 * rendered with the same `pathLength` and animated over the same duration - the
 * normalisation makes each streak cover its own path in the same time. What an
 * off-midpoint entry does cost is symmetry of *speed*: the longer half visibly
 * runs faster. Near the midline that difference is invisible; at a corner it
 * reads as a glitch, so keep the entry away from corners.
 *
 * Both paths are rendered with `pathLength={TRACE_LENGTH}`, so callers animate
 * `strokeDashoffset` in normalised units and never have to measure. The length
 * is 1000 rather than the obvious 1 because GSAP rounds what it writes: a dash
 * offset of `0.17` lands in the DOM as `0px` and the streak never appears.
 */

/** Which edge the connector arrives on. */
export type BorderTraceEntry = "top" | "bottom" | "left" | "right";

/** Normalised length every trace path is rendered at. */
export const TRACE_LENGTH = 1000;

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Two half-perimeter paths from `entry` to the mirrored point on the opposite
 * edge - the first clockwise, the second counter-clockwise.
 *
 * `entryY` (left/right entries only) moves the entry off the vertical midpoint
 * to an absolute y in the same pixel space as `width`/`height` - the process
 * cards use it to land the connector exactly on the image/body seam. It is
 * clamped clear of the corner arcs. `top` entries ignore it.
 *
 * `inset` pulls the stroke inside the box by half its width so a 1px trace sits
 * on the border rather than straddling it.
 */
export function buildBorderTracePaths(
  width: number,
  height: number,
  radius: number,
  entry: BorderTraceEntry,
  entryY?: number,
  inset = 0.5
): [string, string] {
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;

  if (x1 <= x0 || y1 <= y0) return ["", ""];

  const r = Math.max(0, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
  const cx = round((x0 + x1) / 2);
  const cy = round(
    entryY === undefined
      ? (y0 + y1) / 2
      : Math.min(Math.max(entryY, y0 + r), y1 - r)
  );

  // sweep 1 = clockwise in SVG's y-down space.
  const arc = (x: number, y: number, sweep: 0 | 1) =>
    `A${round(r)},${round(r)} 0 0 ${sweep} ${round(x)},${round(y)}`;
  const L = (x: number, y: number) => `L${round(x)},${round(y)}`;
  const M = (x: number, y: number) => `M${round(x)},${round(y)}`;

  if (entry === "top") {
    return [
      // right side down
      [M(cx, y0), L(x1 - r, y0), arc(x1, y0 + r, 1), L(x1, y1 - r), arc(x1 - r, y1, 1), L(cx, y1)].join(" "),
      // left side down
      [M(cx, y0), L(x0 + r, y0), arc(x0, y0 + r, 0), L(x0, y1 - r), arc(x0 + r, y1, 0), L(cx, y1)].join(" "),
    ];
  }

  if (entry === "bottom") {
    // Mirror of "top": same split, run from the bottom edge midpoint instead,
    // for panels that unfurl upward from a trigger below them. Vertical
    // mirroring reverses the traversal direction, which is what flips the arc
    // sweep flags relative to the "top" case.
    return [
      // right side up
      [M(cx, y1), L(x1 - r, y1), arc(x1, y1 - r, 0), L(x1, y0 + r), arc(x1 - r, y0, 0), L(cx, y0)].join(" "),
      // left side up
      [M(cx, y1), L(x0 + r, y1), arc(x0, y1 - r, 1), L(x0, y0 + r), arc(x0 + r, y0, 1), L(cx, y0)].join(" "),
    ];
  }

  if (entry === "left") {
    return [
      // up and over the top
      [M(x0, cy), L(x0, y0 + r), arc(x0 + r, y0, 1), L(x1 - r, y0), arc(x1, y0 + r, 1), L(x1, cy)].join(" "),
      // down and under the bottom
      [M(x0, cy), L(x0, y1 - r), arc(x0 + r, y1, 0), L(x1 - r, y1), arc(x1, y1 - r, 0), L(x1, cy)].join(" "),
    ];
  }

  return [
    // down and under the bottom
    [M(x1, cy), L(x1, y1 - r), arc(x1 - r, y1, 1), L(x0 + r, y1), arc(x0, y1 - r, 1), L(x0, cy)].join(" "),
    // up and over the top
    [M(x1, cy), L(x1, y0 + r), arc(x1 - r, y0, 0), L(x0 + r, y0), arc(x0, y0 + r, 0), L(x0, cy)].join(" "),
  ];
}
