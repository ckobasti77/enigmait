"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ConsentCategories,
  NO_CONSENT,
  clearTrackingCookies,
  pushConsentModeUpdate,
  readConsent,
  writeConsent,
} from "@/constants/consentConfig";

type ConsentContextValue = {
  consent: ConsentCategories;
  hasResponded: boolean;
  /** Whether the banner is currently shown. */
  isOpen: boolean;
  /** False during SSR and the first client render, so the banner never flashes
   *  for someone who already decided. */
  mounted: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  save: (categories: ConsentCategories) => void;
  reopen: () => void;
  close: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<ConsentCategories>(NO_CONSENT);
  const [hasResponded, setHasResponded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // localStorage is only read after mount - the server can't know it, so reading
  // it during render would risk a hydration mismatch. Absent/blocked storage
  // (private window) leaves consent at NO_CONSENT and opens the banner.
  useEffect(() => {
    setMounted(true);

    const stored = readConsent();
    if (stored) {
      setConsent({ analytics: stored.analytics, marketing: stored.marketing });
      setHasResponded(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  const commit = useCallback((next: ConsentCategories) => {
    // Withdrawal cleanup: clear the tracker cookies of any category now denied.
    const denied: ConsentCategories = {
      analytics: !next.analytics,
      marketing: !next.marketing,
    };
    clearTrackingCookies(denied);

    writeConsent(next);
    pushConsentModeUpdate(next);

    setConsent(next);
    setHasResponded(true);
    setIsOpen(false);
  }, []);

  const acceptAll = useCallback(
    () => commit({ analytics: true, marketing: true }),
    [commit]
  );

  const acceptNecessaryOnly = useCallback(
    () => commit({ analytics: false, marketing: false }),
    [commit]
  );

  const save = useCallback(
    (categories: ConsentCategories) => commit(categories),
    [commit]
  );

  const reopen = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasResponded,
      isOpen,
      mounted,
      acceptAll,
      acceptNecessaryOnly,
      save,
      reopen,
      close,
    }),
    [
      consent,
      hasResponded,
      isOpen,
      mounted,
      acceptAll,
      acceptNecessaryOnly,
      save,
      reopen,
      close,
    ]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }

  return context;
};
