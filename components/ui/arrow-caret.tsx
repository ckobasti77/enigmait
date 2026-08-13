/* ---------------------------------------------------------------------------
   The caret

   Two arms, both starting at the JOINT. That is the whole trick: `stroke-
   dashoffset` draws a path from its own start, so with the `M` on the vertex a
   single CSS transition on both paths runs the light outward in two directions
   at once. Drawn from the tips inward instead, the same transition would read
   as the caret collapsing.

   `pathLength` normalises both arms to the same scale, so the dash numbers in
   the stylesheet are percentages of an arm rather than user units - the arms
   can be re-shaped here without the CSS following.

   Style lives entirely in `.service-arrow-caret / -arm / -spark` (globals.css);
   the host button owns its own position and the hover trigger. Shared so the
   services carousel and the disciplines stepper draw the exact same caret.
   --------------------------------------------------------------------------- */
const CARET_LENGTH = 100;

export function ArrowCaret({ direction }: { direction: 1 | -1 }) {
  // The joint sits on the side the caret points at; the tips on the other.
  const joint = direction < 0 ? 8 : 16;
  const tip = direction < 0 ? 16 : 8;
  const arms = [`M${joint} 12 L${tip} 4`, `M${joint} 12 L${tip} 20`];

  return (
    <svg
      className="service-arrow-caret"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <g className="service-arrow-arm">
        {arms.map((d) => (
          <path key={d} d={d} pathLength={CARET_LENGTH} />
        ))}
      </g>
      <g className="service-arrow-spark">
        {arms.map((d) => (
          <path key={d} d={d} pathLength={CARET_LENGTH} />
        ))}
      </g>
    </svg>
  );
}
