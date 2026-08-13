"use client";

import { navLinks } from "@/constants/navLinks";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ServicesDropdown from "./ServicesDropdown";
import { useLanguage } from "./LanguageProvider";

import { LucideIcon } from "lucide-react";

export type DropdownLink = {
  id: number;
  to: string;
  headline: string;
  subheadline: string;
  icon: LucideIcon;
};

export type NavLink = {
  id: number;
  to: string;
  text: string;
  cta?: boolean;
  dropdownLinks?: DropdownLink[];
};

type NavLinksProps = {
  currentDropdown: number;
  setCurrentDropdown: React.Dispatch<React.SetStateAction<number>>;
};

const SERVICES_TRIGGER_ID = "nav-services-trigger";
const SERVICES_PANEL_ID = "nav-services-panel";

const absPath = (s: string) => (s.startsWith("/") ? s : `/${s}`);

const canUseHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** `Kontakt` leaves the pill - it is the CTA now. */
const pillLinks = navLinks.filter((link) => !link.cta) as NavLink[];

const NavLinks = ({ currentDropdown, setCurrentDropdown }: NavLinksProps) => {
  const pathname = usePathname();
  const { locale } = useLanguage();

  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [hoveredIndex, setHoveredIndex] = useState(-1);

  // Service sub-pages keep the marker on "Usluge", so `/` matches exactly while
  // everything else matches by prefix.
  const activeIndex = pillLinks.findIndex((link) => {
    const path = absPath(link.to);
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  });

  const targetIndex = hoveredIndex >= 0 ? hoveredIndex : activeIndex;
  const targetIndexRef = useRef(targetIndex);

  /**
   * Reads geometry first, writes second - never interleaved, so a pass over the
   * items can't thrash layout. `width` is tweened rather than `scaleX` because a
   * scaled pill distorts its own round ends; the cost is one absolutely
   * positioned element, which is nothing at this size.
   */
  const moveIndicator = useCallback((index: number, immediate = false) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const el = index >= 0 ? itemRefs.current[index] : null;
    if (!el) {
      gsap.to(indicator, { opacity: 0, duration: 0.2, overwrite: "auto" });
      return;
    }

    const left = el.offsetLeft;
    const width = el.offsetWidth;

    if (immediate) {
      gsap.set(indicator, { x: left, width, opacity: 1 });
      return;
    }

    gsap.to(indicator, {
      x: left,
      width,
      opacity: 1,
      duration: 0.42,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  useEffect(() => {
    // The mirror lives here rather than in the render body so the resize
    // observer below has a target to re-paint without re-subscribing.
    targetIndexRef.current = targetIndex;
    moveIndicator(targetIndex);
  }, [moveIndicator, targetIndex]);

  /**
   * Re-measure whenever the labels can change width underneath us. The locale
   * pass is the one that is easy to miss: `LanguageProvider` swaps text nodes
   * through a TreeWalker, so link widths change without a single React render
   * the indicator could otherwise notice.
   */
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        moveIndicator(targetIndexRef.current, true);
      });
    };

    // Observing the items themselves rather than keying an effect off `locale`
    // is deliberate: the provider mutates text nodes from its own
    // MutationObserver, so a locale-keyed effect can run before the swap lands
    // and measure the old label. The observer is downstream of the DOM change
    // and cannot race it.
    const observer = new ResizeObserver(schedule);
    observer.observe(pill);
    itemRefs.current.forEach((el) => el && observer.observe(el));

    schedule();
    void document.fonts?.ready.then(schedule);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale, moveIndicator]);

  const closeDropdown = useCallback(
    () => setCurrentDropdown(0),
    [setCurrentDropdown]
  );

  // The old panel survived client navigation - nothing closed it on a route
  // change, so following a link left it hanging over the new page.
  useEffect(() => {
    closeDropdown();
  }, [closeDropdown, pathname]);

  useEffect(() => {
    if (currentDropdown === 0) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeDropdown();
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDropdown, currentDropdown]);

  const services = pillLinks.find((link) => link.dropdownLinks);

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:block"
      // The close lives on the wrapper that spans pill and panel, not on the
      // pill - but the wrapper's own box is only as tall as the pill, so the
      // gap down to the panel still needs the bridge below.
      onMouseLeave={() => {
        setHoveredIndex(-1);
        if (canUseHover()) closeDropdown();
      }}
    >
      {/* Borderless glass pill - bg wash + blur, no rim (see `.nav-pill`). */}
      <div ref={pillRef} className="nav-pill flex items-center gap-1 p-1.5">
        <span ref={indicatorRef} className="nav-indicator" aria-hidden />

        {pillLinks.map((link, index) => {
          const isOpen = currentDropdown === link.id;
          const isCurrent = index === activeIndex;

          return (
            <div
              key={link.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="relative z-10 flex items-center"
              onMouseEnter={() => {
                setHoveredIndex(index);
                if (!canUseHover()) return;
                setCurrentDropdown(link.dropdownLinks ? link.id : 0);
              }}
            >
              <Link
                href={absPath(link.to)}
                aria-current={isCurrent ? "page" : undefined}
                style={{ fontFamily: "var(--font-aeonik)" }}
                className={clsx(
                  // Same corner as the indicator that slides under it, so the
                  // focus ring and the marker are the same shape.
                  "rounded-full py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70",
                  link.dropdownLinks ? "pl-4 pr-1.5" : "px-4",
                  isCurrent || isOpen
                    ? "text-theme-primary"
                    : "text-theme-muted hover:text-theme-primary"
                )}
              >
                {/* letter-spacing adds a trailing space after the last glyph,
                    which would sit the label ~2px left of the indicator's
                    centre. Cancel it rather than fudging the padding. */}
                <span className="-me-[0.2em] block">{link.text}</span>
              </Link>

              {link.dropdownLinks && (
                /* Split trigger: the label stays a real link to /services while
                   the chevron is the disclosure, so keyboard and touch get a
                   toggle without having to navigate away to see the panel. */
                <button
                  ref={triggerRef}
                  id={SERVICES_TRIGGER_ID}
                  type="button"
                  aria-label={isOpen ? "Sakrij usluge" : "Prikaži usluge"}
                  aria-expanded={isOpen}
                  aria-controls={SERVICES_PANEL_ID}
                  onClick={() => setCurrentDropdown(isOpen ? 0 : link.id)}
                  className="rounded-full py-2 pl-0.5 pr-3.5 text-theme-muted transition-colors duration-300 hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                >
                  <ChevronDown
                    className={clsx(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {services?.dropdownLinks && (
        <>
          {/* Hover bridge across the gap between the pill and the panel.
              `mouseleave` follows DOM ancestry, not geometry, so a child of the
              wrapper keeps the pointer "inside" even though it sits visually
              outside the wrapper's box. Without it a slow diagonal into the
              panel crosses bare page for a few pixels, fires leave, and the
              panel is already closed (and pointer-events:none) by the time the
              cursor arrives. Nothing moves - this only fills the dead zone.
              Inert while closed so it never eats clicks on the hero. */}
          <span
            aria-hidden
            className={clsx(
              "absolute left-1/2 top-full h-5 -translate-x-1/2",
              currentDropdown === services.id
                ? "pointer-events-auto"
                : "pointer-events-none"
            )}
            style={{
              width: "min(52rem, calc(100vw - 2 * var(--site-edge-gutter)))",
            }}
          />
          <ServicesDropdown
            id={SERVICES_PANEL_ID}
            open={currentDropdown === services.id}
            parentPath={services.to}
            links={services.dropdownLinks}
            labelledBy={SERVICES_TRIGGER_ID}
            onNavigate={closeDropdown}
          />
        </>
      )}
    </div>
  );
};

export default NavLinks;
