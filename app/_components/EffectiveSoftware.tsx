// app/_components/EffectiveSoftware.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import CtaButton from "@/components/ui/cta-button";

type Pillar = {
  id: number;
  title: string;
  description: string;
  href: string;
};

const pillars: Pillar[] = [
  {
    id: 1,
    title: "Product discovery i strategija",
    description:
      "Počinjemo radionicama, istraživanjem korisnika i brzom validacijom kako bi svaki sprint bio vezan za korisničku i poslovnu vrednost.",
    href: "/services/ui-ux-design",
  },
  {
    id: 2,
    title: "Dizajn iskustva i interfejsa",
    description:
      "Dizajniramo intuitivna putovanja, komponentne sisteme i motion obrasce koji održavaju proizvod konzistentnim na svim platformama.",
    href: "/services/ui-ux-design",
  },
  {
    id: 3,
    title: "Inženjering i integracije",
    description:
      "Isporučujemo otporan softver kroz modularnu arhitekturu, moderan DevOps i automatizaciju od CI-ja do cloud observability-ja.",
    href: "/services/web-development",
  },
  {
    id: 4,
    title: "Skaliranje i kontinuirano unapređenje",
    description:
      "Merimo ishode, otkrivamo nove prilike i brzo iteriramo kako bi proizvod ostao ispred ciljeva rasta.",
    href: "/services/seo-geo",
  },
];

export default function EffectiveSoftware() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isPointerActive = useRef(false);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollUpdateRef = useRef<() => void>(() => {});
  const rafRef = useRef(0);

  useEffect(() => {
    const setActivePillar = (nextIndex: number) => {
      if (activeIndexRef.current === nextIndex) return;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    const evaluate = () => {
      if (isPointerActive.current) return;
      const elements = itemRefs.current.filter(Boolean) as HTMLElement[];
      if (!elements.length) return;

      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      setActivePillar(closestIndex);
    };

    scrollUpdateRef.current = evaluate;

    const handler = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        evaluate();
      });
    };

    evaluate();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section className="site-gutter relative flex flex-col items-center overflow-hidden theme-section py-24 transition-theme">
      <div
        className="pointer-events-none absolute left-1/2 top-12 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22)_0%,rgba(124,58,237,0.2)_40%,rgba(15,23,42,0)_80%)] blur-[140px]"
        aria-hidden
      />

      <div className="site-container relative grid gap-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <aside className="flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
              Efikasan razvoj softvera
            </span>
            <h2 className="font-aeonik text-4xl font-medium text-theme-primary md:text-[2.8rem]">
              Strategija, dizajn i inženjering kao jedan tim vode vas dalje i brže.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-theme-muted">
              Uključujemo iskusne, višefunkcionalne timove koji preuzimaju odgovornost za ishode od discovery faze do optimizacije. Svaka faza hrani sledeću, smanjuje doradu i održava isporuku vrednosti.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-theme pt-6 text-sm text-theme-muted">
            <BadgeDot color="bg-emerald-400" label="Timovi od discovery faze do isporuke" />
            <BadgeDot color="bg-sky-400" label="Playbook-ovi vođeni ishodima" />
            <BadgeDot color="bg-violet-400" label="Standardi spremni za enterprise" />
          </div>

          <div className="flex flex-wrap gap-3">
            <CtaButton href="/contact">
              Zakažite razgovor
              <ArrowRight className="h-4 w-4" />
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              Pogledajte uspešne priče
            </CtaButton>
          </div>
        </aside>

        <div
          className="relative flex flex-col gap-4"
          onPointerLeave={() => {
            isPointerActive.current = false;
            scrollUpdateRef.current();
          }}
        >
          <div className="pointer-events-none absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0" aria-hidden />

          {pillars.map((pillar, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={pillar.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={clsx(
                  "group relative overflow-hidden rounded-3xl border border-theme theme-card px-6 py-5 card-lift transform-gpu transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme",
                  active
                    ? "shadow-theme"
                    : "opacity-80 hover:opacity-100"
                )}
                onPointerEnter={() => {
                  isPointerActive.current = true;
                  activeIndexRef.current = index;
                  setActiveIndex((current) => (current === index ? current : index));
                }}
                onFocus={() => {
                  isPointerActive.current = true;
                  activeIndexRef.current = index;
                  setActiveIndex((current) => (current === index ? current : index));
                }}
                onBlur={() => {
                  isPointerActive.current = false;
                  scrollUpdateRef.current();
                }}
                tabIndex={0}
                aria-expanded={active}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(168,85,247,0.2))", mixBlendMode: "screen" }}
                />
                <div className="relative flex items-center gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-theme theme-card text-sm font-semibold text-theme-primary">
                    0{pillar.id}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-theme-primary">
                      {pillar.title}
                    </h3>
                    <p
                      className={clsx(
                        "text-sm leading-relaxed text-theme-muted transition-theme",
                        active ? "max-h-40 opacity-100" : "max-h-0 overflow-hidden opacity-0"
                      )}
                    >
                      {pillar.description}
                    </p>
                    <Link
                      href={pillar.href}
                      className={clsx(
                        "inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-transform duration-300",
                        active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      )}
                    >
                      Istražite ovu fazu
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type BadgeProps = {
  color: string;
  label: string;
};

function BadgeDot({ color, label }: BadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx("h-2 w-2 rounded-full", color)} aria-hidden />
      <span>{label}</span>
    </div>
  );
}










