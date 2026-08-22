"use client";

import { useConsent } from "./ConsentProvider";

/**
 * Footer control that re-opens the consent banner so a visitor can withdraw or
 * change a previously given choice. A small client island, so Footer.tsx stays a
 * server component.
 */
export default function CookieSettingsLink() {
  const { reopen } = useConsent();

  return (
    <button
      type="button"
      onClick={reopen}
      className="cursor-pointer transition-theme hover:text-theme-primary"
    >
      Podešavanja kolačića
    </button>
  );
}
