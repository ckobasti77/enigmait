/**
 * Site-wide text reveal.
 *
 * One knob set for every headline and paragraph on the site. The hero keeps its
 * own timeline (it has to stay in lockstep with the cube), everything else is
 * driven by `lib/textReveal.ts` from the values below.
 *
 * The two selector strings are the contract between the CSS that hides copy
 * before it is revealed and the JavaScript that reveals it. They are used by
 * both sides - `buildTextRevealCss()` compiles them into the stylesheet the
 * root layout inlines, and the controller matches against the same strings - so
 * an element can never be hidden by CSS that the controller does not know how
 * to bring back.
 */

/** Copy whose whole reason to exist is text. */
const BLOCK_COPY =
  "h1, h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, figcaption";

/**
 * Elements a `<span>` may sit inside without being a line of its own.
 *
 * Two different jobs, one list. A span inside a heading or a paragraph is part
 * of that sentence and must not be pulled out of it - that is also what stops
 * the word spans the splitter itself creates from being treated as new copy.
 * A span inside a link, a button or a label is the control's own label, and a
 * control has to be readable the instant it appears.
 */
const INLINE_HOSTS = `${BLOCK_COPY}, a, button, label, summary, th, td`;

/**
 * Standalone text: a `<span>` with no copy element above it. This is what
 * catches the eyebrows, kickers, metric labels and stat captions the site is
 * full of - text that carries no semantic tag but is read as a line all the
 * same. Without it "everywhere" quietly meant "everywhere with a tag".
 */
const STANDALONE_TEXT = `span:not(:is(${INLINE_HOSTS}) *)`;

export const TEXT_REVEAL = {
  /** The controller only looks inside the app shell; chrome outside it is left alone. */
  rootSelector: ".app-shell",

  /** Everything that gets the word-by-word treatment. */
  candidateSelector: `${BLOCK_COPY}, ${STANDALONE_TEXT}, [data-reveal='text']`,

  /**
   * Copy that is owned by something else. Either another animation already
   * writes its opacity (hero, discipline panels, the typed console headline),
   * or it is chrome that must be readable the instant it appears (navigation,
   * forms, live regions, the consent banner).
   *
   * `.reveal-word` and `.hero-reveal-word` are in here for a different reason:
   * they are the splitter's own output, and a controller that treated its own
   * word spans as new copy would keep splitting its own splits.
   *
   * Matching an element *or any of its descendants* opts the whole subtree out.
   */
  skipSelector:
    "nav, form, [role='dialog'], [aria-live], [data-reveal='off'], .no-reveal, .reveal-word, .hero-reveal-word",

  /** Never split inside these - the split spans would break their meaning. */
  opaqueSelector: "script, style, code, pre, svg, canvas, textarea, input, select",

  /**
   * How far an element must travel into the viewport before it fires, as a
   * share of viewport height measured up from the bottom edge. 0.15 = the copy
   * starts once it is 15% of the way in, not the instant it clips the fold.
   */
  enterRatio: 0.15,

  /**
   * Above this word count the block fades as one piece instead of splitting.
   * Legal pages carry 200-word paragraphs; splitting those is a few hundred
   * blurred layers for an effect nobody reads word by word.
   */
  maxWords: 60,

  /** Headlines: the anthropic-style arrival - blurred, lifted, out of order. */
  heading: {
    duration: 0.62,
    blur: 10,
    yPercent: 24,
    /** Per-word spacing, before the cap below. */
    staggerEach: 0.055,
    /** Total spread ceiling, so a long headline still lands together. */
    staggerMax: 0.7,
    ease: "power3.out",
  },

  /** Body copy: same idea, dialled down so it reads as texture, not as an event. */
  body: {
    duration: 0.55,
    blur: 6,
    yPercent: 14,
    staggerEach: 0.032,
    staggerMax: 0.55,
    ease: "power3.out",
  },

  /** The fallback for copy past `maxWords` - one fade for the whole block. */
  block: {
    duration: 0.7,
    y: 18,
    ease: "power3.out",
  },
} as const;

/** Class put on every split word. Styled in `globals.css`. */
export const REVEAL_WORD_CLASS = "reveal-word";

/** Set on `<html>` by the arming script; the hiding rule keys off it. */
export const REVEAL_ARMED_ATTR = "data-text-reveal";

/** Set on `<html>` by the controller so the arming watchdog knows JS is alive. */
export const REVEAL_ACTIVE_ATTR = "data-text-reveal-active";

/** How long the arming script waits for the controller before it gives up. */
export const REVEAL_WATCHDOG_MS = 2500;

const not = (selector: string) => `:not(:is(${selector})):not(:is(${selector}) *)`;

/**
 * The stylesheet the root layout inlines. It hides revealable copy *before*
 * first paint, which is the whole point of generating it here rather than
 * hiding from an effect: the server-rendered markup is painted long before
 * hydration, so a JS-side hide would flash the finished text first.
 *
 * It only applies while `<html>` is armed, so no-JS clients - and anyone whose
 * controller failed to mount within the watchdog window - see plain copy.
 */
export const buildTextRevealCss = () => {
  const hidden = `html[${REVEAL_ARMED_ATTR}="armed"] ${TEXT_REVEAL.rootSelector} :is(${TEXT_REVEAL.candidateSelector})${not(TEXT_REVEAL.skipSelector)}`;

  return `${hidden}{opacity:0}@media (prefers-reduced-motion:reduce){${hidden}{opacity:1}}`;
};

/** The arming script, inlined at the top of `<body>` so it runs before the copy parses. */
export const TEXT_REVEAL_ARM_SCRIPT = `(function(){var d=document.documentElement;d.setAttribute("${REVEAL_ARMED_ATTR}","armed");setTimeout(function(){if(!d.hasAttribute("${REVEAL_ACTIVE_ATTR}")){d.removeAttribute("${REVEAL_ARMED_ATTR}")}},${REVEAL_WATCHDOG_MS})})()`;
