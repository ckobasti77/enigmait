/**
 * The section's clock, as named constants - the pattern `heroTiming.ts` sets. Local values
 * are derived from these, never retyped.
 *
 * The swap rows of SECTION_SPEC's transition table (exit/enter of model, title, kicker,
 * lede) arrive with the scroll engine in Faza D; this file is where they go, so adding them
 * touches nothing else.
 *
 * NOT IMPLEMENTED, DELIBERATELY: the table's "ambient rotation, 24 s per turn". A model
 * that turns on its own cannot also be a model that looks where the cursor is - for most of
 * the cycle it would be showing its back while the pointer asks for its face. The turning
 * is the pointer's, and only the pointer's.
 *
 * WHO DRIVES WHAT. The float and the pointer are `useFrame`. The swap will be a GSAP
 * timeline. They must never write the same property: the timeline owns `scale`, `opacity`
 * and `emissiveIntensity`, `useFrame` owns `rotation` and `position.y`. Two schedulers over
 * one value is jitter that does not debug.
 */

/** Ambient float, sine.inOut, y +-0.04. The only motion the model makes on its own. */
export const AMBIENT_FLOAT_SECONDS = 6.5;
export const AMBIENT_FLOAT_AMPLITUDE = 0.04;
export const AMBIENT_FLOAT_SPEED = (2 * Math.PI) / AMBIENT_FLOAT_SECONDS;

/**
 * Yaw, and the whole of the model's turning. It is NOT a symmetric +-: the cursor at the
 * left edge of the window puts the model at 0, square to the viewer, and the cursor at the
 * right edge puts it at the value below. The travel is one-directional on purpose - the
 * model has a rest pose that faces you, and the cursor only ever turns it away.
 *
 * ~25 degrees. Small enough that the screen stays readable at the far end.
 */
export const POINTER_YAW_MAX = 0.44; // rad, ~25 deg
/**
 * Tilt. This one IS symmetric, measured off the centre of the canvas, and it stays small -
 * it is the nod that sells the yaw, not a second axis of its own.
 */
export const POINTER_ROTATION_X = 0.05; // rad
export const POINTER_LERP = 0.08;
/** Below this the pointer target counts as reached and the lerp stops writing. */
export const POINTER_SETTLE_EPSILON = 1e-4;

/** Frame time is clamped before it drives anything, so a tab wake-up cannot jump the model. */
export const MAX_FRAME_DELTA = 0.05; // s
