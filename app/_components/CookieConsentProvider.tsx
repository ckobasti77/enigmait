"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type ConsentState = {
  necessary: true;
  functional: boolean;
};

type CookieConsentContextValue = {
  consent: ConsentState;
  hasResponded: boolean;
  setFunctionalConsent: (enabled: boolean) => void;
  acceptAll: () => void;
  declineOptional: () => void;
  savePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

const CONSENT_COOKIE_NAME = "enigma-cookie-consent";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  functional: false,
};

type ConsentSnapshot = {
  consent: ConsentState;
  hasResponded: boolean;
};

const DEFAULT_SNAPSHOT: ConsentSnapshot = {
  consent: DEFAULT_CONSENT,
  hasResponded: false,
};

const readConsentCookieValue = () => {
  if (typeof document === "undefined") return null;

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`)) ?? null;
};

const parseConsentCookie = (cookie: string | null): ConsentState | null => {
  if (!cookie) return null;

  try {
    const raw = decodeURIComponent(cookie.split("=")[1] ?? "");
    const parsed = JSON.parse(raw) as Partial<ConsentState>;

    if (typeof parsed?.functional !== "boolean") {
      return null;
    }

    return {
      necessary: true,
      functional: parsed.functional,
    };
  } catch (error) {
    console.warn("Failed to parse consent cookie:", error);
    return null;
  }
};

let cachedCookieValue: string | null | undefined;
let cachedSnapshot = DEFAULT_SNAPSHOT;

const getConsentSnapshot = () => {
  const cookie = readConsentCookieValue();

  if (cookie === cachedCookieValue) {
    return cachedSnapshot;
  }

  cachedCookieValue = cookie;
  const stored = parseConsentCookie(cookie);
  cachedSnapshot = stored
    ? {
        consent: stored,
        hasResponded: true,
      }
    : DEFAULT_SNAPSHOT;

  return cachedSnapshot;
};

const getServerConsentSnapshot = () => DEFAULT_SNAPSHOT;

const subscribeConsentSnapshot = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const writeConsentCookie = (consent: ConsentState) => {
  if (typeof document === "undefined") return;

  const payload = encodeURIComponent(JSON.stringify(consent));
  const secureFlag = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
};

export const CookieConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieSnapshot = useSyncExternalStore(
    subscribeConsentSnapshot,
    getConsentSnapshot,
    getServerConsentSnapshot
  );
  const [manualSnapshot, setManualSnapshot] = useState<ConsentSnapshot | null>(null);

  const snapshot = manualSnapshot ?? cookieSnapshot;
  const { consent, hasResponded } = snapshot;

  useEffect(() => {
    if (!hasResponded) return;

    writeConsentCookie(consent);
  }, [consent, hasResponded]);

  const setFunctionalConsent = useCallback((enabled: boolean) => {
    setManualSnapshot((prev) => {
      const current = prev ?? cookieSnapshot;

      return {
        ...current,
        consent: {
          ...current.consent,
          functional: enabled,
        },
      };
    });
  }, [cookieSnapshot]);

  const acceptAll = useCallback(() => {
    setManualSnapshot({
      consent: {
        necessary: true,
        functional: true,
      },
      hasResponded: true,
    });
  }, []);

  const declineOptional = useCallback(() => {
    setManualSnapshot({
      consent: {
        necessary: true,
        functional: false,
      },
      hasResponded: true,
    });
  }, []);

  const savePreferences = useCallback(() => {
    setManualSnapshot((prev) => ({
      ...(prev ?? cookieSnapshot),
      hasResponded: true,
    }));
  }, [cookieSnapshot]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasResponded,
      setFunctionalConsent,
      acceptAll,
      declineOptional,
      savePreferences,
    }),
    [consent, hasResponded, setFunctionalConsent, acceptAll, declineOptional, savePreferences]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }

  return context;
};
