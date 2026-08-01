"use client";

import { navLinks } from "@/constants/navLinks";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { LucideIcon } from "lucide-react";

export type DropdownLink = {
  id: number;
  to: string;
  headline: string;
  subheadline: string;
  icon: LucideIcon;
};

export type NavLink = {
  id: number;
  to: string;
  text: string;
  cta?: boolean;
  dropdownLinks?: DropdownLink[];
};

type NavLinksProps = {
  currentDropdown: number;
  setCurrentDropdown: React.Dispatch<React.SetStateAction<number>>;
};

const normalize = (s: string) => s.replace(/^\/+|\/+$/g, "");
const absPath = (s: string) => (s.startsWith("/") ? s : `/${s}`);
const joinPath = (...parts: string[]) =>
  "/" + parts.filter(Boolean).map(normalize).join("/");

const DropdownItem = ({
  href,
  icon: Icon,
  headline,
  subheadline,
}: {
  href: string;
  icon: LucideIcon;
  headline: string;
  subheadline: string;
}) => {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !glowRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.setProperty("--glow-x", `${x}px`);
    glowRef.current.style.setProperty("--glow-y", `${y}px`);
  };

  return (
    <Link
      ref={itemRef}
      href={href}
      style={{ fontFamily: "var(--font-aeonik)" }}
      className="group relative flex items-center gap-4 rounded-xl p-3.5 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Cursor-tracking radial glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(180px circle at var(--glow-x, 50%) var(--glow-y, 50%), var(--glow-accent-1), transparent 70%)",
        }}
      />

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(56, 189, 248, 0.15)",
        }}
      />

      {/* Icon container */}
      <div
        className={clsx(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
          isHovered
            ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
            : "border-theme bg-transparent"
        )}
      >
        <Icon
          className={clsx(
            "h-5 w-5 transition-all duration-300",
            isHovered ? "text-cyan-400 scale-110" : "text-theme-muted"
          )}
        />
      </div>

      {/* Text */}
      <div className="relative z-10">
        <h2
          data-display-font="off"
          className={clsx(
            "text-[15px] font-medium transition-colors duration-300",
            isHovered ? "text-cyan-300" : "text-theme-primary"
          )}
        >
          {headline}
        </h2>
        <p className="text-[13px] font-extralight text-theme-muted transition-colors duration-300">
          {subheadline}
        </p>
      </div>

      {/* Arrow indicator */}
      <div
        className={clsx(
          "relative z-10 ml-auto transition-all duration-300",
          isHovered
            ? "translate-x-0 opacity-100"
            : "-translate-x-2 opacity-0"
        )}
      >
        <ChevronDown className="h-4 w-4 -rotate-90 text-cyan-400/70" />
      </div>
    </Link>
  );
};

const NavLinks = ({ currentDropdown, setCurrentDropdown }: NavLinksProps) => {
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useGSAP(() => {
    gsap.fromTo(
      ".primary-link",
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.25,
        ease: "power3.out",
      }
    );
  }, []);

  useEffect(() => {
    Object.entries(dropdownRefs.current).forEach(([id, el]) => {
      if (!el) return;
      if (Number(id) === currentDropdown) {
        gsap.to(el, {
          height: "auto",
          y: -10,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          display: "block",
        });
      } else {
        gsap.to(el, {
          y: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          display: "none",
        });
      }
    });
  }, [currentDropdown]);

  return (
    <div className="relative hidden items-center gap-8 lg:flex">
      {navLinks.map((link: NavLink) => {
        // Every desktop nav item renders as a plain link — the `cta` flag is
        // only used by the mobile menu's footer button.
        const linkClasses = clsx(
          "primary-link flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70",
          "text-xs font-extralight uppercase tracking-[0.5em] text-theme-muted hover:text-theme-primary"
        );

        return (
          <div
            key={link.id}
            className="relative"
            onMouseEnter={() => link.dropdownLinks && setCurrentDropdown(link.id)}
            onMouseLeave={() => setCurrentDropdown(0)}
          >
            <Link
              style={{ fontFamily: "var(--font-aeonik)" }}
              href={absPath(link.to)}
              className={linkClasses}
            >
              <span>{link.text}</span>
              {link.dropdownLinks && (
                <ChevronDown
                  className={clsx(
                    "ml-1 mt-0.5 h-4 w-4 transition-transform",
                    currentDropdown === link.id && "rotate-180"
                  )}
                />
              )}
            </Link>

            {link.dropdownLinks && (
              <div
                //@ts-expect-error dynamic refs
                ref={(el) => (dropdownRefs.current[link.id] = el)}
                className="absolute top-full right-0 mt-2 hidden w-[720px] overflow-hidden rounded-2xl border border-theme theme-card shadow-theme backdrop-blur-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--card) 0%, var(--card) 60%, var(--accent) 100%)",
                }}
              >
                {/* Top glow bar */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

                <div className="grid w-full grid-cols-2 gap-1.5 p-3">
                  {link.dropdownLinks.map((dropdownLink: DropdownLink) => {
                    const Icon = dropdownLink.icon;
                    const href =
                      "/" + joinPath(link.to, dropdownLink.to).replace(/^\/+/, "");

                    return (
                      <DropdownItem
                        key={dropdownLink.id}
                        href={href}
                        icon={Icon}
                        headline={dropdownLink.headline}
                        subheadline={dropdownLink.subheadline}
                      />
                    );
                  })}
                </div>

                {/* Bottom glow bar */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NavLinks;


