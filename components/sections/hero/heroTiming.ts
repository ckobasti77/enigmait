/**
 * One clock for both halves of the hero.
 *
 * The cube finishes drawing itself at the same instant the copy on the left
 * finishes revealing, so the two read as a single entrance rather than two
 * animations that happen to share a screen. Change this and both follow.
 */
export const HERO_REVEAL_DURATION = 1.35; // s

/** Share of the reveal the headline gets; the lede and buttons land after it. */
export const HERO_TITLE_SHARE = 0.7;
