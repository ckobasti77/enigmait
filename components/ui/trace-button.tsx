"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Trace CTA.
 *
 * The site's card language on a button: a blue rim at rest, and on hover a
 * light streak that runs that rim once - the same read as the process-card
 * borderTrace and the services dropdown, so a CTA sits inside the same system
 * as the surfaces around it rather than beside it.
 *
 * Everything visible is CSS (see `.trace-cta` in `globals.css`) and the streak
 * lives on `::before`, so this component adds no layers of its own. That is
 * deliberate: `asChild` hands the children straight to a `Link`, and a real
 * layer element would need either a wrapper - which changes layout - or
 * `Slottable` gymnastics to buy nothing a pseudo-element does not already do.
 *
 * Colours come from `--cta-line` / `--cta-sweep`, defined in every palette, so
 * light mode and the alt mood re-tune with no JS and no `dark:` variants.
 *
 * The liquid glass button is not replaced by this - it stays reachable through
 * `<CtaButton look="glass">`.
 */
const traceButtonVariants = cva(
  "trace-cta group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "trace-cta--primary text-theme-primary",
        secondary: "trace-cta--secondary text-theme-muted",
      },
      // Heights match the liquid glass button exactly so swapping the default
      // look cannot shift a layout. The horizontal padding is tighter: the
      // glass sizes are padded wide to cover what the skew eats off the top and
      // bottom edges, and this button is upright.
      size: {
        sm: "h-9 gap-1.5 px-5 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-sm",
        xl: "h-14 px-9 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type TraceButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof traceButtonVariants> & {
    asChild?: boolean;
  };

function TraceButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: TraceButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(traceButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { TraceButton, traceButtonVariants };
export type { TraceButtonProps };
