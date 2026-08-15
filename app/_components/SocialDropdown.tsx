"use client";

import Link from "next/link";
import { AtSign, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";

import { socialLinks } from "@/constants/socialLinks";
import { buildBorderTracePaths, TRACE_LENGTH } from "@/lib/borderTrace";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * The bottom-left social launcher, restyled to the exact fazon of
 * `ServicesDropdown` - same glass panel, the same two-streak border trace
 * unlock, the same rotating conic ring once it lands, the same per-row cursor
 * glow. Only the geometry differs: one column instead of a grid, and the
 * trace enters from the edge nearest the trigger, which for an `up-left`
 * panel is the *bottom* (`buildBorderTracePaths`'s "bottom" entry - added
 * alongside "top" for exactly this panel).
 */

/** Matches `--nav-panel-radius` - the trace has to follow the same corner. */
const PANEL_RADIUS = 14;

/** Streak length, in the same normalised units the paths are rendered at. */
const TRACE_DASH = TRACE_LENGTH * 0.17;

/** Same cadence as `ServicesDropdown`, so the two panels read as one family. */
const TRACE_DURATION = 0.9;
const ITEM_DURATION = 0.45;
const ITEM_STAGGER = 0.09;
const SHELL_DURATION = 0.24;

const canUseHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const SocialRow = ({
  item,
  onNavigate,
}: {
  item: (typeof socialLinks)[number];
  onNavigate: () => void;
}) => {
  const Icon = item.icon;

  // Cursor glow written straight onto the anchor, mirroring
  // `ServicesDropdown`'s `DropdownItem` - no per-row React state.
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

  const content = (
    <>
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

      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-theme bg-transparent transition-all duration-300 group-hover:border-[var(--nav-trace-color)] group-hover:bg-[var(--nav-trace-glow)] group-hover:shadow-[0_0_15px_var(--nav-trace-glow)]">
        <Icon
          className="h-5 w-5 text-theme-muted transition-all duration-300 group-hover:scale-110 group-hover:text-[var(--nav-trace-color)]"
          aria-hidden
        />
      </span>

      <span
        data-display-font="off"
        className="relative z-10 text-sm font-medium text-theme-primary transition-colors duration-300 group-hover:text-[var(--nav-trace-color)]"
      >
        {item.label}
      </span>

      {item.external ? (
        <AtSign
          className="relative z-10 ml-auto h-4 w-4 text-theme-muted opacity-70 transition-colors duration-300 group-hover:text-[var(--nav-trace-color)]"
          aria-hidden
        />
      ) : null}
    </>
  );

  const className =
    "nav-social-item group relative flex items-center gap-3 overflow-hidden rounded-xl p-2.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        role="menuitem"
        onMouseMove={handleMouseMove}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      role="menuitem"
      onClick={onNavigate}
      onMouseMove={handleMouseMove}
      className={className}
    >
      {content}
    </Link>
  );
};

type SocialDropdownProps = {
  /** `ghost` drops the resting border and fill - for use inside the nav island,
   *  where a bordered chip inside a bordered capsule reads as clutter. */
  variant?: "solid" | "ghost";
  /** Which corner the panel unfurls toward, relative to the trigger.
   *  `down-right` sits under a top-bar button; `up-left` sits over a
   *  bottom-left launcher so the panel opens up into the page, not off-screen. */
  menuPlacement?: "down-right" | "up-left";
};

export default function SocialDropdown({
  variant = "solid",
  menuPlacement = "down-right",
}: SocialDropdownProps) {
  const opensUp = menuPlacement === "up-left";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  // Measured off the BORDER box, same reason as `ServicesDropdown`: the trace
  // is drawn on the border, and a content-box viewBox pushes a 1px stroke off
  // the corner.
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

  const handleSheenMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--panel-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--panel-y", `${event.clientY - rect.top}px`);
  };

  const tracePaths = useMemo(
    () =>
      buildBorderTracePaths(
        size.width,
        size.height,
        PANEL_RADIUS,
        opensUp ? "bottom" : "top"
      ),
    [size.width, size.height, opensUp]
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const traces = Array.from(panel.querySelectorAll(".nav-trace-path"));
    const items = Array.from(panel.querySelectorAll(".nav-social-item"));
    const targets = [panel, ...traces, ...items];

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
        y: opensUp ? 6 : -6,
        duration: 0.18,
        ease: "power2.in",
      });
    } else {
      gsap.set(traces, { strokeDashoffset: TRACE_DASH, autoAlpha: 1 });
      gsap.set(items, { autoAlpha: 0, y: opensUp ? 12 : 16, filter: "blur(6px)" });

      timeline = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            panel.dataset.glow = "on";
            gsap.set(items, { clearProps: "filter,willChange" });
          },
        })
        .fromTo(
          panel,
          { autoAlpha: 0, y: opensUp ? 10 : -10 },
          { autoAlpha: 1, y: 0, duration: SHELL_DURATION, ease: "power2.out" }
        )
        .to(
          traces,
          {
            strokeDashoffset: -TRACE_LENGTH,
            duration: TRACE_DURATION,
            ease: "power1.inOut",
          },
          SHELL_DURATION * 0.5
        )
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
  }, [open, opensUp, prefersReducedMotion, tracePaths]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        if (canUseHover()) setOpen(true);
      }}
      onMouseLeave={() => {
        if (canUseHover()) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Otvori social linkove"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        data-active={open}
        className={clsx(
          "group relative flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 sm:h-11 sm:w-11",
          variant === "ghost"
            ? "border border-transparent bg-transparent text-theme-primary transition-all duration-300 hover:border-theme hover:bg-muted"
            : "icon-orb"
        )}
      >
        <Share2
          className="h-4 w-4 transition-transform duration-300 sm:h-[18px] sm:w-[18px]"
          strokeWidth={1.7}
          aria-hidden
        />
      </button>

      {/* Hover bridge - fills the gap between trigger and panel so the pointer
          never leaves the hover target while crossing it. */}
      <div
        aria-hidden
        className={clsx(
          "absolute h-4 w-[min(20rem,calc(100vw-2rem))]",
          opensUp ? "bottom-full left-0" : "top-full right-0",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      <div
        ref={panelRef}
        className={clsx(
          "nav-panel z-20",
          opensUp ? "bottom-full left-0 mb-4" : "right-0 top-full mt-4"
        )}
        style={{ width: "min(20rem, calc(100vw - 2rem))" }}
      >
        <div
          ref={bodyRef}
          role="menu"
          aria-label="Social i kontakt linkovi"
          className="nav-panel-body overflow-hidden border border-theme"
          onMouseMove={handleSheenMove}
        >
          <span className="nav-panel-sheen" aria-hidden />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

          <div className="relative z-[2] grid gap-1.5 p-3">
            {socialLinks.map((item) => (
              <SocialRow key={item.label} item={item} onNavigate={close} />
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
    </div>
  );
}
