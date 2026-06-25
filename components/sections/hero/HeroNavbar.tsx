"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { navLinks, socialLinks } from "@/constants/navigation";
import { serviceLinks } from "@/constants/services";

type SocialIconName = (typeof socialLinks)[number]["icon"];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition duration-300 ${isOpen ? "rotate-180 text-white" : "text-white/55"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-5 w-5">
      <span
        className={`absolute left-0 top-1 block h-px w-5 bg-current transition duration-300 ${
          isOpen ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 block h-px w-5 bg-current transition duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute bottom-1 left-0 block h-px w-5 bg-current transition duration-300 ${
          isOpen ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function SocialIcon({ icon }: { icon: SocialIconName }) {
  const sharedProps = {
    "aria-hidden": true,
    className: "h-[18px] w-[18px]",
    fill: "none",
    viewBox: "0 0 24 24",
  };

  if (icon === "tiktok") {
    return (
      <svg {...sharedProps}>
        <path
          d="M14.7 4.3v9.1a4.5 4.5 0 1 1-4.5-4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
        <path
          d="M14.7 4.3c.55 2.8 2.2 4.55 5.05 5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg {...sharedProps}>
        <rect
          height="15.5"
          rx="4.3"
          stroke="currentColor"
          strokeWidth="1.75"
          width="15.5"
          x="4.25"
          y="4.25"
        />
        <circle cx="12" cy="12" r="3.45" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="16.65" cy="7.35" fill="currentColor" r="1" />
      </svg>
    );
  }

  if (icon === "facebook") {
    return (
      <svg {...sharedProps} fill="currentColor">
        <path d="M13.45 20v-7.02h2.36l.36-2.73h-2.72V8.5c0-.79.22-1.33 1.35-1.33h1.45V4.72c-.25-.03-1.11-.1-2.11-.1-2.1 0-3.54 1.28-3.54 3.63v2H8.23v2.73h2.37V20h2.85Z" />
      </svg>
    );
  }

  if (icon === "email") {
    return (
      <svg {...sharedProps}>
        <rect
          height="13.6"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.75"
          width="17.6"
          x="3.2"
          y="5.2"
        />
        <path
          d="m4.7 7.2 7.3 5.45 7.3-5.45"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path
        d="M8.15 5.1 6.2 6.2c-.68.38-.99 1.18-.74 1.92 1.48 4.45 4.97 7.94 9.42 9.42.74.25 1.54-.06 1.92-.74l1.1-1.95c.42-.73.22-1.66-.45-2.16l-2-1.5c-.58-.44-1.38-.43-1.95.03l-.88.7a10 10 0 0 1-2.56-2.56l.7-.88c.46-.57.47-1.37.03-1.95l-1.5-2c-.5-.67-1.43-.87-2.16-.45Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.65"
      />
    </svg>
  );
}

function ServiceMarker() {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#00B7FF_0%,#006DFF_46%,#6B37FF_70%,#8B35FF_100%)] shadow-[0_0_18px_rgba(0,183,255,0.55)]"
    />
  );
}

export function HeroNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 8) {
        setIsVisible(true);
      } else if (delta > 8) {
        setIsVisible(false);
      } else if (delta < -8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!servicesMenuRef.current?.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsServicesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`hero-reveal hero-reveal-navbar hero-reveal-delay-0 fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050816]/64 px-4 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-transform duration-300 ease-out sm:px-7 lg:px-10 xl:px-12 ${
        isVisible || isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto grid min-h-12 w-full max-w-[1690px] grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-4 lg:min-h-[3.25rem]">
        <a aria-label="Enigma IT pocetna" className="col-start-1 inline-flex items-center justify-self-start" href="#">
          <Image
            alt="Enigma IT emblem"
            className="h-auto w-[42px] drop-shadow-[0_0_16px_rgba(0,183,255,0.26)] sm:w-[48px] lg:w-[54px]"
            height={1024}
            priority
            sizes="(min-width: 1024px) 54px, (min-width: 640px) 48px, 42px"
            src="/logos/logo-emblem.png"
            style={{ height: "auto" }}
            width={1024}
          />
        </a>

        <nav
          aria-label="Glavna navigacija"
          className="hidden items-center justify-center gap-9 text-[0.9rem] font-medium text-white/82 lg:col-start-2 lg:flex xl:gap-12"
        >
          <div className="relative" ref={servicesMenuRef}>
            <button
              aria-expanded={isServicesOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 transition duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              onClick={() => setIsServicesOpen((isOpen) => !isOpen)}
              type="button"
            >
              <span>Usluge</span>
              <ChevronIcon isOpen={isServicesOpen} />
            </button>

            <div
              className={`absolute left-1/2 top-full mt-3 w-[270px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[rgba(7,11,24,0.96)] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.46),0_0_50px_rgba(0,109,255,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition duration-200 ${
                isServicesOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              {serviceLinks.map((service) => (
                <a
                  className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.72rem] font-semibold tracking-[0.08em] text-white/72 transition duration-300 hover:bg-white/[0.045] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  href={service.href}
                  key={service.href}
                  onClick={() => setIsServicesOpen(false)}
                >
                  <ServiceMarker />
                  <span>{service.label}</span>
                </a>
              ))}
            </div>
          </div>

          {navLinks.map((item) => (
            <a
              className="rounded-full px-2 py-2 transition duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="col-start-3 hidden items-center justify-self-end gap-2 lg:flex">
          {socialLinks.map((item) => (
            <a
              aria-label={item.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.025] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:border-cyan-300/35 hover:bg-white/[0.055] hover:text-white hover:shadow-[0_0_24px_rgba(0,183,255,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.label}
            >
              <SocialIcon icon={item.icon} />
            </a>
          ))}
        </div>

        <button
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
          className="col-start-3 grid h-10 w-10 place-items-center justify-self-end rounded-full border border-white/10 bg-white/[0.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:border-cyan-300/30 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 lg:hidden"
          onClick={() => {
            setIsMobileMenuOpen((isOpen) => !isOpen);
            setIsServicesOpen(false);
          }}
          type="button"
        >
          <MenuIcon isOpen={isMobileMenuOpen} />
        </button>
      </div>

      <div
        className={`absolute left-4 right-4 top-[calc(100%+0.65rem)] rounded-2xl border border-white/10 bg-[rgba(7,11,24,0.98)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.48),0_0_52px_rgba(0,109,255,0.16),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition duration-300 sm:left-7 sm:right-7 lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobilna navigacija" className="flex flex-col gap-1">
          <a
            className="rounded-xl px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.045] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            href="/usluge"
            onClick={closeMobileMenu}
          >
            Usluge
          </a>

          <div className="grid gap-1 border-l border-white/10 pl-3">
            {serviceLinks.map((service) => (
              <a
                className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-[0.68rem] font-semibold tracking-[0.08em] text-white/68 transition hover:bg-white/[0.045] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                href={service.href}
                key={service.href}
                onClick={closeMobileMenu}
              >
                <ServiceMarker />
                <span>{service.label}</span>
              </a>
            ))}
          </div>

          {navLinks.map((item) => (
            <a
              className="rounded-xl px-3 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.045] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.href}
              onClick={closeMobileMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
          {socialLinks.map((item) => (
            <a
              aria-label={item.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/72 transition duration-300 hover:border-cyan-300/35 hover:bg-white/[0.055] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href={item.href}
              key={item.label}
              onClick={closeMobileMenu}
            >
              <SocialIcon icon={item.icon} />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
