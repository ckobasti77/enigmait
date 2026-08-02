"use client";

import { useCallback } from "react";
import { useTheme } from "./ThemeProvider";
import { MoonStar, SunMedium } from "lucide-react";
import clsx from "clsx";

type ThemeSwitcherProps = {
  variant?: "solid" | "ghost";
  className?: string;
};

const ThemeSwitcher = ({ variant = "solid", className }: ThemeSwitcherProps) => {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  const handleToggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const origin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      toggleTheme({ origin, animated: true });
    },
    [toggleTheme]
  );

  const baseClasses =
    "relative group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 sm:h-11 sm:w-11";
  const variantClasses =
    variant === "ghost"
      ? "border border-transparent bg-transparent text-theme-primary transition-all duration-600 hover:border-theme hover:bg-muted"
      : "border border-theme bg-card/70 text-theme-primary transition-all duration-600 hover:bg-muted";

  const iconClasses = "h-[18px] w-[18px] transition-all duration-300";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Promeni temu"
      aria-pressed={theme === "dark"}
      className={clsx(baseClasses, variantClasses, className)}
      disabled={isTransitioning}
    >
      {theme === "dark" ? (
        <SunMedium
          className={clsx(iconClasses, "text-cyan-200 group-hover:text-white")}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      ) : (
        <MoonStar
          className={clsx(iconClasses, "text-theme-muted group-hover:text-theme-primary")}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      )}
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-cyan-400/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
};

export default ThemeSwitcher;
