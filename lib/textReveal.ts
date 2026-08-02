/**
 * The engine behind the site-wide text reveal.
 *
 * Plain DOM + GSAP, no React: the copy it animates is written by a dozen
 * different components (and by whatever page gets added next), so the reveal
 * cannot live in any one of them. The controller finds the copy itself, splits
 * it into words on the way in, and puts it back the moment it is done with it.
 *
 * Three things are deliberate:
 *
 * 1. **Text nodes are moved, never cloned.** Splitting replaces a text node
 *    with word spans and keeps the original node object for the restore. Any
 *    element around it (`<a>`, `<strong>`) is left untouched, so React keeps
 *    its handles on the nodes it owns and links keep working.
 * 2. **Splitting happens on the way in, not up front.** A legal page is a few
 *    thousand words; wrapping all of them at mount would cost a long frame for
 *    copy the visitor may never scroll to.
 * 3. **Split copy opts out of the translation walker.** `LanguageProvider`
 *    translates whole text nodes, and one word per node would have it looking
 *    up "Home" inside a sentence. Split elements carry `data-no-translate`
 *    until they are restored - which is exactly what `restoreAll()` is for on a
 *    language switch.
 */

import gsap from "gsap";
import {
  REVEAL_ACTIVE_ATTR,
  REVEAL_ARMED_ATTR,
  REVEAL_WORD_CLASS,
  TEXT_REVEAL,
} from "@/constants/textRevealConfig";

type SplitRecord = {
  /** The original text node, detached but alive, waiting for a restore. */
  source: Text;
  /** What replaced it: word spans plus the whitespace between them. */
  parts: ChildNode[];
};

export type Split = {
  records: SplitRecord[];
  words: HTMLElement[];
  /** True when we added `data-no-translate` and therefore owe its removal. */
  ownsNoTranslate: boolean;
};

const NO_TRANSLATE_ATTR = "data-no-translate";
const STATE_ATTR = "data-reveal-state";

const isHeading = (element: Element) => /^H[1-6]$/.test(element.tagName);

/**
 * A flex or grid box lays its children out as boxes, and word spans are
 * children. Splitting a line inside one turns every gap, alignment and
 * justification rule loose on the individual words - a `gap-2` eyebrow would
 * come back with 8px between every word. Those lines arrive as one piece
 * instead; the caller falls back to the block fade when every node is refused.
 */
const laysOutChildrenAsBoxes = (element: Element) => {
  const display = getComputedStyle(element).display;
  return display.includes("flex") || display.includes("grid");
};

/**
 * Text nodes this element is responsible for. A nested candidate (a `<p>`
 * inside an `<li>`) owns its own words, so the outer element skips them and
 * animates only the text that is directly its own.
 */
const collectTextNodes = (element: HTMLElement) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;

      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(TEXT_REVEAL.opaqueSelector)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest(TEXT_REVEAL.candidateSelector) !== element) {
        return NodeFilter.FILTER_REJECT;
      }
      if (laysOutChildrenAsBoxes(parent)) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
};

const countWords = (nodes: Text[]) =>
  nodes.reduce(
    (total, node) => total + (node.nodeValue?.trim().split(/\s+/).length ?? 0),
    0
  );

const splitElement = (element: HTMLElement): Split | null => {
  const nodes = collectTextNodes(element);
  if (!nodes.length) return null;
  if (countWords(nodes) > TEXT_REVEAL.maxWords) return null;

  const records: SplitRecord[] = [];
  const words: HTMLElement[] = [];

  for (const node of nodes) {
    const parent = node.parentNode;
    if (!parent) continue;

    const fragment = document.createDocumentFragment();
    const parts: ChildNode[] = [];

    // The whitespace is kept as its own text node between the spans: a trailing
    // space inside an inline-block collapses, and the line would lose its gaps.
    for (const token of (node.nodeValue ?? "").split(/(\s+)/)) {
      if (!token) continue;

      if (/^\s+$/.test(token)) {
        const space = document.createTextNode(token);
        parts.push(space);
        fragment.append(space);
        continue;
      }

      const span = document.createElement("span");
      span.className = REVEAL_WORD_CLASS;
      span.textContent = token;
      parts.push(span);
      words.push(span);
      fragment.append(span);
    }

    parent.replaceChild(fragment, node);
    records.push({ source: node, parts });
  }

  if (!words.length) return null;

  const ownsNoTranslate = !element.hasAttribute(NO_TRANSLATE_ATTR);
  if (ownsNoTranslate) element.setAttribute(NO_TRANSLATE_ATTR, "true");

  return { records, words, ownsNoTranslate };
};

const restoreElement = (element: HTMLElement, split: Split) => {
  for (const { source, parts } of split.records) {
    const anchor = parts[0];
    anchor?.parentNode?.insertBefore(source, anchor);
    parts.forEach((part) => part.remove());
  }

  if (split.ownsNoTranslate) element.removeAttribute(NO_TRANSLATE_ATTR);
};

/**
 * The same split the controller uses, for copy that owns its own reveal.
 *
 * A component that opts out of the site-wide pass (`data-reveal="off"`) but
 * still wants the word-by-word arrival must not roll its own splitter: the
 * contract with `LanguageProvider` - move the text node, never clone it, carry
 * `data-no-translate` for as long as the split lasts - has to hold everywhere
 * or a language switch translates half a sentence. Pair every call with
 * `restoreWords` on cleanup *and* before the translation walker runs.
 *
 * Returns `null` when there is nothing worth splitting (no text, or past
 * `TEXT_REVEAL.maxWords`); callers should fall back to animating the element.
 */
export const splitWords = (element: HTMLElement) => splitElement(element);

/** Undo a `splitWords`, handing the element its original text node back. */
export const restoreWords = (element: HTMLElement, split: Split) =>
  restoreElement(element, split);

type ControllerOptions = {
  reducedMotion: boolean;
};

export function createTextReveal({ reducedMotion }: ControllerOptions) {
  const root =
    document.querySelector<HTMLElement>(TEXT_REVEAL.rootSelector) ??
    document.body;

  const known = new WeakSet<Element>();
  const splits = new Map<HTMLElement, Split>();
  const pending = new Set<HTMLElement>();

  let intersection: IntersectionObserver | null = null;
  let mutation: MutationObserver | null = null;
  let scanFrame = 0;
  let stopped = false;

  const settle = (element: HTMLElement) => {
    pending.delete(element);
    element.setAttribute(STATE_ATTR, "on");
  };

  /** Nothing to animate (an icon-only `<p>`): just take the hide back off. */
  const showPlain = (element: HTMLElement) => {
    gsap.set(element, { autoAlpha: 1 });
    settle(element);
  };

  const reveal = (element: HTMLElement) => {
    if (reducedMotion) {
      showPlain(element);
      return;
    }

    const split = splitElement(element);

    if (!split) {
      // Either there is no text worth splitting, or the block is past the word
      // cap and fades as one piece.
      if (!element.textContent?.trim()) {
        showPlain(element);
        return;
      }

      settle(element);
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: TEXT_REVEAL.block.y },
        {
          autoAlpha: 1,
          y: 0,
          duration: TEXT_REVEAL.block.duration,
          ease: TEXT_REVEAL.block.ease,
          clearProps: "transform",
        }
      );
      return;
    }

    splits.set(element, split);
    settle(element);

    const preset = isHeading(element) ? TEXT_REVEAL.heading : TEXT_REVEAL.body;
    const amount = Math.min(
      preset.staggerMax,
      preset.staggerEach * Math.max(split.words.length - 1, 0)
    );

    // The element itself stops being hidden; the words carry the entrance.
    gsap.set(element, { autoAlpha: 1 });
    gsap.fromTo(
      split.words,
      {
        autoAlpha: 0,
        filter: `blur(${preset.blur}px)`,
        yPercent: preset.yPercent,
        willChange: "opacity, transform, filter",
      },
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        yPercent: 0,
        duration: preset.duration,
        ease: preset.ease,
        // Shuffled arrival: the line assembles out of order instead of typing
        // left to right. `amount` spreads the whole set, so word count does not
        // change how long the element takes.
        stagger: { amount, from: "random" },
        onComplete: () => {
          // Blur and the layer hint are per-word costs; nothing needs them once
          // the copy has landed.
          gsap.set(split.words, { clearProps: "filter,willChange,transform" });
        },
      }
    );
  };

  const isRevealable = (element: HTMLElement) => {
    if (element.closest(TEXT_REVEAL.skipSelector)) return false;
    if (element.closest(TEXT_REVEAL.opaqueSelector)) return false;
    return true;
  };

  const scan = () => {
    if (stopped || !intersection) return;

    const candidates = root.querySelectorAll<HTMLElement>(
      TEXT_REVEAL.candidateSelector
    );

    for (const element of candidates) {
      if (known.has(element)) continue;
      known.add(element);

      // Skipped copy is excluded from the hiding rule by the same selector, so
      // it is already visible - there is nothing to do but leave it alone.
      if (!isRevealable(element)) continue;

      element.setAttribute(STATE_ATTR, "pending");
      pending.add(element);
      intersection.observe(element);
    }
  };

  const scanSoon = () => {
    if (stopped || scanFrame) return;
    scanFrame = window.requestAnimationFrame(() => {
      scanFrame = 0;
      scan();
    });
  };

  /**
   * The last screenful of the page can never travel `enterRatio` into the
   * viewport - there is no scroll left to give. Once the document is scrolled
   * out, whatever is still pending gets its reveal.
   */
  const flushAtDocumentEnd = () => {
    if (!pending.size) return;

    const distanceToEnd =
      document.documentElement.scrollHeight -
      window.scrollY -
      window.innerHeight;

    if (distanceToEnd > 2) return;

    for (const element of [...pending]) {
      intersection?.unobserve(element);
      reveal(element);
    }
  };

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      flushAtDocumentEnd();
    });
  };

  const start = () => {
    document.documentElement.setAttribute(REVEAL_ACTIVE_ATTR, "true");

    if (reducedMotion) {
      // Nothing to stage: drop the hiding rule and leave the page alone.
      document.documentElement.removeAttribute(REVEAL_ARMED_ATTR);
      return;
    }

    intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const element = entry.target as HTMLElement;
          intersection?.unobserve(element);
          reveal(element);
        }
      },
      {
        // Shrinking the root from the bottom is what turns "touching the fold"
        // into "15% of the way in".
        rootMargin: `0px 0px -${Math.round(TEXT_REVEAL.enterRatio * 100)}% 0px`,
        threshold: 0,
      }
    );

    // Route changes and anything else that adds copy. Deliberately narrow: the
    // split spans we insert ourselves are the loudest source of mutations on
    // the page, and re-scanning on them would cost a query per revealed line.
    mutation = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          const element = node as Element;
          if (element.classList.contains(REVEAL_WORD_CLASS)) continue;

          if (
            element.matches(TEXT_REVEAL.candidateSelector) ||
            element.querySelector(TEXT_REVEAL.candidateSelector)
          ) {
            scanSoon();
            return;
          }
        }
      }
    });

    scan();

    mutation.observe(root, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  };

  /**
   * Hand every split element back its original text nodes.
   *
   * Called on a language switch: `LanguageProvider` translates whole text
   * nodes, so the copy has to be whole again before it runs. Restored elements
   * lose `data-no-translate` in the same breath, which is what lets the walker
   * pick them up. They are not re-split - the reveal has already played.
   */
  const restoreAll = () => {
    for (const [element, split] of splits) {
      restoreElement(element, split);
      gsap.set(element, { autoAlpha: 1 });
    }
    splits.clear();
  };

  const stop = () => {
    stopped = true;

    if (scanFrame) window.cancelAnimationFrame(scanFrame);
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);

    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    intersection?.disconnect();
    mutation?.disconnect();
    intersection = null;
    mutation = null;

    restoreAll();
    pending.clear();

    // Whatever never got its turn must not stay hidden behind the arming rule.
    document.documentElement.removeAttribute(REVEAL_ARMED_ATTR);
    document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
  };

  return { start, stop, restoreAll };
}
