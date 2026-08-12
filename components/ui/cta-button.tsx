"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";

import { LiquidButton, type LiquidButtonProps } from "./liquid-glass-button";
import { TraceButton, type TraceButtonProps } from "./trace-button";

type CtaButtonProps = Omit<LinkProps, "href"> &
  Pick<TraceButtonProps, "variant" | "size"> & {
    href: string;
    /** Convenience for the common label-only case; `children` wins if both are set. */
    text?: string;
    children?: React.ReactNode;
    className?: string;
    /**
     * `trace` is the site's CTA - blue rim, streak on hover. `glass` is the
     * previous liquid glass treatment, kept because it is still the right
     * answer on a surface where a rim would read as a box.
     */
    look?: "trace" | "glass";
    target?: string;
    rel?: string;
    "aria-label"?: string;
  };

/**
 * The one CTA on the site. Every call to action - hero, page heroes, footer,
 * service pages - goes through here, so the treatment is a single edit rather
 * than a class string copied into thirty files.
 *
 * `primary` is the ask, `secondary` the alternative next to it.
 */
const CtaButton = ({
  href,
  text,
  children,
  className,
  variant = "primary",
  size = "default",
  look = "trace",
  target,
  rel,
  "aria-label": ariaLabel,
  ...linkProps
}: CtaButtonProps) => {
  // Both shells take the same variant/size unions and both slot into the same
  // Link, so only the wrapper differs.
  const shellProps = { asChild: true, variant, size, className } satisfies Pick<
    LiquidButtonProps & TraceButtonProps,
    "asChild" | "variant" | "size" | "className"
  >;

  const link = (
    <Link href={href} target={target} rel={rel} aria-label={ariaLabel} {...linkProps}>
      {children ?? text}
    </Link>
  );

  return look === "glass" ? (
    <LiquidButton {...shellProps}>{link}</LiquidButton>
  ) : (
    <TraceButton {...shellProps}>{link}</TraceButton>
  );
};

export default CtaButton;
