"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { navLinks } from "@/constants/navLinks";
import { useSmoothScroll } from "./SmoothScrollProvider";
import CtaButton from "@/components/ui/cta-button";
import { LucideIcon, ArrowUpRight, ChevronDown } from "lucide-react";
import clsx from "clsx";
import gsap from "gsap";

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

type NavLinksMobileProps = {
  toggleNav: () => void;
  navOpen: boolean;
  currentDropdown: number;
  setCurrentDropdown: React.Dispatch<React.SetStateAction<number>>;
};

const normalize = (s: string) => s.replace(/^\/+|\/+$/g, "");
const joinPath = (...parts: string[]) =>
  "/" + parts.filter(Boolean).map(normalize).join("/");
const absPath = (s: string) => (s.startsWith("/") ? s : `/${s}`);

const NavLinksMobile = ({
  toggleNav,
  navOpen,
  currentDropdown,
  setCurrentDropdown,
}: NavLinksMobileProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  /** The close branch below must never run for a menu that was never opened -
   *  on mount it would play a 0.68s hidden animation and write stale inline
   *  opacity onto rows, and call unlockScroll before Lenis even exists. */
  const hasOpenedRef = useRef(false);
  const smoothScrollRef = useSmoothScroll();

  const mainLinks = navLinks.filter((l) => !l.cta);
  const ctaLink = navLinks.find((l) => l.cta);

  /**
   * `body { overflow: hidden }` alone never actually locked this: the scrolling
   * element is `documentElement`, and Lenis keeps consuming wheel events either
   * way, so the page kept moving behind the curtain. `lenis.stop()` is the
   * intended fix - `globals.css` already ships `.lenis-stopped { overflow: hidden }`
   * for it. The fallback branch is not optional: under reduced motion the
   * provider never constructs a Lenis instance at all.
   */
  const lockScroll = useCallback(() => {
    smoothScrollRef?.current?.stop();
    // Root overflow unconditionally: body alone is the element iOS Safari
    // historically ignores, and lenis.stop() does not stop native touch scroll.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }, [smoothScrollRef]);

  const unlockScroll = useCallback(() => {
    smoothScrollRef?.current?.start();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, [smoothScrollRef]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const validItems = itemRefs.current.filter(Boolean) as HTMLDivElement[];

    if (navOpen) {
      hasOpenedRef.current = true;
      lockScroll();
      overlay.style.display = "flex";
      overlay.style.pointerEvents = "auto";
      innerRef.current?.focus({ preventScroll: true });

      gsap.killTweensOf([overlay, ...validItems, footerRef.current, blobRef.current]);

      // Panel reveal — curtain drops from top
      gsap.fromTo(
        overlay,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "expo.inOut" }
      );

      // Accent blob
      if (blobRef.current) {
        gsap.fromTo(
          blobRef.current,
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, ease: "power2.out", delay: 0.35 }
        );
      }

      // Nav items stagger
      gsap.fromTo(
        validItems,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      // Footer
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.7 }
        );
      }
    } else {
      if (!hasOpenedRef.current) return;

      document.querySelector<HTMLElement>("[data-nav-burger]")?.focus();

      gsap.killTweensOf([overlay, ...validItems, footerRef.current, blobRef.current]);

      // Items exit
      if (validItems.length) {
        gsap.to(validItems, {
          y: -18,
          opacity: 0,
          duration: 0.2,
          stagger: 0.03,
          ease: "power2.in",
        });
      }

      // Panel close. The scroll unlock waits for the curtain: releasing it up
      // front left the page scrollable under a still-opaque overlay for 0.68s.
      gsap.to(overlay, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.6,
        ease: "expo.inOut",
        delay: 0.08,
        onComplete: () => {
          unlockScroll();
          overlay.style.pointerEvents = "none";
          overlay.style.display = "none";
        },
      });
    }

    return () => {
      unlockScroll();
    };
  }, [lockScroll, navOpen, unlockScroll]);

  // Escape closes; Tab cycles inside the dialog. The burger lives outside the
  // overlay but is the close control, so it is part of the cycle.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!navOpen) return;

      if (e.key === "Escape") {
        toggleNav();
        return;
      }
      if (e.key !== "Tab") return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const burger = document.querySelector<HTMLElement>("[data-nav-burger]");
      const inOverlay = Array.from(
        overlay.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      ).filter(
        // visibility:hidden covers the collapsed accordion links - they are
        // unfocusable, so wrapping onto one would silently drop the trap.
        (el) => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden"
      );
      const focusables = [burger, ...inOverlay].filter(
        (el): el is HTMLElement => el !== null
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !focusables.includes(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navOpen, toggleNav]);

  return (
    <div
      ref={overlayRef}
      // z-[45]: above ScrollToTopButton (z-40, later in the DOM, would paint
      // over the curtain on a z tie), below the bar (z-50 - the burger must
      // stay tappable). `lg:hidden!` because the open path writes an inline
      // display:flex that a plain utility cannot beat past the breakpoint.
      className="fixed inset-0 z-[45] hidden flex-col overflow-hidden lg:hidden!"
      style={{ pointerEvents: "none", clipPath: "inset(0 0 100% 0)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Meni navigacije"
      data-reveal="off"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-[#07090d]" />

      {/* Gradient accent — top-right */}
      <div
        ref={blobRef}
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-blue-600/20 via-pink-500/10 to-transparent blur-3xl"
      />

      {/* Gradient accent — bottom-left */}
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent blur-3xl" />

      {/* Subtle grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Main content ───────────────────────────────── */}
      <div
        ref={innerRef}
        tabIndex={-1}
        data-lenis-prevent
        className="overscroll-contain relative z-10 flex h-full flex-col overflow-y-auto px-[max(1.75rem,env(safe-area-inset-left),env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[calc(var(--nav-bar-height)+1rem+env(safe-area-inset-top))] outline-none sm:px-[max(2.5rem,env(safe-area-inset-left),env(safe-area-inset-right))]"
      >

        {/* Navigation links. `my-auto`, not flex-1 + justify-center: auto
            margins collapse once content outgrows the scroller, so a short
            screen scrolls from the first row instead of clipping both ends. */}
        <nav className="my-auto flex w-full flex-col py-4" aria-label="Mobilna navigacija">
          {mainLinks.map((link, i) => {
            const hasDropdown = !!link.dropdownLinks?.length;
            const isOpen = currentDropdown === link.id;

            return (
              <div
                key={link.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
              >
                {/* ── Row ── */}
                <div
                  className={clsx(
                    "flex items-center border-b transition-colors duration-300",
                    isOpen ? "border-white/10" : "border-white/[0.06]"
                  )}
                >
                  {hasDropdown ? (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-nav-panel-${link.id}`}
                      onClick={() =>
                        setCurrentDropdown((prev) =>
                          prev === link.id ? 0 : link.id
                        )
                      }
                      className="group flex flex-1 items-center py-5"
                    >
                      <span
                        className={clsx(
                          "text-[2rem] font-medium leading-none tracking-wide transition-all duration-400",
                          isOpen
                            ? "bg-gradient-to-r from-blue-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent"
                            : "text-white/75 group-hover:text-white"
                        )}
                      >
                        {link.text}
                      </span>
                      <ChevronDown
                        className={clsx(
                          "ml-auto h-5 w-5 shrink-0 transition-transform duration-400",
                          isOpen
                            ? "rotate-180 text-pink-400/70"
                            : "text-white/25 group-hover:text-white/50"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={absPath(link.to)}
                      onClick={() => {
                        setCurrentDropdown(0);
                        toggleNav();
                      }}
                      className="group flex flex-1 items-center py-5"
                    >
                      <span
                        className="text-[2rem] font-medium leading-none tracking-wide text-white/75 transition-colors duration-300 group-hover:text-white"
                      >
                        {link.text}
                      </span>
                      <ArrowUpRight className="-translate-x-2 ml-auto h-5 w-5 shrink-0 text-white/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white/50" />
                    </Link>
                  )}
                </div>

                {/* ── Services sub-grid ── */}
                {hasDropdown && (
                  <div
                    id={`mobile-nav-panel-${link.id}`}
                    className={clsx(
                      "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      // `invisible` takes the collapsed links out of the tab
                      // order; transition-all flips visibility at the right
                      // end of each transition, so nothing pops.
                      isOpen
                        ? "visible max-h-[420px] opacity-100 py-4"
                        : "invisible max-h-0 opacity-0"
                    )}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {link.dropdownLinks!.map((sub) => {
                        const Icon = sub.icon;
                        const href = joinPath(link.to, sub.to);
                        return (
                          <Link
                            key={sub.id}
                            href={href}
                            onClick={() => {
                              setCurrentDropdown(0);
                              toggleNav();
                            }}
                            className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition-all duration-200 hover:border-cyan-400/25 hover:bg-white/[0.06]"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors duration-200 group-hover:bg-cyan-400/10">
                              <Icon className="h-4 w-4 text-white/45 transition-colors duration-200 group-hover:text-cyan-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white/70 transition-colors group-hover:text-white">
                                {sub.headline}
                              </p>
                              <p className="mt-0.5 truncate text-[11px] leading-tight text-white/30">
                                {sub.subheadline}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Footer strip ── */}
        <div
          ref={footerRef}
          className="mt-8 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-6"
        >
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/30">
              Pokreni projekat
            </p>
            {/* The menu overlay is dark in both themes, so the button has to be
                pinned to its dark rim rather than the page's. Both `--on-dark`
                classes ride along so the pin survives a `look` switch. */}
            {ctaLink && (
              <CtaButton
                href={absPath(ctaLink.to)}
                onClick={toggleNav}
                size="sm"
                className="liquid-glass--on-dark trace-cta--on-dark"
              >
                {ctaLink.text}
                <ArrowUpRight className="h-4 w-4" />
              </CtaButton>
            )}
          </div>

          <p className="text-right text-[11px] leading-relaxed text-white/20">
            © {new Date().getFullYear()}
            <br />
            Enigma Digital
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavLinksMobile;
