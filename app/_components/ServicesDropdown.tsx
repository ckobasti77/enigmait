"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import {
  buildBorderTracePaths,
  TRACE_LENGTH,
} from "@/lib/borderTrace";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { DropdownLink } from "./NavLinks";

/**
 * The services mega panel.
 *
 * Behaviour is modelled on `SocialDropdown` rather than the old hover-only
 * implementation: click toggles, hover only opens on a real pointer, outside
 * pointerdown and Escape close (all owned by `NavLinks`, which lifts the open
 * state). The old panel was unreachable by keyboard and carried no
 * `aria-expanded` / `aria-haspopup` at all.
 *
 * Opening runs the same unlock the process cards use: two streaks split at the
 * top edge midpoint, run the border in opposite directions and meet at the
 * bottom midpoint, with the rows coming up inside that trace. Once the streaks
 * land, a rotating conic ring takes over as the resting state.
 */

/** Matches `--nav-panel-radius`; the trace has to follow the same corner. */
const PANEL_RADIUS = 16;

/** Streak length, in the same normalised units the paths are rendered at. */
const TRACE_DASH = TRACE_LENGTH * 0.17;

/**
 * The trace and the row cascade are deliberately the same length: the streaks
 * meet at the bottom on the same frame the last row settles, so the unlock
 * reads as one gesture rather than two that happen to overlap.
 *
 * The cascade spans `stagger * (rows - 1) + duration`, so with six rows:
 * 0.09 * 5 + 0.45 = 0.90. Each row starts long before the one before it has
 * finished, which is what makes it read as a ripple instead of a queue.
 */
const TRACE_DURATION = 0.9;
const ITEM_DURATION = 0.45;
const ITEM_STAGGER = 0.09;

/** The shell has to exist before anything can be drawn on its border. */
const SHELL_DURATION = 0.24;

const normalize = (s: string) => s.replace(/^\/+|\/+$/g, "");
const joinPath = (...parts: string[]) =>
  "/" + parts.filter(Boolean).map(normalize).join("/");

const DropdownItem = ({
  href,
  icon: Icon,
  headline,
  subheadline,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  headline: string;
  subheadline: string;
  onNavigate: () => void;
}) => {
  // The cursor glow is written straight onto the anchor and inherited by the
  // glow layer, so tracking the pointer costs no React state. The old version
  // held `useState(isHovered)` per row - six re-renders per hover.
  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseMove={handleMouseMove}
      style={{ fontFamily: "var(--font-aeonik)" }}
      className="nav-service-item group relative flex items-center gap-4 overflow-hidden rounded-xl p-3.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(180px circle at var(--glow-x, 50%) var(--glow-y, 50%), var(--glow-accent-2), transparent 70%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(168, 85, 247, 0.22)" }}
      />

      {/* Hover colour comes from `--nav-trace-color`, not a fixed Tailwind
          violet: violet-200/300 is legible on the dark panel and vanishes on
          the light one. The token is already violet per palette - dark over
          paper, bright over ink. */}
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-theme bg-transparent transition-all duration-300 group-hover:border-[var(--nav-trace-color)] group-hover:bg-[var(--nav-trace-glow)] group-hover:shadow-[0_0_15px_var(--nav-trace-glow)]">
        <Icon
          className="h-5 w-5 text-theme-muted transition-all duration-300 group-hover:scale-110 group-hover:text-[var(--nav-trace-color)]"
          aria-hidden
        />
      </span>

      <span className="relative z-10 block">
        {/* Chrome, not a headline - the display face is for actual headings. */}
        <span
          data-display-font="off"
          className="block text-[15px] font-medium text-theme-primary transition-colors duration-300 group-hover:text-[var(--nav-trace-color)]"
        >
          {headline}
        </span>
        <span className="block text-[13px] font-extralight text-theme-muted">
          {subheadline}
        </span>
      </span>

      <span className="relative z-10 ml-auto -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ChevronDown
          className="h-4 w-4 -rotate-90 text-[var(--nav-trace-color)]"
          aria-hidden
        />
      </span>
    </Link>
  );
};

type ServicesDropdownProps = {
  id: string;
  open: boolean;
  parentPath: string;
  links: DropdownLink[];
  labelledBy: string;
  onNavigate: () => void;
};

const ServicesDropdown = ({
  id,
  open,
  parentPath,
  links,
  labelledBy,
  onNavigate,
}: ServicesDropdownProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Same call as the process cards: the trace is a one-shot entrance, so only
  // an explicit OS preference switches it off - not a low battery.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  // Measured off the BORDER box, because the trace is drawn on the border - two
  // pixels of difference push a 1px stroke off the corner.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const measure = () => {
      const rect = body.getBoundingClientRect();
      setSize((current) =>
        Math.abs(current.width - rect.width) < 0.5 &&
        Math.abs(current.height - rect.height) < 0.5
          ? current
          : { width: rect.width, height: rect.height }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  // The shader tracks the pointer to place its specular; two custom properties
  // do the same job here with no React state and no per-frame readback.
  const handleSheenMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--panel-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--panel-y", `${event.clientY - rect.top}px`);
  };

  const tracePaths = useMemo(
    () =>
      buildBorderTracePaths(size.width, size.height, PANEL_RADIUS, "top"),
    [size.width, size.height]
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const traces = Array.from(panel.querySelectorAll(".nav-trace-path"));
    const items = Array.from(panel.querySelectorAll(".nav-service-item"));
    const targets = [panel, ...traces, ...items];

    // Kill in flight tweens but keep what they wrote. `gsap.context().revert()`
    // would restore the CSS resting state first, so a close would snap the
    // panel to hidden and then "animate" from there - no visible exit at all.
    gsap.killTweensOf(targets);

    let timeline: gsap.core.Timeline | undefined;

    if (prefersReducedMotion) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0, y: 0 });
      gsap.set(items, { autoAlpha: 1, y: 0, filter: "none" });
      if (open) panel.dataset.glow = "on";
      else delete panel.dataset.glow;
    } else if (!open) {
      delete panel.dataset.glow;
      gsap.to(panel, {
        autoAlpha: 0,
        y: -6,
        duration: 0.18,
        ease: "power2.in",
      });
    } else {
      gsap.set(traces, { strokeDashoffset: TRACE_DASH, autoAlpha: 1 });
      gsap.set(items, { autoAlpha: 0, y: 16, filter: "blur(6px)" });

      timeline = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          // The rotating ring is the resting state, so it only arms once the
          // streaks have landed - the two never share the border.
          onComplete: () => {
            panel.dataset.glow = "on";
            gsap.set(items, { clearProps: "filter,willChange" });
          },
        })
        .fromTo(
          panel,
          { autoAlpha: 0, y: -10 },
          { autoAlpha: 1, y: 0, duration: SHELL_DURATION, ease: "power2.out" }
        )
        // Past the end of the path the streak is clipped away entirely, so it
        // arrives at the meeting point and vanishes there rather than needing a
        // fade of its own.
        .to(
          traces,
          {
            strokeDashoffset: -TRACE_LENGTH,
            duration: TRACE_DURATION,
            ease: "power1.inOut",
          },
          SHELL_DURATION * 0.5
        )
        // Same start, same length as the trace: the last row settles on the
        // frame the streaks meet.
        .to(
          items,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: ITEM_DURATION,
            stagger: ITEM_STAGGER,
          },
          SHELL_DURATION * 0.5
        );
    }

    return () => {
      timeline?.kill();
      gsap.killTweensOf(targets);
    };
  }, [open, prefersReducedMotion, tracePaths]);

  return (
    <div
      ref={panelRef}
      id={id}
      // Deliberately not `role="menu"`. That role promises arrow-key roving
      // tabindex, Home/End and typeahead; announcing "menu, 6 items" over links
      // that behave like links is worse than saying nothing. These are
      // navigation links, and Tab already works on them.
      aria-labelledby={labelledBy}
      className="nav-panel left-1/2 top-full z-20 mt-4 -translate-x-1/2"
      style={{
        width: "min(52rem, calc(100vw - 2 * var(--site-edge-gutter)))",
      }}
    >
      <div
        ref={bodyRef}
        // No `backdrop-blur-*` utility here: the blur is owned in CSS so the
        // `@supports` block can swap it for the displacement filter.
        className="nav-panel-body overflow-hidden border border-theme"
        onMouseMove={handleSheenMove}
      >
        <span className="nav-panel-sheen" aria-hidden />

        <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

        {/* Above the sheen, so the specular washes the glass and not the copy. */}
        <div className="relative z-[2] grid grid-cols-2 gap-1.5 p-3">
          {links.map((link) => (
            <DropdownItem
              key={link.id}
              href={joinPath(parentPath, link.to)}
              icon={link.icon}
              headline={link.headline}
              subheadline={link.subheadline}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      <span className="nav-panel-glow" aria-hidden />

      {tracePaths[0] ? (
        <svg
          aria-hidden
          className="nav-trace"
          focusable="false"
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          {tracePaths.map((d, index) => (
            <path
              className="nav-trace-path"
              d={d}
              key={index}
              pathLength={TRACE_LENGTH}
              style={{ strokeDasharray: `${TRACE_DASH} ${TRACE_LENGTH}` }}
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
};

export default ServicesDropdown;
