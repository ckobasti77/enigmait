"use client";

import Link from "next/link";
import { AtSign, Mail, Phone, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type SocialLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  external?: boolean;
};

const InstagramIcon = ({ className, ...props }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

const TikTokIcon = ({ className, ...props }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M14 5v9.2a4.3 4.3 0 1 1-3.8-4.27"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M14 5c.55 2.75 2.2 4.35 5 4.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const FacebookIcon = ({ className, ...props }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M14.4 8.2H16V5.5h-2.15c-2.25 0-3.45 1.35-3.45 3.55v1.55H8v2.8h2.4V19h3v-5.6h2.25l.35-2.8h-2.6V9.35c0-.75.32-1.15 1-1.15Z"
      fill="currentColor"
    />
  </svg>
);

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/enigmadigital.studio",
    icon: InstagramIcon,
    external: true,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@enigmadigital.studio",
    icon: TikTokIcon,
    external: true,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/enigmadigital.studio",
    icon: FacebookIcon,
    external: true,
  },
  {
    label: "Email",
    href: "mailto:hello@enigma.digital",
    icon: Mail,
  },
  {
    label: "Telefon",
    href: "tel:+442045771943",
    icon: Phone,
  },
];

const canUseHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function SocialDropdown() {
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
          "group relative flex h-10 w-10 items-center justify-center rounded-full border border-theme bg-card text-theme-primary shadow-theme transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40 sm:h-11 sm:w-11",
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

      <div
        role="menu"
        className={clsx(
          "absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-theme theme-card shadow-theme backdrop-blur-xl transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
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
