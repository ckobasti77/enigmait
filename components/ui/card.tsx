"use client";

import clsx from "clsx";
import type {
  ComponentType,
  ElementType,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
} from "react";

import { TRACE_LENGTH } from "@/lib/borderTrace";
import {
  REVEAL_PATH_CLASS,
  REVEAL_VEIL_CLASS,
  useBorderTraceReveal,
} from "@/hooks/useBorderTraceReveal";

/**
 * The site's card.
 *
 * One border, one hairline, one hover - written once instead of being retyped
 * as `rounded-3xl border border-theme theme-card hover:border-cyan-400/50` in
 * every grid on the site. Colours come from `--card-trace` / `--card-trace-glow`
 * and `--border-strong`, defined in all three palettes, so the light theme and
 * the alt mood re-tune with no JS.
 *
 * Three boxes, and each one earns its place:
 *
 * - the **root** carries the radius, the hover lift and the hover glow. The
 *   glow has to live outside the clip, or the card's own `overflow: hidden`
 *   eats it.
 * - the **shell** is the visible card: border, background, and the clip that
 *   keeps flush media inside the corners.
 * - the **content** box takes `className` - padding, flex, gap. It is also what
 *   `RevealCard` animates, which is why it exists even when nothing moves.
 *
 * Text is left alone. Every line of copy inside a card is revealed word by word
 * by the site-wide pass, so nothing here touches opacity - see
 * `hooks/useBorderTraceReveal.ts`.
 */

type CardOwnProps = {
  /** The root element. Cards on this site are `article`s; `div` is the default. */
  as?: ElementType;
  /** Applied to the content box: padding, layout, gap. */
  className?: string;
  children: ReactNode;
  /**
   * A soft radial glow that follows the cursor, written straight onto the root
   * as `--glow-x` / `--glow-y`. Same trick as the services dropdown: no React
   * state, so a hover costs no re-render.
   */
  cursorGlow?: boolean;
  /** Rendered outside the shell, so a glow on it is not clipped. */
  overlay?: ReactNode;
  ref?: Ref<HTMLElement>;
};

type CardProps = Omit<
  HTMLAttributes<HTMLElement>,
  "className" | "children" | "ref"
> &
  CardOwnProps;

/**
 * What the root actually is once `as` has been chosen. Rendering a variable of
 * type `ElementType` directly makes TypeScript intersect the props of every tag
 * it could be, which collapses `children` to `never`; the tags this accepts all
 * take the same plain HTML attributes, so it is stated once here.
 */
type CardRoot = ComponentType<
  HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
>;

const trackCursor = (event: ReactMouseEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--glow-x",
    `${event.clientX - rect.left}px`
  );
  event.currentTarget.style.setProperty(
    "--glow-y",
    `${event.clientY - rect.top}px`
  );
};

export function Card({
  as = "div",
  className,
  children,
  cursorGlow = false,
  overlay,
  ref,
  ...rest
}: CardProps) {
  const Root = as as unknown as CardRoot;

  return (
    <Root
      className="ui-card card-lift"
      onMouseMove={cursorGlow ? trackCursor : undefined}
      ref={ref}
      {...rest}
    >
      <div className="ui-card-shell theme-card">
        <span aria-hidden className="ui-card-hairline" />
        {cursorGlow ? <span aria-hidden className="ui-card-cursor-glow" /> : null}
        <div className={clsx("ui-card-content", className)}>{children}</div>
      </div>
      {overlay}
    </Root>
  );
}

/**
 * A `Card` that unlocks itself: two streaks leave the top edge, run the border
 * in opposite directions and meet at the bottom, and the card's content lifts
 * out of a blur inside that trace. Once. Under `prefers-reduced-motion` there
 * is no streak and no blur - the card is simply there.
 */
export function RevealCard({ className, overlay, ...props }: CardProps) {
  const { ref, trace } = useBorderTraceReveal();

  return (
    <Card
      {...props}
      className={clsx(REVEAL_VEIL_CLASS, className)}
      ref={ref}
      overlay={
        <>
          {trace ? (
            <svg
              aria-hidden
              className="ui-card-trace"
              focusable="false"
              viewBox={`0 0 ${trace.width} ${trace.height}`}
            >
              {trace.paths.map((d, index) => (
                <path
                  className={REVEAL_PATH_CLASS}
                  d={d}
                  key={index}
                  pathLength={TRACE_LENGTH}
                  style={{
                    strokeDasharray: `${trace.dash} ${TRACE_LENGTH}`,
                  }}
                />
              ))}
            </svg>
          ) : null}
          {overlay}
        </>
      }
    />
  );
}
