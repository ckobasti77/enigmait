"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import clsx from "clsx";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";
import {
  STEPPER_DOT_DURATION,
  STEPPER_DOT_EASE_CSS,
} from "./disciplinesTiming";

/**
 * The transition table's `stepper tacka` row, handed to the stylesheet. The dot's change of
 * state is `aria-current`, which React writes anyway, so the animation is a CSS transition
 * rather than a tween - but its duration and curve still come from `disciplinesTiming.ts`,
 * which is why they arrive as custom properties instead of being retyped in `globals.css`.
 */
const DOT_TIMING = {
  "--discipline-dot-duration": `${STEPPER_DOT_DURATION}s`,
  "--discipline-dot-ease": STEPPER_DOT_EASE_CSS,
} as CSSProperties;

type DisciplineStepperProps = {
  index: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  className?: string;
};

/** One chevron, pointing up. Everything else is a rotation in CSS. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={clsx("h-3.5 w-3.5", className)}
    >
      <path
        d="M3 10.5 8 5.5l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The stepper: an arrow above the column, an arrow below it, the dots between.
 * Below `lg` the whole rail turns horizontal and sits under the canvas, and the
 * chevrons turn with it - "previous and next" is the meaning, the axis is only
 * where there is room for it.
 *
 * Real `<button>`s, never divs. One click is exactly one step, the ends are
 * `disabled` and there is no wrap: index 5 does not roll round to 0, because a
 * list that wraps has no ends, and the ends are what tell the visitor the
 * section is finished and the page carries on.
 */
export default function DisciplineStepper({
  index,
  onStep,
  onSelect,
  className,
}: DisciplineStepperProps) {
  const last = DISCIPLINE_ORDER.length - 1;

  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  /**
   * Whether the focus should follow the index.
   *
   * Only ever set by the dots' own key handler. A step that came from the wheel, an arrow
   * button or a swipe must NOT pull focus into the rail - stealing focus because the model
   * changed is how a keyboard user loses their place - but a roving tabindex that moves
   * without the focus leaves the focus on an element that is now `tabindex="-1"`, and the
   * next Tab starts from the top of the document. So the two move together exactly when the
   * arrow keys drove them, and not otherwise.
   */
  const rovingRef = useRef(false);

  useEffect(() => {
    if (!rovingRef.current) return;
    rovingRef.current = false;
    dotRefs.current[index]?.focus();
  }, [index]);

  /**
   * Both axes, because the rail has both: vertical between the canvas and the copy from
   * `lg` up, horizontal under the canvas below it. A key that names a direction the rail is
   * not currently drawn in still means "previous" or "next" - which is what the arrows
   * already mean - so binding all four is one rule, not a special case.
   *
   * The ends are respected here as they are everywhere else in this section: no wrap, and a
   * key that cannot move the index is not consumed, so the page keeps its own arrow-key
   * scrolling once the list is finished.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    let next = index;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = index + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }

    next = Math.max(0, Math.min(last, next));
    if (next === index) return;

    event.preventDefault();
    rovingRef.current = true;
    onSelect(next);
  };

  return (
    <div className={clsx("discipline-stepper", className)} style={DOT_TIMING}>
      <button
        type="button"
        className="discipline-arrow"
        data-dir="prev"
        aria-label="Previous discipline"
        disabled={index === 0}
        onClick={() => onStep(-1)}
      >
        <Chevron className="-rotate-90 lg:rotate-0" />
      </button>

      <ol
        className="discipline-dots"
        aria-label="Discipline list"
        onKeyDown={onKeyDown}
      >
        {DISCIPLINE_ORDER.map((key, position) => (
          <li key={key}>
            <button
              type="button"
              ref={(node) => {
                dotRefs.current[position] = node;
              }}
              className="discipline-dot"
              // The dot is a disc with no text, so the discipline's name is the
              // only accessible name it can have.
              aria-label={disciplines[key].title}
              aria-current={position === index ? "true" : undefined}
              // ROVING TABINDEX. Six dots are one control, not six tab stops: Tab
              // lands on the rail once, the arrow keys move inside it, and the next
              // Tab leaves. The one that is reachable is the one that is current.
              tabIndex={position === index ? 0 : -1}
              onClick={() => onSelect(position)}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="discipline-arrow"
        data-dir="next"
        aria-label="Next discipline"
        disabled={index === last}
        onClick={() => onStep(1)}
      >
        <Chevron className="rotate-90 lg:rotate-180" />
      </button>
    </div>
  );
}
