"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import gsap from "gsap";
import Burger from "./Burger";
import NavLinks from "./NavLinks";
import NavLinksMobile from "./NavLinksMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import SocialDropdown from "./SocialDropdown";

gsap.registerPlugin(useGSAP);

const LOGO_INTRO_SESSION_KEY = "enigma-digital-navbar-logo-intro-v1";

const Navbar = () => {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState(0);
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const wordmarkMaskRef = useRef<HTMLSpanElement>(null);
  const wordmarkImageRef = useRef<HTMLImageElement>(null);
  const logoRevealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const logoIntroHoldRef = useRef<gsap.core.Tween | null>(null);
  const logoIntroPlayedRef = useRef(false);
  const logoIntroDecisionRef = useRef<{
    pathname: string;
    shouldPlay: boolean;
  } | null>(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const rafRef = useRef(0);

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
        logoIntroHoldRef.current = gsap.delayedCall(
          revealDuration + 2.5,
          () => {
            logoIntroHoldRef.current = null;
            if (!logoLinkRef.current?.matches(":hover, :focus")) {
              revealTimeline.reverse();
            }
          }
        );
      } else {
        revealTimeline.progress(0).pause();
      }

      return () => {
        logoIntroHoldRef.current?.kill();
        logoIntroHoldRef.current = null;
        if (logoRevealTimelineRef.current === revealTimeline) {
          logoRevealTimelineRef.current = null;
        }
      };
    },
    {
      dependencies: [pathname],
      scope: logoLinkRef,
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    const updateNavigationState = () => {
      const currentScrollPos = window.scrollY;
      const nextScrolled = currentScrollPos > 0;
      const shouldShowNav =
        currentScrollPos <= lastScrollYRef.current || currentScrollPos < 8;

      setShowNav((current) =>
        current === shouldShowNav ? current : shouldShowNav
      );
      setIsScrolled((current) =>
        current === nextScrolled ? current : nextScrolled
      );

      if (currentScrollPos !== lastScrollYRef.current) {
        setCurrentDropdown((current) => (current === 0 ? current : 0));
        setNavOpen((current) => (current ? false : current));
      }

      lastScrollYRef.current = currentScrollPos;
      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = window.requestAnimationFrame(updateNavigationState);
    };

    updateNavigationState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const revealLogo = useCallback(() => {
    logoIntroHoldRef.current?.kill();
    logoIntroHoldRef.current = null;
    logoRevealTimelineRef.current?.play();
  }, []);

  const retractLogo = useCallback(() => {
    if (logoLinkRef.current?.matches(":hover, :focus")) return;
    logoRevealTimelineRef.current?.reverse();
  }, []);

  const toggleNav = useCallback(() => {
    if (navOpen) {
      setCurrentDropdown(0);
    }
    setNavOpen((prev) => !prev);
  }, [navOpen]);

  return (
    <>
      <div
        className={clsx(
          "site-gutter fixed left-0 top-0 z-50 w-full transition-transform duration-300",
          isScrolled ? "bg-blur" : "bg-transparent",
          showNav ? "translate-y-0" : "-translate-y-full"
        )}
        // Chrome, not copy: the site-wide reveal would stage the menu every
        // time it slides back in.
        data-reveal="off"
      >
        {/* Same measure as the hero, so the logo sits on the headline's left edge. */}
        <div
          className="site-container grid grid-cols-[minmax(0,1fr)_auto] items-center pb-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <Link
            ref={logoLinkRef}
            href="/"
            className="relative z-10 inline-flex w-[112px] min-w-0 items-center justify-self-start gap-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:w-[160px] sm:gap-2.5 lg:w-[224px] xl:w-[244px]"
            aria-label="Enigma Digital — početna"
            onMouseEnter={revealLogo}
            onMouseLeave={retractLogo}
            onFocus={revealLogo}
            onBlur={retractLogo}
          >
            <Image
              src="/logos/logo-emblem.png"
              alt=""
              className="relative z-10 h-auto w-[40px] shrink-0 drop-shadow-[0_0_16px_rgba(0,183,255,0.26)] sm:w-[46px] lg:w-[52px]"
              width={1024}
              height={1024}
              priority
              sizes="(min-width: 1024px) 52px, (min-width: 640px) 46px, 40px"
              style={{ height: "auto" }}
            />
            <span
              ref={wordmarkMaskRef}
              className="invisible relative flex h-7 w-[60px] shrink-0 items-center overflow-hidden sm:h-8 sm:w-[104px] lg:w-[162px] xl:w-[180px]"
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

          <div className="flex items-center justify-self-end gap-1 sm:gap-4 lg:gap-6">
            <SocialDropdown />
            <LanguageSwitcher />
            <ThemeSwitcher />
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
