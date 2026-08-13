"use client";

import clsx from "clsx";
import { useLanguage } from "./LanguageProvider";
import type { Locale } from "@/lib/i18n";

const localeOptions: Array<{ locale: Locale; label: string }> = [
  { locale: "sr", label: "SR" },
  { locale: "en", label: "EN" },
];

const switcherLabels: Record<Locale, string> = {
  sr: "Prebaci jezik sajta",
  en: "Switch site language",
};

const ariaLabels: Record<Locale, Record<Locale, string>> = {
  sr: {
    sr: "Prikaži sajt na srpskom",
    en: "Prikaži sajt na engleskom",
  },
  en: {
    sr: "Switch site to Serbian",
    en: "Switch site to English",
  },
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    // `cta-rim` (globals.css) gives the chip the CTA's blue rim and its slow
    // breath, in both nav phases - the switcher sits next to the CTA, so a
    // neutral border there read as a different system. The corner is the
    // site-wide `--surface-radius`; the segments take one step in from it.
    <div
      className="cta-rim relative inline-flex h-10 items-center gap-0.5 rounded-[var(--surface-radius)] border border-theme bg-card/70 px-0.5 text-theme-primary transition-theme sm:h-11 sm:px-1"
      aria-label={switcherLabels[locale]}
      data-no-translate="true"
    >
      {localeOptions.map((option) => {
        const active = option.locale === locale;

        return (
          <button
            key={option.locale}
            type="button"
            aria-label={ariaLabels[locale][option.locale]}
            aria-pressed={active}
            onClick={() => setLocale(option.locale)}
            className={clsx(
              "min-w-7 rounded-[var(--surface-radius-inner)] px-1.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 sm:min-w-9 sm:px-2.5 sm:text-[11px]",
              active
                ? "bg-muted text-theme-primary"
                : "text-theme-muted hover:bg-muted hover:text-theme-primary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
