// app/_components/ServiceCards.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { navLinks } from "@/constants/navLinks";
import { ExternalLink } from "lucide-react";

const TIMELINE_SENTINEL_ID = "timeline-end-sentinel";

const services =
  navLinks.find((link) => link.text === "Usluge")?.dropdownLinks ?? [];

export default function ServiceCards() {
  const [highlighted, setHighlighted] = useState(true);
  const highlightedRef = useRef(true);
  const rafRef = useRef(0);

  useEffect(() => {
    const sentinel = document.getElementById(TIMELINE_SENTINEL_ID);
    if (!sentinel) {
      return;
    }

    const onScroll = () => {
      const rect = sentinel.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const nextHighlighted = rect.top <= viewportCenter;

      if (highlightedRef.current !== nextHighlighted) {
        highlightedRef.current = nextHighlighted;
        setHighlighted(nextHighlighted);
      }
    };

    const scheduleScrollCheck = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        onScroll();
      });
    };

    onScroll();
    window.addEventListener("scroll", scheduleScrollCheck, { passive: true });
    window.addEventListener("resize", scheduleScrollCheck);
    return () => {
      window.removeEventListener("scroll", scheduleScrollCheck);
      window.removeEventListener("resize", scheduleScrollCheck);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section className="site-gutter relative flex flex-col items-center overflow-hidden theme-section py-24 transition-theme">
      <div
        className={clsx(
          "pointer-events-none absolute left-1/2 top-8 h-[480px] w-[480px] -translate-x-1/2 rounded-full blur-[160px] transition-opacity duration-700",
          highlighted
            ? "opacity-100 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22)_0%,rgba(168,85,247,0.18)_45%,rgba(15,23,42,0)_78%)]"
            : "opacity-40 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.16)_0%,rgba(15,23,42,0)_75%)]"
        )}
        aria-hidden
      />

      <div className="site-container relative space-y-16">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
            Usluge podešene za rast
          </span>
          <h2 className="max-w-3xl font-aeonik text-4xl font-medium text-theme-primary md:text-5xl">
            Izaberite disciplinu, mi uključujemo tim koji vam treba.
          </h2>
          <p className="max-w-2xl text-base text-theme-muted md:text-lg">
            Svaki angažman spaja strategiju, dizajn i inženjering. Pređite preko kartice za fokus partnerstva i kliknite za detalje.
          </p>
        </header>

        <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                href={`/services/${service.to}`}
                className="group relative overflow-hidden rounded-3xl border border-theme theme-card px-6 py-5 card-lift transform-gpu translate-y-0 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(168,85,247,0.18))",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="relative w-full h-full flex items-center justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-theme theme-card">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-theme-primary">
                        {service.headline}
                      </h3>
                      <p className="text-sm text-theme-muted">
                        {service.subheadline}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-theme-muted" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}















