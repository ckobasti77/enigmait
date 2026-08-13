/**
 * The section's clock, as named constants - the pattern `heroTiming.ts` sets. Local values
 * are derived from these, never retyped.
 *
 * WHO DRIVES WHAT, and this is the division SECTION_SPEC asks to see written down:
 *
 *   GSAP timeline  ->  scale, opacity, emissiveIntensity, and the reel strip's position
 *   useFrame       ->  the model group's rotation.x / rotation.y and its own position.y
 *
 * The two lists do not intersect. Two schedulers over one value is jitter that does not
 * debug, and the failure mode is a model that stutters only while a swap is in flight -
 * which is the hardest kind of stutter to catch, because it never reproduces at rest.
 *
 * Note that the strip and the model both write a `position`, and that is not a collision:
 * the reel writes the STRIP's, the model writes its own, and the strip is the parent. The
 * float rides on top of the slide because the transforms compose, which is the point - and
 * they are on different axes anyway now that the strip travels sideways.
 */

const TAU = Math.PI * 2;
/** Exported so the frame loop can wrap its accumulated angles without redefining it. */
export const TWO_PI = TAU;

/** Ambient float, sine.inOut, y +-0.04. */
export const AMBIENT_FLOAT_SECONDS = 6.5;
export const AMBIENT_FLOAT_AMPLITUDE = 0.04;
export const AMBIENT_FLOAT_SPEED = TAU / AMBIENT_FLOAT_SECONDS;

/**
 * NO AMBIENT ROTATION, DELIBERATELY. SECTION_SPEC's transition table has an `ambient` row
 * asking for one full turn every 24 s, and it was built and then taken back out.
 *
 * The table was written for the abstract machined forms the section originally had, which
 * have no front. Faza C replaced them with devices, and a device that turns on its own spends
 * half of every cycle showing the viewer its back - including, at random, the moment a swap
 * lands. The screen is the content of this section; a rotation that hides it for twelve
 * seconds at a time is not ambience, it is a shutter.
 *
 * All the turning is the pointer's, and only the pointer's. That also removes the seam
 * question the ambient row came with: there is no loop to close.
 */

/**
 * The model's resting yaw: where it sits with the cursor at the far LEFT of the window, and
 * where it sits with no cursor at all - first paint, a touch device, a pointer that never
 * enters the window.
 *
 * Not zero. Dead square to the camera flattens a machined object into an elevation drawing;
 * a few degrees off-axis is what keeps a second face in the frame and the bevels catching
 * light. Negative turns the model's front slightly towards screen-left.
 */
export const MODEL_BASE_YAW = -0.1; // rad, ~6 deg

/**
 * Yaw, and the whole of the model's turning.
 *
 * It is NOT symmetric. The cursor's x runs 0..1 across the WINDOW, and the model travels from
 * `MODEL_BASE_YAW` at the left edge to `MODEL_BASE_YAW + POINTER_YAW_MAX` at the right edge.
 * One-directional on purpose: the model has a rest pose it can be found in, and the cursor
 * only ever turns it away from that pose and back.
 *
 * Measured against the window rather than against the canvas because the yaw is described in
 * terms of the window - cursor at the left edge of the screen means the rest pose, cursor at
 * the right edge means fully turned. Measured against the canvas, the model would hit full
 * yaw somewhere in the middle of the page and then sit there for the whole right-hand half.
 *
 * 30 degrees is the whole travel. Far enough to read as the object turning, short enough that
 * the screen never rotates out of legibility at the far end.
 */
export const POINTER_YAW_MAX = 0.5236; // rad, 30 deg

/**
 * Tilt. This one IS symmetric, measured about the centre of the CANVAS rather than the
 * window, because the tilt reacts to where the cursor is relative to the model and the model
 * travels up the screen as the page scrolls. It stays small - it is the nod that sells the
 * yaw, not a second axis of its own.
 */
export const POINTER_PITCH_MAX = 0.05; // rad
export const POINTER_LERP = 0.08;

/** Frame time is clamped before it drives anything, so a tab wake-up cannot jump the model. */
export const MAX_FRAME_DELTA = 0.05; // s

/* ---------------------------------------------------------------------------
   The input engine (Faza D).

   The section is NOT pinned and scroll position drives nothing. The index moves
   on three inputs only - wheel while the cursor is over the 3D column, a click
   on an arrow or a dot, and the arrow keys while that column has focus - plus a
   horizontal swipe on touch. Everywhere else on the section the page just
   scrolls, because nothing is listening there.

   The list WRAPS: after the last discipline comes the first, in both directions.
   Which removes the ends - and the ends used to be what handed the page's scroll
   back. See `WHEEL_CAPTURE_BUDGET` in `useDisciplineIndex.ts` for what replaced
   them.
   --------------------------------------------------------------------------- */

/**
 * Normalised wheel travel that buys one step. Roughly one firm mouse notch and
 * a bit, or a short trackpad push - low enough that the section answers, high
 * enough that a stray flick of the wrist does not.
 */
export const WHEEL_STEP_THRESHOLD = 120; // px, after deltaMode normalisation

/**
 * Dead time after a step. A trackpad flick keeps sending events for most of a
 * second after the fingers leave the pad; during the cooldown that tail is
 * eaten and NOT banked, which is what keeps one flick to one model.
 */
export const WHEEL_STEP_COOLDOWN_MS = 450;

/** A gap this long means a new gesture, so the buffer starts from zero again. */
export const WHEEL_BUFFER_RESET_MS = 200;

/**
 * `DOM_DELTA_LINE` in pixels. Firefox reports wheel deltas in lines (deltaY of
 * about 3 per notch) where Chrome reports pixels (about 100), so without this
 * the same threshold means two completely different gestures in the two
 * browsers. 16 is the line box the spec's number was measured against.
 */
export const WHEEL_LINE_HEIGHT = 16;

/**
 * The capture is desktop-pointer only. On touch the vertical gesture is the
 * page's scroll and stays the page's scroll - that collision is the whole
 * reason this section is not pinned.
 */
export const CAPTURE_QUERY = "(pointer: fine) and (min-width: 768px)";

/** Horizontal swipe on touch: how far, and how much more horizontal than vertical. */
export const SWIPE_THRESHOLD_PX = 40;
export const SWIPE_DOMINANCE = 1.5;

/* ---------------------------------------------------------------------------
   The model slide.

   The six models hang on one HORIZONTAL strip with air between them, and a step
   moves the strip: forward, the model on screen leaves to the left while the
   next one arrives from the right. The COPY does not travel with it - on a step
   the outgoing panel leaves and the incoming one arrives IN PLACE, each on its
   own word-by-word reveal (`DisciplineCopy`). Only the model slides.

   The numbers are `ServiceCarousel`'s - the services carousel is the pattern
   this section was asked to match, and matching it means matching its clock.
   The reel is inside `<Canvas>` and wants a GSAP ease, derived from
   `SLIDE_BEZIER` here rather than typed by hand.
   --------------------------------------------------------------------------- */

/** Control points of `cubic-bezier(0.65, 0, 0.24, 1)` - the services push curve. */
export const SLIDE_BEZIER = [0.65, 0, 0.24, 1] as const;
export const SLIDE_DURATION = 0.62; // s

/**
 * For GSAP (the reel). `CustomEase` reads an SVG path, and a cubic-bezier maps
 * onto one exactly: the two control points ARE the curve's two handles between
 * (0,0) and (1,1).
 */
export const SLIDE_EASE_PATH = `M0,0 C${SLIDE_BEZIER[0]},${SLIDE_BEZIER[1]} ${SLIDE_BEZIER[2]},${SLIDE_BEZIER[3]} 1,1`;
export const SLIDE_EASE_ID = "disciplineSlide";

/**
 * Empty space between two models on the strip, in world units. The export
 * normalises every bbox to 2.0 on its longest axis, so this is the gap on top
 * of that.
 *
 * BIGGER THAN THE OLD VERTICAL GAP (0.9), and it has to be: the viewport is
 * 4/3, so the frame is a third wider than it is tall. At this camera the visible
 * width at the model's depth is ~3.14 world units, so a model whose longest axis
 * is 2.0 needs the strip to travel more than 2.57 before it is clear of the
 * edge - which the old vertical span did not cover.
 */
export const MODEL_SLOT_GAP = 1.4;
export const MODEL_SLOT_SPAN = 2 + MODEL_SLOT_GAP;

/* ---------------------------------------------------------------------------
   The copy panel, straight off SECTION_SPEC's transition table.

   Offsets are measured from the moment the index changes, which is the moment
   the model slide starts - so the copy lands into a model that has already
   arrived rather than racing it.

   The copy stays anchored; only the model travels. The offsets still OVERLAP
   the outgoing and incoming panels so the column is never empty for a beat: the
   outgoing copy stays legible for most of the model's slide and the incoming
   words start arriving while it is still leaving. Both resolve in place - the
   fade + lift is the reveal's own exit, not a horizontal push.

   Kicker, title and lede all carry the site's
   word-by-word arrival - every line of copy on the site reveals that way, and a
   panel where only the headline did read as two different sites. Only the CTA
   moves as a block: it is a control, and a control that assembles itself out of
   words reads as copy.

   The three are separated by their spread, not by their kind. The title gets
   the widest stagger and the deepest blur, the kicker the tightest, the lede
   sits between them - so the panel still lands as one event with an order to
   it, instead of three identical shimmers.

   It replays on EVERY arrival, including coming back to a discipline you have
   already seen. That is the difference from the site-wide controller, which
   reveals each element once and is done - here the copy is new every time,
   because the model behind it is.
   --------------------------------------------------------------------------- */

/**
 * izlaz | stepper tacka | 0,00 | 0,28 | power2.out | width, opacity
 *
 * The one row of the transition table that is CSS rather than GSAP, because the dot changes
 * on an attribute (`aria-current`) that React already writes - a tween would be a second
 * mechanism for a state change the DOM is expressing anyway. It still belongs in this file:
 * the duration and the curve are the table's, and the stepper hands them to the stylesheet
 * as custom properties so there is one source for them and not two.
 *
 * `power2.out` is GSAP's name for ease-out quadratic; the bezier below is the same curve.
 */
export const STEPPER_DOT_DURATION = 0.28; // s
export const STEPPER_DOT_EASE_CSS = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

/**
 * izlaz | tekst panela | 0,00 | 0,42 | power2.in | opacity 1->0, y 0->-12
 *
 * Two thirds of the model's slide, so the copy that is leaving stays readable
 * for most of the swap rather than blinking out the instant the step lands. The
 * fade and the small lift happen in place - the panel does not travel.
 */
export const COPY_EXIT_DURATION = 0.42;
export const COPY_EXIT_EASE = "power2.in";
export const COPY_EXIT_Y = -12;

/** ulaz | naslov, po reci | 0,30 | 0,46 | power3.out | blur 8->0, yPercent 22->0 */
export const COPY_TITLE_START = 0.3;
export const COPY_TITLE_DURATION = 0.46;
export const COPY_TITLE_BLUR = 8;
export const COPY_TITLE_Y_PERCENT = 22;
export const COPY_TITLE_STAGGER_EACH = 0.05;
/**
 * Ceiling on the whole spread, so the last word lands at the same moment no
 * matter how many there are. "Web development" is two words and "Mobile App
 * Development" is three; in Serbian they are longer again. Without the cap the
 * panel would take a different length of time in each language.
 */
export const COPY_TITLE_STAGGER_MAX = 0.25;

/** ulaz | kicker, po reci | 0,46 | 0,32 | power3.out | blur 5->0, yPercent 16->0 */
export const COPY_KICKER_START = 0.46;
export const COPY_KICKER_DURATION = 0.32;
export const COPY_KICKER_BLUR = 5;
export const COPY_KICKER_Y_PERCENT = 16;
export const COPY_KICKER_STAGGER_EACH = 0.04;
export const COPY_KICKER_STAGGER_MAX = 0.14;
/** Only used when the kicker is past the splitter's word cap and moves as one piece. */
export const COPY_KICKER_Y = 14;

/** ulaz | lede, po reci | 0,54 | 0,30 | power3.out | blur 6->0, yPercent 14->0 */
export const COPY_LEDE_START = 0.54;
export const COPY_LEDE_DURATION = 0.3;
export const COPY_LEDE_BLUR = 6;
export const COPY_LEDE_Y_PERCENT = 14;
export const COPY_LEDE_STAGGER_EACH = 0.028;
/**
 * The lede is the longest line in the panel and the last thing to land, so its
 * ceiling is what sets the length of the whole swap: 0,54 + 0,22 + 0,30 = 1,06 s,
 * inside the 1,44 s plafon. Raise it and the panel outlives its own model.
 */
export const COPY_LEDE_STAGGER_MAX = 0.22;
/** Fallback offset for a lede past the word cap. */
export const COPY_LEDE_Y = 12;

/** The CTA follows the lede's start by this much - the one piece that stays a block. */
export const COPY_CTA_START = 0.6;

export const COPY_ENTER_EASE = "power2.out";
/** Every word-by-word arrival in the panel uses the site's reveal curve. */
export const COPY_WORD_EASE = "power3.out";

/**
 * THE AFFORDANCE, and it is a sentence now rather than a pulse.
 *
 * The wheel capture is invisible until you try it. The arrows used to twitch
 * once on the first `pointerenter`, which says "something here is clickable" and
 * nothing about the wheel - and says it only to a cursor that has already found
 * the column. This says what to do, in words, to anyone who has stopped.
 *
 * It is on a clock rather than on hover for the same reason: the visitor who
 * needs it is the one who is NOT moving. First appearance is late enough that
 * someone who is already scrolling past never sees it; the repeat is long enough
 * that it reads as a reminder rather than as a blinking sign. Any input at all -
 * a wheel notch, a swipe, a dot, an arrow key - retires it for the page's life.
 */
export const HINT_FIRST_DELAY_MS = 6000;
export const HINT_REPEAT_MS = 20000;
export const HINT_VISIBLE_MS = 3600;
/** Fade in and out, in seconds - handed to the stylesheet as a custom property. */
export const HINT_FADE = 0.45;
