"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";

import { LiquidButton, type LiquidButtonProps } from "./liquid-glass-button";

type CtaButtonProps = Omit<LinkProps, "href"> &
  Pick<LiquidButtonProps, "variant" | "size"> & {
    href: string;
    /** Convenience for the common label-only case; `children` wins if both are set. */
    text?: string;
    children?: React.ReactNode;
    className?: string;
    target?: string;
    rel?: string;
    "aria-label"?: string;
  };

/**
 * The one CTA on the site. Every call to action - hero, page heroes, footer,
 * service pages - goes through here, so the liquid glass treatment is a single
 * edit rather than a class string copied into thirty files.
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
  target,
  rel,
  "aria-label": ariaLabel,
  ...linkProps
}: CtaButtonProps) => {
  return (
    <LiquidButton asChild variant={variant} size={size} className={className}>
      <Link href={href} target={target} rel={rel} aria-label={ariaLabel} {...linkProps}>
        {children ?? text}
      </Link>
    </LiquidButton>
  );
};

export default CtaButton;
