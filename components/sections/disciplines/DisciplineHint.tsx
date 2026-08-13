"use client";

import { useEffect, useState, type CSSProperties } from "react";

import {
  HINT_FADE,
  HINT_FIRST_DELAY_MS,
  HINT_REPEAT_MS,
  HINT_VISIBLE_MS,
} from "./disciplinesTiming";

const FADE_TIMING = {
  "--discipline-hint-fade": `${HINT_FADE}s`,
} as CSSProperties;

/**
 * The tutorial hint: a small pill over the model that says what to do with it.
 *
 * The wheel capture is the section's main interaction and it is completely
 * invisible - there is no scrollbar, no handle and no cursor change to find. So
 * the section says it out loud, on a clock: once about six seconds after the
 * stage settles on screen, then every twenty while nothing has happened. The
 * visitor who needs this is the one who has stopped, which is exactly the one a
 * hover affordance never reaches.
 *
 * IT IS RETIRED BY ANY INPUT, not by being dismissed. `armed` goes false the
 * moment `useDisciplineIndex` sees a wheel notch, a touch, a dot or an arrow
 * key, and it never comes back for the life of the page - a hint that returns
 * after you have proved you understood it is nagging, not help.
 *
 * `armed` gates the SCHEDULE and the render separately, and that split is what
 * keeps the exit graceful. Disarming stops the clock and the pill fades out on
 * its own transition; unmounting it there would pop it off screen mid-fade.
 * Only the parent unmounts this, and only while the whole stage is off screen,
 * so a fresh mount always starts from a clean clock with nobody watching.
 *
 * BOTH LABELS ARE IN THE DOM AND CSS PICKS ONE. The obvious version reads
 * `matchMedia` into state and renders one string, and it is wrong twice here:
 * the server has no `matchMedia` (so the first client render disagrees with the
 * markup it is hydrating), and `LanguageProvider` translates text nodes it has
 * walked, so a label that only exists after a media query resolves is a label
 * arriving behind the walker. Two spans and a media query have neither problem.
 */
export default function DisciplineHint({ armed }: { armed: boolean }) {
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (!armed) return;

    let hideTimer = 0;
    let repeatTimer = 0;

    const show = () => {
      setShowing(true);
      hideTimer = window.setTimeout(() => setShowing(false), HINT_VISIBLE_MS);
    };

    const firstTimer = window.setTimeout(() => {
      show();
      repeatTimer = window.setInterval(show, HINT_REPEAT_MS);
    }, HINT_FIRST_DELAY_MS);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(hideTimer);
      window.clearInterval(repeatTimer);
    };
  }, [armed]);

  return (
    /*
      `data-reveal="off"`: chrome that has to be readable the instant it appears,
      the first case the text-reveal skill names for the opt-out. It carries no
      word-by-word debt with it - the site-wide pass owns copy, and this is a
      control label that fades in and out on its own clock.

      `aria-hidden` because the column already carries the same instruction as
      its accessible name ("Use the arrow keys or the mouse wheel to change
      discipline"), and a pill that reappears every twenty seconds inside a
      screen reader is an interruption, not an affordance.
    */
    <div
      className="discipline-hint"
      style={FADE_TIMING}
      data-reveal="off"
      data-visible={armed && showing}
      aria-hidden="true"
    >
      <span className="discipline-hint-label discipline-hint-label--wheel">
        Scroll here
      </span>
      <span className="discipline-hint-label discipline-hint-label--swipe">
        Swipe
      </span>
      <span className="discipline-hint-glyph">⇆</span>
    </div>
  );
}
