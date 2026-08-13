"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Burger from "./Burger";
import NavLinks from "./NavLinks";
import NavLinksMobile from "./NavLinksMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import CtaButton from "@/components/ui/cta-button";
import EnigmaCubeMark from "@/components/EnigmaCubeMark";
import { navLinks } from "@/constants/navLinks";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(useGSAP);

const LOGO_INTRO_SESSION_KEY = "enigma-digital-navbar-logo-intro-v1";

const ctaLink = navLinks.find((link) => link.cta);

const Navbar = () => {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState(0);
  const wordmarkMaskRef = useRef<HTMLSpanElement>(null);
  const wordmarkImageRef = useRef<HTMLImageElement>(null);
  const logoRevealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const logoIntroPlayedRef = useRef(false);
  const logoIntroDecisionRef = useRef<{
    pathname: string;
    shouldPlay: boolean;
  } | null>(null);

  const closeDropdown = useCallback(() => {
    setCurrentDropdown((current) => (current === 0 ? current : 0));
  }, []);

  const { barRef, isPeeled } = useNavVisibility({
    // Only the mobile menu locks. Locking on the dropdown would deadlock: the
    // panel would hold the bar visible, so it could never hide, so `onHide`
    // could never close the panel. Instead the hide commit closes it in the same
    // frame - and the panel rides the bar's transform anyway, so there is no
    // frame where it floats detached over the page.
    locked: navOpen,
    resetKey: pathname,
    onHide: closeDropdown,
  });

  /**
   * One paused timeline, two drivers: `progress(1)` is the full wordmark,
   * `progress(0)` is the emblem alone.
   *
   * It runs in a layout effect, so the non-intro branch lands on `progress(1)`
   * before paint and the `invisible` class in the markup never shows.
   *
   * Only clip and opacity move - the mask keeps its box. Collapsing the width
   * would animate layout inside a `fixed` bar that no page reserves space for,
   * and the emblem is first in the row, so it does not shift either way.
   */
  useGSAP(
    () => {
      const wordmarkMask = wordmarkMaskRef.current;
      const wordmarkImage = wordmarkImageRef.current;
      if (!wordmarkMask || !wordmarkImage) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const revealDuration = reduceMotion ? 0.001 : 0.62;
      const revealTimeline = gsap
        .timeline({ paused: true })
        .fromTo(
          wordmarkMask,
          {
            autoAlpha: 0,
            clipPath: "inset(0% 100% 0% 0%)",
          },
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: revealDuration,
            ease: reduceMotion ? "none" : "power3.inOut",
          },
          0
        )
        .fromTo(
          wordmarkImage,
          {
            opacity: 0.28,
            x: -18,
          },
          {
            opacity: 1,
            x: 0,
            duration: revealDuration,
            ease: reduceMotion ? "none" : "power3.out",
          },
          0
        );

      logoRevealTimelineRef.current = revealTimeline;

      let shouldPlayIntro: boolean;
      if (logoIntroDecisionRef.current?.pathname === pathname) {
        shouldPlayIntro = logoIntroDecisionRef.current.shouldPlay;
      } else {
        let introSeen = logoIntroPlayedRef.current;
        try {
          introSeen =
            introSeen ||
            window.sessionStorage.getItem(LOGO_INTRO_SESSION_KEY) === "true";
        } catch {
          // The in-memory ref still prevents repeats during this mounted session.
        }

        shouldPlayIntro = pathname === "/" && !introSeen;
        logoIntroDecisionRef.current = {
          pathname,
          shouldPlay: shouldPlayIntro,
        };
      }

      if (shouldPlayIntro) {
        logoIntroPlayedRef.current = true;
        try {
          window.sessionStorage.setItem(LOGO_INTRO_SESSION_KEY, "true");
        } catch {
          // Storage may be unavailable in privacy-restricted browser contexts.
        }

        revealTimeline.progress(0).play();
      } else {
        revealTimeline.progress(1).pause();
      }

      return () => {
        if (logoRevealTimelineRef.current === revealTimeline) {
          logoRevealTimelineRef.current = null;
        }
      };
    },
    {
      dependencies: [pathname],
      scope: barRef,
      revertOnUpdate: true,
    }
  );

  // Driver two: the island peel takes the wordmark with it.
  useEffect(() => {
    const timeline = logoRevealTimelineRef.current;
    if (!timeline) return;
    if (isPeeled) timeline.reverse();
    else timeline.play();
  }, [isPeeled]);

  const toggleNav = useCallback(() => {
    if (navOpen) {
      setCurrentDropdown(0);
    }
    setNavOpen((prev) => !prev);
  }, [navOpen]);

  /** Functional bail-outs, so the common no-op case commits nothing. */
  const closeMenu = useCallback(() => {
    setNavOpen((open) => (open ? false : open));
    setCurrentDropdown((current) => (current === 0 ? current : 0));
  }, []);

  // Crossing the lg boundary in either direction resets menu state: the mobile
  // overlay's inline display:flex outlives `lg:hidden` (open at tablet width,
  // rotate, and the menu is stuck with no burger and a locked scroll), and
  // `currentDropdown` is shared with the desktop mega panel, so a leaked
  // accordion id would render that panel open with no pointer near it.
  // Both the media-query event and a resize fallback drive the same check -
  // some engines only deliver one of the two reliably.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    let wasDesktop = query.matches;
    const sync = () => {
      if (query.matches === wasDesktop) return;
      wasDesktop = query.matches;
      closeMenu();
    };
    query.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, [closeMenu]);

  // Browser back/forward with the menu open: nothing else closes it, and the
  // scroll lock would survive onto the new page. Adjusted during render (the
  // DisciplineReel pattern), so the menu is already closed in the same commit
  // that paints the new route - an effect would flash it for a frame.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    closeMenu();
  }

  return (
    <>
      <div
        ref={barRef}
        className="site-gutter fixed left-0 top-0 z-50 w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        data-nav-state={isPeeled ? "peeled" : "top"}
        // Chrome, not copy: the site-wide reveal would stage the menu every
        // time it slides back in.
        data-reveal="off"
      >
        {/* Same measure as the hero, so the logo sits on the headline's left edge. */}
        <div className="site-container nav-inner grid grid-cols-[minmax(0,1fr)_auto] items-center lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* `cta-rim`: once the bar peels, the island is the surface that
              carries the CTA's blue rim and its breath - see globals.css. */}
          <span className="nav-surface cta-rim" aria-hidden />

          <Link
            href="/"
            className="relative z-10 inline-flex w-[112px] min-w-0 items-center justify-self-start gap-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 max-[359px]:w-auto sm:w-[160px] sm:gap-2.5 lg:w-[224px] xl:w-[244px]"
            aria-label="Enigma Digital — početna"
          >
            <EnigmaCubeMark className="relative z-10 h-[40px] w-[40px] shrink-0 drop-shadow-[0_0_16px_rgba(0,183,255,0.26)] sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]" />
            <span
              ref={wordmarkMaskRef}
              // Below 360px the control row plus wordmark outgrows the
              // viewport; the emblem alone is the logo there.
              className="invisible relative flex h-7 w-[60px] shrink-0 items-center overflow-hidden max-[359px]:hidden sm:h-8 sm:w-[104px] lg:w-[162px] xl:w-[180px]"
              aria-hidden="true"
              style={{ willChange: "clip-path, opacity" }}
            >
              <Image
                ref={wordmarkImageRef}
                src="/logos/logo-text.png"
                alt=""
                className="h-auto w-full object-contain object-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]"
                width={794}
                height={111}
                priority
                sizes="(min-width: 1280px) 180px, (min-width: 1024px) 162px, (min-width: 640px) 104px, 60px"
                style={{ height: "auto", willChange: "transform, opacity" }}
              />
            </span>
          </Link>

          <NavLinks
            setCurrentDropdown={setCurrentDropdown}
            currentDropdown={currentDropdown}
          />

          <div className="relative z-10 flex items-center justify-self-end gap-1 sm:gap-2 lg:gap-3">
            {/* One ghost icon button, one segmented chip, one CTA. The
                language switcher keeps its track because SR/EN needs a
                readable segmented control; equal-weight bordered chips inside a
                bordered island read as clutter. Social moved out to a fixed
                bottom-left launcher - see layout.tsx. */}
            <ThemeSwitcher variant="ghost" />
            <LanguageSwitcher />
            {ctaLink && (
              <CtaButton
                href={ctaLink.to}
                size="default"
                className="ml-1 hidden lg:inline-flex"
              >
                {ctaLink.text}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </CtaButton>
            )}
            <Burger toggleNav={toggleNav} navOpen={navOpen} />
          </div>
        </div>
      </div>

      <NavLinksMobile
        setCurrentDropdown={setCurrentDropdown}
        currentDropdown={currentDropdown}
        toggleNav={toggleNav}
        navOpen={navOpen}
      />
    </>
  );
};

export default Navbar;
