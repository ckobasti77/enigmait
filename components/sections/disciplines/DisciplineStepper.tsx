"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import clsx from "clsx";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";
import { ArrowCaret } from "@/components/ui/arrow-caret";
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

/**
 * The stepper: an arrow, the dots, an arrow, in a horizontal rail under the row.
 * Horizontal at every width now, because the slide is horizontal at every width
 * - a vertical rail with up/down chevrons next to a panel that travels sideways
 * describes a motion the section no longer has.
 *
 * Real `<button>`s, never divs. One click is exactly one step, and NOTHING here
 * is `disabled`: the list wraps, so index 5 rolls round to 0 and 0 rolls back to
 * 5. The ends used to be what told the visitor the section was finished and the
 * page carried on; that job now belongs to the wheel's capture budget in
 * `useDisciplineIndex`, which hands the page's scroll back after one lap.
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
   * All four arrow keys, because the rail is horizontal but the wheel that drives it is
   * vertical - a key naming either axis still means "previous" or "next", which is what the
   * arrow buttons already mean.
   *
   * The arrows WRAP, exactly as the buttons do, so they always move and are always consumed.
   * Home and End name a destination rather than a direction, so a key that cannot move the
   * index is left alone and the page keeps its own scrolling.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    let next = index;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
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
        onClick={() => onStep(-1)}
      >
        <ArrowCaret direction={-1} />
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
        onClick={() => onStep(1)}
      >
        <ArrowCaret direction={1} />
      </button>
    </div>
  );
}
