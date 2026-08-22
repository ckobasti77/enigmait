"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_COOKIE_NAME,
  type Locale,
  isLocale,
  translateText,
} from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "alt", "placeholder", "title"];
const SKIPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "CANVAS",
  "CODE",
  "PRE",
]);

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!entry) return null;

  return decodeURIComponent(entry.split("=")[1] ?? "");
};

const writeLanguageCookie = (locale: Locale | null) => {
  if (typeof document === "undefined") return;

  const secureFlag =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : "";

  if (!locale) {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
    return;
  }

  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(
    locale
  )}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
};

const shouldSkipElement = (element: Element) =>
  SKIPPED_TAGS.has(element.tagName) ||
  Boolean(element.closest("[data-no-translate='true']"));

const translateTextNode = (node: Text, locale: Locale) => {
  const nextValue = translateText(node.nodeValue ?? "", locale);

  if (nextValue !== node.nodeValue) {
    node.nodeValue = nextValue;
  }
};

const translateElementAttributes = (element: Element, locale: Locale) => {
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(attribute);
    if (!current) continue;

    const translated = translateText(current, locale);
    if (translated !== current) {
      element.setAttribute(attribute, translated);
    }
  }
};

const translateNodeTree = (root: Node, locale: Locale) => {
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;
    if (parent && !shouldSkipElement(parent)) {
      translateTextNode(root as Text, locale);
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;
  if (shouldSkipElement(element)) return;

  translateElementAttributes(element, locale);

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const child = node as Element;
          return shouldSkipElement(child)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        }

        const parent = node.parentElement;
        return parent && shouldSkipElement(parent)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current as Text, locale);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(current as Element, locale);
    }
    current = walker.nextNode();
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.lang = locale === "sr" ? "sr-Latn-RS" : "en";
    document.documentElement.dataset.locale = locale;

    translateNodeTree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const parent = mutation.target.parentElement;
          if (parent && !shouldSkipElement(parent)) {
            translateTextNode(mutation.target as Text, locale);
          }
          continue;
        }

        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          if (!shouldSkipElement(mutation.target)) {
            translateElementAttributes(mutation.target, locale);
          }
          continue;
        }

        mutation.addedNodes.forEach((node) => translateNodeTree(node, locale));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, [locale]);

  // Language is a functional preference, persisted unconditionally (Consent
  // Mode's functionality_storage is granted by default). Stored locale wins on
  // mount; otherwise the default (sr) stands.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const storedLocale = getCookieValue(LANGUAGE_COOKIE_NAME);
    if (isLocale(storedLocale) && storedLocale !== localeRef.current) {
      setLocaleState(storedLocale);
    } else {
      writeLanguageCookie(localeRef.current);
    }
  }, []);

  useEffect(() => {
    writeLanguageCookie(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === "sr" ? "en" : "sr"));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
