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
import type { CSSProperties } from "react";
import { useCookieConsent } from "./CookieConsentProvider";

type ThemeMode = "light" | "dark";
type ThemeToggleOrigin = { x: number; y: number };
type ThemeToggleOptions = {
  origin?: ThemeToggleOrigin;
  animated?: boolean;
};

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (value: ThemeMode, options?: ThemeToggleOptions) => void;
  toggleTheme: (options?: ThemeToggleOptions) => void;
  isTransitioning: boolean;
};

type ThemeTransitionState = {
  target: ThemeMode;
  origin: {
    xPercent: number;
    yPercent: number;
  };
  committed: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const TRANSITION_DURATION_MS = 820;
const THEME_COOKIE_NAME = "enigma-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark";

const applyDocumentTheme = (value: ThemeMode) => {
  const root = document.documentElement;

  root.classList.toggle("dark", value === "dark");
  root.dataset.theme = value;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!entry) return null;

  return decodeURIComponent(entry.split("=")[1] ?? "");
};

const writeThemeCookie = (value: ThemeMode | null) => {
  if (typeof document === "undefined") return;

  const secureFlag = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";

  if (!value) {
    document.cookie = `${THEME_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
    return;
  }

  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [transition, setTransition] = useState<ThemeTransitionState | null>(null);
  const commitTimeoutRef = useRef<number | null>(null);
  const { consent, hasResponded } = useCookieConsent();
  const canUseFunctionalCookies = hasResponded && consent.functional;
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const clearCommitTimeout = useCallback(() => {
    if (commitTimeoutRef.current !== null) {
      window.clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
  }, []);

  const commitTheme = useCallback((value: ThemeMode) => {
    setThemeState(value);

    if (typeof document !== "undefined") {
      applyDocumentTheme(value);
    }

    if (typeof document !== "undefined") {
      if (canUseFunctionalCookies) {
        writeThemeCookie(value);
      } else {
        writeThemeCookie(null);
      }
    }
  }, [canUseFunctionalCookies]);

  const startAnimatedTransition = useCallback(
    (target: ThemeMode, origin?: ThemeToggleOrigin) => {
      if (transition) return;

      if (typeof window === "undefined") {
        commitTheme(target);
        return;
      }

      const { innerWidth, innerHeight } = window;
      const originX = origin?.x ?? innerWidth / 2;
      const originY = origin?.y ?? innerHeight / 2;
      const xPercent = clamp((originX / innerWidth) * 100, 0, 100);
      const yPercent = clamp((originY / innerHeight) * 100, 0, 100);

      setTransition({
        target,
        origin: { xPercent, yPercent },
        committed: false,
      });
    },
    [transition, commitTheme]
  );

  const setTheme = useCallback(
    (value: ThemeMode, options?: ThemeToggleOptions) => {
      const animated = options?.animated ?? true;

      if (!animated) {
        commitTheme(value);
        return;
      }

      startAnimatedTransition(value, options?.origin);
    },
    [commitTheme, startAnimatedTransition]
  );

  const toggleTheme = useCallback(
    (options?: ThemeToggleOptions) => {
      const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
      const animated = options?.animated ?? true;

      if (!animated) {
        commitTheme(nextTheme);
        return;
      }

      startAnimatedTransition(nextTheme, options?.origin);
    },
    [theme, commitTheme, startAnimatedTransition]
  );

  useEffect(() => {
    if (!transition || typeof window === "undefined") return;

    clearCommitTimeout();

    commitTimeoutRef.current = window.setTimeout(() => {
      commitTheme(transition.target);
      setTransition((prev) => (prev ? { ...prev, committed: true } : prev));
      commitTimeoutRef.current = null;
    }, Math.round(TRANSITION_DURATION_MS * 0.55));

    return () => {
      clearCommitTimeout();
    };
  }, [transition, commitTheme, clearCommitTimeout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentTheme = themeRef.current;

    if (!hasResponded) {
      if (currentTheme !== "dark") {
        commitTheme("dark");
      } else {
        applyDocumentTheme("dark");
        writeThemeCookie(null);
      }
      return;
    }

    if (canUseFunctionalCookies) {
      const storedTheme = getCookieValue(THEME_COOKIE_NAME);

      if (isThemeMode(storedTheme)) {
        if (storedTheme !== currentTheme) {
          commitTheme(storedTheme);
        } else {
          applyDocumentTheme(currentTheme);
        }
        return;
      }
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const nextTheme = prefersDark ? "dark" : "light";

    if (nextTheme !== currentTheme) {
      commitTheme(nextTheme);
    } else if (!canUseFunctionalCookies) {
      writeThemeCookie(null);
    }
  }, [commitTheme, canUseFunctionalCookies, hasResponded]);

  useEffect(() => {
    if (!canUseFunctionalCookies) return;

    writeThemeCookie(theme);
  }, [canUseFunctionalCookies, theme]);

  const handleTransitionEnd = useCallback(() => {
    if (!transition) return;

    clearCommitTimeout();

    if (!transition.committed) {
      commitTheme(transition.target);
    }

    setTransition(null);
  }, [transition, clearCommitTimeout, commitTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isTransitioning: Boolean(transition),
    }),
    [theme, setTheme, toggleTheme, transition]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {transition && (
        <div className="theme-transition">
          <span
            className={`theme-transition__circle theme-transition__circle--${transition.target}`}
            style={{
              "--transition-x": `${transition.origin.xPercent}%`,
              "--transition-y": `${transition.origin.yPercent}%`,
            } as CSSProperties}
            onAnimationEnd={handleTransitionEnd}
          />
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
