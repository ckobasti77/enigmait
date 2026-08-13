import clsx from "clsx";
import {
  LOGO_CUBE_GRADIENT,
  LOGO_CUBE_GRADIENT_STOPS,
  LOGO_CUBE_PATH_LENGTH,
  LOGO_CUBE_RINGS,
  LOGO_CUBE_STROKE,
  LOGO_CUBE_VIEWBOX,
} from "@/constants/logoCubeMark";

// One mark per page, so one id is enough; two instances would still resolve to
// the same - identical - gradient.
const GRADIENT_ID = "enigma-cube-mark-gradient";

/**
 * The emblem, drawn rather than photographed: the same cube at the same angle as
 * `logo-emblem.png`, as four stroked rings that draw themselves and fade, over
 * and over. The loop is pure CSS (`.logo-cube-ring` in globals.css) - there is
 * no clock, no canvas and no WebGL context to spend on a 52px mark.
 */
export default function EnigmaCubeMark({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("logo-cube-mark", className)}
      viewBox={`0 0 ${LOGO_CUBE_VIEWBOX} ${LOGO_CUBE_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1={LOGO_CUBE_GRADIENT.x1}
          y1={LOGO_CUBE_GRADIENT.y1}
          x2={LOGO_CUBE_GRADIENT.x2}
          y2={LOGO_CUBE_GRADIENT.y2}
        >
          {LOGO_CUBE_GRADIENT_STOPS.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      {LOGO_CUBE_RINGS.map((ring) => (
        <path
          key={ring}
          className="logo-cube-ring"
          d={ring}
          pathLength={LOGO_CUBE_PATH_LENGTH}
          fill="none"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={LOGO_CUBE_STROKE}
          strokeLinejoin="miter"
        />
      ))}
    </svg>
  );
}
