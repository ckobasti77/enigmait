"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { useConsent } from "./ConsentProvider";

// Bottom-docked, NOT a page-locking modal: the container passes clicks through
// (pointer-events-none) and only the card itself is interactive, so the site
// stays fully usable while the banner is up.
const containerClasses =
  "fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 pointer-events-none";

const cardClasses =
  "pointer-events-auto w-full max-w-3xl rounded-2xl border border-theme bg-card/95 backdrop-blur-md shadow-theme px-6 py-5 text-sm text-theme-muted";

const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 cursor-pointer";

// "Prihvatam sve" and "Samo neophodni" share this variant so accepting and
// declining are visually equal - declining must never be the harder path.
const buttonEqual =
  "border-transparent bg-theme-primary text-theme-primary-contrast hover:bg-theme-primary/90";
const buttonQuiet =
  "border-theme bg-transparent text-theme-primary hover:bg-muted/70";

const toggleClasses =
  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-theme transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40";

const toggleIndicatorClasses =
  "absolute top-0.5 inline-block h-5 w-5 transform rounded-full shadow transition-transform";

const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) => {
  const state = checked
    ? { track: "bg-theme-primary/80", thumb: "translate-x-5 bg-theme-primary-contrast" }
    : { track: "bg-theme-muted/40", thumb: "translate-x-0.5 bg-white/90" };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <span className="block font-medium text-theme-primary">{label}</span>
        <span className="block text-[13px] leading-snug text-theme-muted">
          {description}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={clsx(toggleClasses, state.track)}
        onClick={() => onChange(!checked)}
      >
        <span
          className={clsx(toggleIndicatorClasses, state.thumb)}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

const CookieConsent = () => {
  const { consent, isOpen, mounted, acceptAll, acceptNecessaryOnly, save } =
    useConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const titleId = useId();
  const descId = useId();

  // Rendered only after mount and only while open, so it never flashes for a
  // returning visitor whose choice is already stored.
  if (!mounted || !isOpen) return null;

  const openSettings = () => {
    // Reflect the current choice when re-opened from the footer (withdrawal).
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
    setShowSettings(true);
  };

  // Chrome that must be readable the instant it appears -> opt out of the
  // site-wide word-by-word reveal (data-reveal="off").
  return (
    <div className={containerClasses} data-reveal="off">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cardClasses}
      >
        <div className="space-y-3">
          <h2
            id={titleId}
            data-display-font="off"
            className="text-base font-semibold text-theme-primary"
          >
            Poštujemo vašu privatnost
          </h2>
          <p id={descId}>
            Koristimo neophodne kolačiće da sajt radi. Uz vaš pristanak koristimo
            i kolačiće za analitiku i marketing kako bismo razumeli posete i
            merili kampanje. Vi birate šta dozvoljavate.{" "}
            {/* TODO: create the /politika-kolacica route with the real policy. */}
            <a
              href="/politika-kolacica"
              className="text-theme-primary underline underline-offset-2 transition-theme hover:opacity-80"
            >
              Politika kolačića
            </a>
            .
          </p>

          {showSettings && (
            <div className="space-y-4 rounded-xl border border-theme bg-muted/30 p-4">
              <Toggle
                checked={analytics}
                onChange={setAnalytics}
                label="Analitika"
                description="Merenje poseta i ponašanja na sajtu (Google Analytics)."
              />
              <Toggle
                checked={marketing}
                onChange={setMarketing}
                label="Marketing"
                description="Merenje i optimizacija oglasa (Meta Pixel)."
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className={clsx(buttonBaseClasses, buttonQuiet)}
                  onClick={() => save({ analytics, marketing })}
                >
                  Sačuvaj izbor
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className={clsx(buttonBaseClasses, buttonEqual, "sm:flex-1")}
              onClick={acceptAll}
            >
              Prihvatam sve
            </button>
            <button
              type="button"
              className={clsx(buttonBaseClasses, buttonEqual, "sm:flex-1")}
              onClick={acceptNecessaryOnly}
            >
              Samo neophodni
            </button>
            {!showSettings && (
              <button
                type="button"
                className={clsx(buttonBaseClasses, buttonQuiet, "sm:flex-1")}
                onClick={openSettings}
              >
                Podešavanja
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
