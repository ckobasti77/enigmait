"use client";

import { useMemo } from "react";
import { useCookieConsent } from "./CookieConsentProvider";
import clsx from "clsx";

const overlayContainerClasses =
  "fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 pointer-events-none";

const overlayBackdropClasses =
  "absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto";

const bannerClasses =
  "relative w-full max-w-3xl pointer-events-auto rounded-2xl border border-theme bg-card/95 backdrop-blur-md shadow-theme px-6 py-5 text-sm text-theme-muted";

const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 cursor-pointer";

const buttonVariants = {
  primary:
    "border-transparent bg-theme-primary text-theme-primary-contrast hover:bg-theme-primary/90",
  secondary:
    "border-theme bg-transparent text-theme-primary hover:bg-muted/70",
  ghost:
    "border-transparent bg-transparent text-theme-muted hover:bg-muted/70",
};

const toggleClasses =
  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-theme transition-colors";

const toggleIndicatorClasses =
  "absolute top-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform";

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => {
  const stateClasses = useMemo(
    () =>
      checked
        ? {
            track: "bg-theme-primary/80",
            thumb: "translate-x-5 bg-theme-primary-contrast",
          }
        : {
            track: "bg-theme-muted/40",
            thumb: "translate-x-0.5 bg-white/90",
          },
    [checked]
  );

  return (
    <label className="flex items-center gap-3">
      <span className="text-theme-primary font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={clsx(toggleClasses, stateClasses.track)}
        onClick={() => onChange(!checked)}
      >
        <span
          className={clsx(toggleIndicatorClasses, stateClasses.thumb)}
          aria-hidden="true"
        />
      </button>
    </label>
  );
};

const CookieConsentBanner = () => {
  const {
    consent,
    hasResponded,
    setFunctionalConsent,
    acceptAll,
    declineOptional,
    savePreferences,
  } = useCookieConsent();

  if (hasResponded) return null;

  return (
    <div className={overlayContainerClasses} role="dialog" aria-modal="true">
      <div className={overlayBackdropClasses} />
      <div className={bannerClasses}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h2
              data-display-font="off"
              className="text-base font-semibold text-theme-primary"
            >
              Upravljajte podešavanjima kolačića
            </h2>
            <p>
              Koristimo neophodne kolačiće da bi sajt radio. Omogućite funkcionalne kolačiće da zapamtimo izbore kao što su tema ili jezik.
            </p>
            <Toggle
              checked={consent.functional}
              onChange={setFunctionalConsent}
              label="Funkcionalni kolačići"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-44">
            <button
              type="button"
              className={clsx(buttonBaseClasses, buttonVariants.primary)}
              onClick={acceptAll}
            >
              Prihvati sve
            </button>
            <button
              type="button"
              className={clsx(buttonBaseClasses, buttonVariants.secondary)}
              onClick={savePreferences}
            >
              Sačuvaj izbor
            </button>
            <button
              type="button"
              className={clsx(buttonBaseClasses, buttonVariants.ghost)}
              onClick={declineOptional}
            >
              Samo neophodni
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
