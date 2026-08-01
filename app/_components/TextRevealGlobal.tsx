"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { createTextReveal } from "@/lib/textReveal";

/**
 * Mounts the site-wide text reveal. Renders nothing.
 *
 * It has to sit *inside* `LanguageProvider`: on a language switch the split
 * copy is put back together before the translation walker runs, and React
 * guarantees this child effect runs before the provider's own. See
 * `lib/textReveal.ts` for why the two cannot both own the same text nodes.
 */
export default function TextRevealGlobal() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { locale } = useLanguage();
  const controllerRef = useRef<ReturnType<typeof createTextReveal> | null>(null);
  const localeRef = useRef(locale);

  useEffect(() => {
    const controller = createTextReveal({
      reducedMotion: prefersReducedMotion,
    });

    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.stop();
      controllerRef.current = null;
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;

    // Hand the words back as whole sentences so the walker - which runs right
    // after this, in the provider above - has something it can match.
    controllerRef.current?.restoreAll();
  }, [locale]);

  return null;
}
