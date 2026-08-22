/**
 * Cookie-consent state for GA4 (analytics) and Meta Pixel (marketing).
 *
 * Neither tracker loads until the visitor explicitly opts in. Consent lives in
 * localStorage (not a cookie) under `enigma_consent_v1`; every read/write is
 * wrapped in try/catch because a private window (or blocked storage) throws on
 * access - in that case we behave as if there is NO consent ("unknown is not
 * permission").
 *
 * `CONSENT_DEFAULT_SCRIPT` runs as a plain inline <head> script, BEFORE gtag can
 * ever load, so Google Consent Mode v2 starts denied and only flips to the saved
 * choice for a returning visitor. Keep the storage key/version here in sync with
 * that script - both read the same `enigma_consent_v1`.
 */

export const CONSENT_STORAGE_KEY = "enigma_consent_v1";
export const CONSENT_VERSION = 1;

export type ConsentCategories = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentValue = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export const NO_CONSENT: ConsentCategories = {
  analytics: false,
  marketing: false,
};

/** Reads saved consent, or null when absent / malformed / storage unavailable. */
export const readConsent = (): ConsentValue | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentValue>;

    if (
      parsed?.version !== CONSENT_VERSION ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }

    return {
      version: CONSENT_VERSION,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
};

/** Persists the choice. Swallows storage errors (private window) - the session
 *  still runs on the in-memory state the provider holds. */
export const writeConsent = (categories: ConsentCategories): ConsentValue => {
  const value: ConsentValue = {
    version: CONSENT_VERSION,
    analytics: categories.analytics,
    marketing: categories.marketing,
    ts: Date.now(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }

  return value;
};

type ConsentModeStatus = "granted" | "denied";

/** Sends a Consent Mode v2 `update` reflecting the current choice. Uses the
 *  window.gtag stub the default script defines; falls back to dataLayer. */
export const pushConsentModeUpdate = (categories: ConsentCategories) => {
  if (typeof window === "undefined") return;

  const status = (value: boolean): ConsentModeStatus =>
    value ? "granted" : "denied";

  const payload = {
    analytics_storage: status(categories.analytics),
    ad_storage: status(categories.marketing),
    ad_user_data: status(categories.marketing),
    ad_personalization: status(categories.marketing),
  };

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  try {
    if (typeof w.gtag === "function") {
      w.gtag("consent", "update", payload);
    } else {
      w.dataLayer = w.dataLayer || [];
      // Mimic the arguments object gtag() pushes, so gtag.js reads it correctly.
      w.dataLayer.push({ 0: "consent", 1: "update", 2: payload });
    }
  } catch {
    // ignore
  }
};

/**
 * Deletes the tracker cookies for any category that is now denied - `_fbp`/`_fbc`
 * for marketing, everything starting with `_ga` for analytics. Each name is
 * expired on the plain path and on both host and dot-domain, since the trackers
 * set them on the registrable domain.
 */
export const clearTrackingCookies = (denied: ConsentCategories) => {
  if (typeof document === "undefined") return;

  const names: string[] = [];

  if (denied.marketing) {
    names.push("_fbp", "_fbc");
  }

  if (denied.analytics) {
    document.cookie
      .split(";")
      .map((part) => part.split("=")[0]?.trim() ?? "")
      .filter((name) => name.startsWith("_ga"))
      .forEach((name) => names.push(name));
  }

  if (names.length === 0) return;

  const host = window.location.hostname;
  const dotDomain = `.${host.replace(/^www\./, "")}`;
  const expiry = "Thu, 01 Jan 1970 00:00:00 GMT";

  for (const name of new Set(names)) {
    document.cookie = `${name}=; Path=/; Expires=${expiry}; SameSite=Lax`;
    document.cookie = `${name}=; Path=/; Domain=${host}; Expires=${expiry}; SameSite=Lax`;
    document.cookie = `${name}=; Path=/; Domain=${dotDomain}; Expires=${expiry}; SameSite=Lax`;
  }
};

/**
 * Inline <head> script: sets Consent Mode v2 to all-denied (except the two
 * storages that are always allowed) BEFORE gtag can load, then - if a choice is
 * already saved - immediately updates to it, so a returning visitor keeps their
 * decision and never re-sees the banner. Must be placed before the eid-capture
 * script and before any GA/Pixel tag.
 */
export const CONSENT_DEFAULT_SCRIPT = `
(function () {
  try {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    var raw = null;
    try { raw = window.localStorage.getItem('${CONSENT_STORAGE_KEY}'); } catch (e) {}
    if (raw) {
      var saved = JSON.parse(raw);
      if (saved && saved.version === ${CONSENT_VERSION}) {
        gtag('consent', 'update', {
          analytics_storage: saved.analytics ? 'granted' : 'denied',
          ad_storage: saved.marketing ? 'granted' : 'denied',
          ad_user_data: saved.marketing ? 'granted' : 'denied',
          ad_personalization: saved.marketing ? 'granted' : 'denied'
        });
      }
    }
  } catch (e) {}
})();
`;
