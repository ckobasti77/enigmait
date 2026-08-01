"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronUp } from "lucide-react";
import { useSmoothScroll } from "./SmoothScrollProvider";

const ScrollToTopButton = () => {
  const smoothScrollRef = useSmoothScroll();
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const tickingRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const updateVisibility = () => {
      const hero = document.querySelector<HTMLElement>(
        "[data-scroll-story-hero]"
      );
      const visibilityThreshold = hero
        ? hero.offsetTop + hero.offsetHeight
        : 80;
      const nextVisible = window.scrollY > visibilityThreshold;
      if (isVisibleRef.current !== nextVisible) {
        isVisibleRef.current = nextVisible;
        setIsVisible(nextVisible);
      }
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    const lenis = smoothScrollRef?.current;

    if (lenis) {
      lenis.scrollTo("top", {
        duration: 0.9,
        lock: true,
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Vrati se na vrh"
      onClick={handleClick}
      className={clsx(
        "btn-blur fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white shadow-lg transition-all duration-300",
        "hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isVisible
          ? "pointer-events-auto opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-2"
      )}
    >
      <ChevronUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
