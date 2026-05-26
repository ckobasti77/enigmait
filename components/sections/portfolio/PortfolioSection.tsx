import { ProjectShowcaseCard } from "./ProjectShowcaseCard";
import { showcaseProjects } from "./portfolioData";

function CTAArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12h14m-5.25-5.25L19 12l-5.25 5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SignalRail() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-20 left-1/2 top-[22rem] hidden w-px -translate-x-1/2 lg:block"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,183,255,0.34),rgba(107,55,255,0.26),transparent)]" />
      <div className="showcase-node-pulse absolute top-[15%] h-2.5 w-2.5 -translate-x-[4.5px] rotate-45 bg-[#00B7FF] shadow-[0_0_22px_rgba(0,183,255,0.65)]" />
      <div className="showcase-node-pulse absolute top-[68%] h-2.5 w-2.5 -translate-x-[4.5px] rotate-45 bg-[#8B35FF] shadow-[0_0_22px_rgba(139,53,255,0.65)] [animation-delay:1.6s]" />
    </div>
  );
}

export function PortfolioSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#02030A] px-4 py-20 text-[#F5F7FA] sm:px-6 sm:py-24 lg:px-8 lg:py-[7.5rem]"
      id="portfolio"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_16%,rgba(0,183,255,0.075),transparent_30%),radial-gradient(circle_at_82%_50%,rgba(139,53,255,0.07),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />
      <div className="absolute left-1/2 top-28 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,109,255,0.06),transparent_68%)] blur-2xl" />

      <SignalRail />

      <div className="relative z-10 mx-auto max-w-[1240px]">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
              <span className="font-accent text-[10px] font-bold tracking-[0.22em] text-white/40">
                PROJEKTI
              </span>
              <span className="text-[10px] text-white/25">*</span>
            </div>

            <h2 className="mt-6 font-display text-[clamp(1.8rem,5vw,3.35rem)] leading-[1.08] tracking-wide text-[#F5F7FA]">
              Poslednji radovi,
              <br />
              prikazani <span className="enigma-gradient-text">precizno.</span>
            </h2>
          </div>

          <div className="lg:justify-self-end">
            <p className="max-w-[560px] text-[0.95rem] leading-7 text-white/55 sm:text-base">
              Teaser za dva najnovija projekta. Za sada koristi placeholder
              slike i tekst, a struktura je spremna za prave case study
              podatke kada portfolio bude popunjen.
            </p>

            <a
              className="group mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.035] px-5 text-sm font-semibold text-white/[0.88] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:border-cyan-300/35 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_34px_rgba(0,183,255,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              href="/portfolio"
            >
              Svi projekti
              <CTAArrowIcon />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 lg:mt-16 lg:gap-7">
          {showcaseProjects.map((project, index) => (
            <ProjectShowcaseCard
              index={index}
              key={project.id}
              project={project}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
