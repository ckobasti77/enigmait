"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { ProcessIcon } from "./ProcessIcons";
import type { ProcessStep } from "./processData";

export type ProcessCardPosition = "left" | "right" | "center";

type ProcessCardProps = {
  step: ProcessStep;
  index: number;
  position: ProcessCardPosition;
};

const widthByPosition: Record<ProcessCardPosition, string> = {
  center: "max-w-[440px] lg:w-[440px]",
  left: "max-w-[440px] lg:w-[440px]",
  right: "max-w-[440px] lg:w-[440px]",
};

const lockedOffsetByPosition: Record<ProcessCardPosition, string> = {
  center: "translate-y-14",
  left: "translate-y-14 lg:-translate-x-8",
  right: "translate-y-14 lg:translate-x-8",
};

function alphaColor(color: string, alpha: string) {
  return color.replace(/[\d.]+\)$/, `${alpha})`);
}

export function ProcessCard({ step, index, position }: ProcessCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setHasOpened(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
          setHasOpened(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: [0.08, 0.12, 0.24],
      },
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, []);

  const transitionDelay = `${Math.min(index * 70, 280)}ms`;

  return (
    <article
      aria-label={`${step.number}. ${step.title}`}
      className={[
        "process-scroll-card group relative w-full transition-[opacity,filter,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
        widthByPosition[position],
        hasOpened
          ? "process-card-unlocked translate-x-0 translate-y-0 scale-100 rotate-0 opacity-100 blur-none"
          : `pointer-events-none opacity-35 blur-[3px] ${lockedOffsetByPosition[position]}`,
      ].join(" ")}
      data-open={hasOpened ? "true" : "false"}
      ref={cardRef}
      style={{ transitionDelay } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -inset-4 rounded-[2rem] transition-opacity duration-700",
          hasOpened ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${alphaColor(
            step.glowColor,
            "0.24",
          )}, transparent 72%)`,
          filter: "blur(18px)",
        }}
      />

      <div
        className="relative flex h-[410px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] shadow-[0_22px_76px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-1 sm:h-[400px] lg:h-[400px]"
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-70"
          style={{
            background: `linear-gradient(145deg, ${alphaColor(
              step.glowColor,
              "0.105",
            )} 0%, rgba(255,255,255,0.018) 34%, rgba(2,3,10,0.22) 100%)`,
          }}
        />

        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 z-20 h-px opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent, ${step.accentColor}88, transparent)`,
          }}
        />

        <div className="process-image relative z-10 h-48 w-full flex-shrink-0 overflow-hidden border-b border-white/[0.07] bg-[#070B18] sm:h-52 lg:h-52">
          <Image
            alt={`Ilustracija za korak ${step.number}: ${step.title}`}
            className={[
              "object-cover transition-[filter,opacity,transform] duration-[1100ms] ease-out",
              hasOpened
                ? "scale-100 opacity-100"
                : "scale-110 opacity-55 grayscale",
            ].join(" ")}
            fill
            sizes="(max-width: 1024px) calc(100vw - 2rem), 440px"
            src={step.imageSrc}
            style={{ objectPosition: "center 38%" }}
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_28%,rgba(2,3,10,0.1)_68%,rgba(2,3,10,0.62)_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at 18% 12%, ${alphaColor(
                step.glowColor,
                "0.34",
              )}, transparent 38%), radial-gradient(circle at 82% 18%, rgba(139,53,255,0.22), transparent 34%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <span
                className="font-accent text-[10px] font-bold uppercase tracking-[0.24em] sm:text-[11px]"
                style={{ color: step.accentColor }}
              >
                Korak {step.number}
              </span>

              <h3 className="mt-3 font-accent text-[0.86rem] font-extrabold leading-snug tracking-[0.12em] text-[#F5F7FA] sm:text-[0.95rem]">
                {step.title}
              </h3>
            </div>

            <div
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04]"
              style={{
                color: step.accentColor,
                boxShadow: `0 0 24px ${alphaColor(step.glowColor, "0.16")}`,
              }}
            >
              <ProcessIcon className="h-5 w-5" name={step.icon} />
            </div>
          </div>

          <p className="mt-4 max-w-[380px] text-[0.84rem] leading-[1.65] text-white/58 sm:text-[0.88rem]">
            {step.description}
          </p>
        </div>

        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 z-30 flex items-center justify-center bg-[#02030A]/68 backdrop-blur-[3px] transition-[opacity,transform] duration-500",
            hasOpened
              ? "pointer-events-none translate-y-[-10px] opacity-0"
              : "translate-y-0 opacity-100",
          ].join(" ")}
        >
          <div
            className="process-lock-pulse flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2"
            style={{
              boxShadow: `0 0 24px ${alphaColor(step.glowColor, "0.24")}`,
            }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke={step.accentColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="11" rx="2" width="16" x="4" y="11" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="font-accent text-[10px] font-bold tracking-[0.22em] text-white/55">
              ZAKLJUCANO
            </span>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="process-unlock-sweep pointer-events-none absolute inset-y-0 -left-1/3 z-40 w-1/3 skew-x-[-16deg] opacity-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${alphaColor(
              step.glowColor,
              "0.42",
            )}, transparent)`,
          }}
        />
      </div>
    </article>
  );
}
