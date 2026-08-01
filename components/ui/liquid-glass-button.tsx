"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Liquid glass CTA.
 *
 * The look is three stacked layers, all of them CSS (see `.liquid-glass` in
 * `globals.css`):
 *
 * 1. `__refraction` - backdrop-filter over whatever sits behind the button.
 *    On Chromium it runs the SVG displacement map below for the watery edge;
 *    everywhere else the plain blur/saturate fallback in the base rule stands.
 * 2. `__shell` - the inset shadow stack that reads as a bevelled glass rim.
 * 3. the label itself, in normal flow.
 *
 * The right-leaning parallelogram is a skew on the two glass layers, never on
 * the button: skewing the element would drag the label with it, and there is no
 * wrapper to counter-skew because `asChild` hands the children to a `Link`.
 *
 * Both decorative layers sit at `z-index: -1` inside the button's own stacking
 * context (`isolate`), which is why the label paints above them without a
 * wrapper element - important, because `asChild` hands the children straight to
 * a `Link`.
 *
 * Colours come from `--lg-*` CSS variables defined in every palette, so light
 * mode flips the rim from white insets to black ones with no JS and no
 * `dark:` variants.
 */

const liquidButtonVariants = cva(
  "liquid-glass group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium outline-none transition-[transform,color,filter] duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "liquid-glass--primary text-theme-primary",
        secondary:
          "liquid-glass--secondary text-theme-muted hover:text-theme-primary",
      },
      // The horizontal padding carries the slant: the shear eats roughly
      // `height * tan(skew)` of usable width at the top and bottom edges, so
      // every size is padded wider than an upright pill of the same height.
      size: {
        sm: "h-9 gap-1.5 px-6 text-xs",
        default: "h-11 px-8 text-sm",
        lg: "h-12 px-9 text-sm",
        xl: "h-14 px-11 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type LiquidButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof liquidButtonVariants> & {
    asChild?: boolean;
  };

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(liquidButtonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Slottable keeps these two layers *inside* the slotted element (the
          Link), instead of making them siblings Slot would refuse. */}
      <span className="liquid-glass__layer liquid-glass__refraction" aria-hidden />
      <span className="liquid-glass__layer liquid-glass__shell" aria-hidden />
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

/**
 * The displacement filter every liquid button references. Mounted once in the
 * root layout - one `<defs>` for the whole document, because an id repeated per
 * button is the same filter defined N times.
 */
function GlassFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0" focusable="false">
      <defs>
        <filter
          id="liquid-glass-filter"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          {/* Scale is well under the 70 the reference uses: a CTA is ~44px tall,
              and at 70 the displacement pushes the sampled backdrop clean off
              the button. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidButton, liquidButtonVariants, GlassFilter };
export type { LiquidButtonProps };
