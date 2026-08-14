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

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_COOKIE_NAME = "enigma-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
// While this class is on <html>, globals.css kills the 0.6s colour fades so the
// area the circle reveals is the full new theme at once, not a mid-fade.
const VT_ACTIVE_CLASS = "theme-vt-active";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark";

const applyDocumentTheme = (value: ThemeMode) => {
  const root = document.documentElement;

  root.classList.toggle("dark", value === "dark");
  root.dataset.theme = value;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The reveal's clock. It lives here because the keyframes that actually run are
// written from here; the var()-driven twin in globals.css restates it as the
// no-JS fallback, and the two have to stay in step.
const REVEAL_MS = 600;
const ORIGIN_STYLE_ID = "theme-vt-origin";
// Distinct from the stylesheet's `theme-circle-reveal`, so the injected rule
// wins by name rather than by racing it in the cascade.
const LIVE_KEYFRAMES = "theme-circle-reveal-live";

// Origin (circle centre) + radius to the farthest viewport corner, baked into a
// <style> as LITERAL px.
//
// The obvious version hands them to the keyframes as `--spot-*` on :root and
// lets them inherit into the pseudo tree. That is the part that broke: the
// ::view-transition tree is not ordinary DOM, and an engine (or a version) that
// does not carry custom properties into it silently drops
// `circle(… at var(--spot-x, 50%) var(--spot-y, 50%))` onto its fallback — the
// middle of the screen. The circle still runs, it just stops coming out of the
// button, which is exactly the symptom. A literal `circle(0px at 1098px 42px)`
// has nothing to inherit and cannot fall back.
//
// `--spot-*` are still written to :root: globals.css keeps the var() keyframes
// as the path for a client that never runs this code.
//
// Returns the disposer — the rule must not outlive the transition, or the next
// toggle from a different button starts from the old origin.
const setTransitionOrigin = (origin?: ThemeToggleOrigin) => {
  const root = document.documentElement;
  // innerWidth/innerHeight, not clientWidth/clientHeight: the snapshot spans
  // the visual viewport including the scrollbar gutter, so the radius has to
  // clear that too or the far corner stays uncovered.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = origin?.x ?? vw / 2;
  const y = origin?.y ?? vh / 2;
  const radius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));

  root.style.setProperty("--spot-x", `${x}px`);
  root.style.setProperty("--spot-y", `${y}px`);
  root.style.setProperty("--spot-r", `${radius}px`);

  const previous = document.getElementById(ORIGIN_STYLE_ID);
  previous?.remove();

  const style = document.createElement("style");
  style.id = ORIGIN_STYLE_ID;
  // `!important` so this beats the stylesheet's `animation` shorthand no matter
  // where the framework ends up inserting globals.css relative to <head>'s tail.
  style.textContent = `@keyframes ${LIVE_KEYFRAMES} {
  from { clip-path: circle(0px at ${x}px ${y}px); }
  to { clip-path: circle(${radius}px at ${x}px ${y}px); }
}
::view-transition-new(root) {
  animation: ${LIVE_KEYFRAMES} ${REVEAL_MS}ms linear forwards !important;
}`;
  document.head.appendChild(style);

  return () => style.remove();
};

type ViewTransitionHandle = {
  finished: Promise<unknown>;
  ready?: Promise<unknown>;
};

// Feature-detected, version-proof wrapper: returns null (without running the
// callback) when the browser has no View Transitions API, so callers fall back
// to an instant swap. Cast through `unknown` to avoid clashing with whichever
// lib.dom typings the toolchain ships.
const startViewTransition = (
  callback: () => void
): ViewTransitionHandle | null => {
  if (typeof document === "undefined") return null;

  const start = (
    document as unknown as {
      startViewTransition?: (cb: () => void) => ViewTransitionHandle;
    }
  ).startViewTransition;

  if (typeof start !== "function") return null;

  return start.call(document, callback);
};

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Synchronous re-entrancy guard: `isTransitioning` only blocks the button
  // after React re-renders, this blocks a second call in the same frame.
  const transitionInFlightRef = useRef(false);
  const { consent, hasResponded } = useCookieConsent();
  const canUseFunctionalCookies = hasResponded && consent.functional;
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const commitTheme = useCallback((value: ThemeMode) => {
    setThemeState(value);

    if (typeof document !== "undefined") {
      applyDocumentTheme(value);

      if (canUseFunctionalCookies) {
        writeThemeCookie(value);
      } else {
        writeThemeCookie(null);
      }
    }
  }, [canUseFunctionalCookies]);

  const changeTheme = useCallback(
    (target: ThemeMode, options?: ThemeToggleOptions) => {
      const animated = options?.animated ?? true;

      // Fallbacks → instant swap (no circle): opted out, SSR, reduced motion,
      // or a reveal already running.
      if (
        !animated ||
        typeof document === "undefined" ||
        prefersReducedMotion() ||
        transitionInFlightRef.current
      ) {
        commitTheme(target);
        return;
      }

      const clearTransitionOrigin = setTransitionOrigin(options?.origin);

      const root = document.documentElement;
      root.classList.add(VT_ACTIVE_CLASS);

      const cleanup = () => {
        clearTransitionOrigin();
        root.classList.remove(VT_ACTIVE_CLASS);
        transitionInFlightRef.current = false;
        setIsTransitioning(false);
      };

      const handle = startViewTransition(() => commitTheme(target));

      // No View Transitions API → instant swap, drop the fade suppression.
      if (!handle) {
        commitTheme(target);
        cleanup();
        return;
      }

      transitionInFlightRef.current = true;
      setIsTransitioning(true);
      // `ready` rejects if the browser aborts the transition (hidden tab,
      // superseded, non-rendered document). We drive nothing off it — swallow
      // so it isn't an unhandled rejection; `finished` still runs cleanup.
      handle.ready?.catch(() => {});
      handle.finished.then(cleanup, cleanup);
    },
    [commitTheme]
  );

  const setTheme = useCallback(
    (value: ThemeMode, options?: ThemeToggleOptions) => {
      changeTheme(value, options);
    },
    [changeTheme]
  );

  const toggleTheme = useCallback(
    (options?: ThemeToggleOptions) => {
      changeTheme(themeRef.current === "dark" ? "light" : "dark", options);
    },
    [changeTheme]
  );

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

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isTransitioning,
    }),
    [theme, setTheme, toggleTheme, isTransitioning]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
