"use client";

import Link from "next/link";
import { AtSign, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { socialLinks } from "@/constants/socialLinks";

const canUseHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

type SocialDropdownProps = {
  /** `ghost` drops the resting border and fill - for use inside the nav island,
   *  where a bordered chip inside a bordered capsule reads as clutter. */
  variant?: "solid" | "ghost";
  /** Which corner the panel unfurls toward, relative to the trigger.
   *  `down-right` sits under a top-bar button; `up-left` sits over a
   *  bottom-left launcher so the panel opens up into the page, not off-screen. */
  menuPlacement?: "down-right" | "up-left";
};

export default function SocialDropdown({
  variant = "solid",
  menuPlacement = "down-right",
}: SocialDropdownProps) {
  const opensUp = menuPlacement === "up-left";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        if (canUseHover()) setOpen(true);
      }}
      onMouseLeave={() => {
        if (canUseHover()) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label="Otvori social linkove"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          "group relative flex h-10 w-10 items-center justify-center rounded-full border text-theme-primary transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 sm:h-11 sm:w-11",
          variant === "ghost"
            ? "border-transparent bg-transparent hover:border-theme hover:bg-muted"
            : "border-theme bg-card",
          open && "border-[var(--border-strong)] bg-muted"
        )}
      >
        <Share2
          className={clsx(
            "h-4 w-4 transition-all duration-300 sm:h-[18px] sm:w-[18px]",
            open ? "text-cyan-300" : "text-theme-primary"
          )}
          strokeWidth={1.7}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-cyan-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>

      {/* Hover bridge. The panel stands a gap (`mb-3`/`mt-3`) off the trigger,
          and that gap is dead space: dragging the pointer across it to reach
          the panel leaves the root and fires `onMouseLeave`, closing the panel
          before it can be clicked. This transparent strip fills exactly that
          gap (h-3 = the 0.75rem margin) as a child of the root, so the pointer
          never leaves the hover target in transit. Only live while open. */}
      <div
        aria-hidden
        className={clsx(
          "absolute h-3 w-[min(20rem,calc(100vw-2rem))]",
          opensUp ? "bottom-full left-0" : "top-full right-0",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      <div
        role="menu"
        className={clsx(
          "absolute w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-theme theme-card shadow-theme backdrop-blur-xl transition-all duration-200",
          opensUp ? "bottom-full left-0 mb-3" : "right-0 top-full mt-3",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : clsx(
                "pointer-events-none opacity-0",
                opensUp ? "translate-y-1" : "-translate-y-1"
              )
        )}
        style={{
          background:
            "linear-gradient(135deg, var(--card) 0%, var(--card) 64%, var(--accent) 100%)",
        }}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="grid gap-1.5 p-3">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-theme bg-transparent text-theme-muted transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-theme-primary transition-colors duration-300 group-hover:text-cyan-300">
                  {item.label}
                </span>
                {item.external ? (
                  <AtSign className="ml-auto h-4 w-4 text-theme-muted opacity-70 transition-colors duration-300 group-hover:text-cyan-300" aria-hidden />
                ) : null}
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                {content}
              </Link>
            );
          })}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
      </div>
    </div>
  );
}
