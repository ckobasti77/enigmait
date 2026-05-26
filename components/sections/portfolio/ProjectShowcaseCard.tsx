import type { ShowcaseProject } from "./portfolioData";

type ProjectShowcaseCardProps = {
  project: ShowcaseProject;
  index: number;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5"
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

function ProjectVisual({ project }: { project: ShowcaseProject }) {
  const { accent } = project;

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#030712] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:min-h-[310px] lg:min-h-[360px]">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${accent.glow}, transparent 34%), radial-gradient(circle at 80% 70%, rgba(107,55,255,0.16), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008))`,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.18]" />

      <div className="absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/[0.08] bg-white/[0.025] blur-[0.2px]" />

      <div className="absolute left-1/2 top-[52%] w-[78%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative aspect-[1.45] overflow-hidden rounded-[1.1rem] border border-white/[0.11] bg-[#050816]/88 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-white/[0.03] px-4">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/14" />
            <span className="h-2 w-2 rounded-full bg-white/10" />
            <span className="ml-auto h-1.5 w-16 rounded-full bg-white/10" />
          </div>

          <div className="relative h-[calc(100%-2.25rem)] p-4">
            <div
              className="absolute inset-x-4 top-4 h-16 rounded-xl opacity-90"
              style={{
                background: `linear-gradient(135deg, ${accent.primary}35, ${accent.secondary}22)`,
              }}
            />
            <div className="absolute left-4 right-[42%] top-24 h-3 rounded-full bg-white/[0.18]" />
            <div className="absolute left-4 right-[54%] top-[7.75rem] h-2 rounded-full bg-white/10" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div
                  className="h-16 rounded-xl border border-white/[0.06] bg-white/[0.035]"
                  key={item}
                >
                  <div
                    className="mx-3 mt-8 h-1.5 rounded-full"
                    style={{
                      background: item === 1 ? accent.primary : "rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="showcase-scan absolute inset-0 opacity-50" />
        </div>
      </div>

      <div
        className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-white/[0.08]"
        style={{
          boxShadow: `0 0 38px ${accent.glow}, inset 0 0 28px rgba(255,255,255,0.025)`,
        }}
      />
      <div className="absolute bottom-14 left-14 h-3 w-3 rounded-full bg-white/50 shadow-[0_0_22px_rgba(255,255,255,0.55)]" />

      <div className="absolute right-6 top-6 rounded-full border border-white/[0.08] bg-[#02030A]/70 px-3 py-1.5 font-accent text-[10px] font-bold tracking-[0.18em] text-white/45 backdrop-blur-md">
        IMG PLACEHOLDER
      </div>
    </div>
  );
}

export function ProjectShowcaseCard({
  project,
  index,
}: ProjectShowcaseCardProps) {
  const reverse = index % 2 === 1;

  return (
    <article
      className={`group relative grid gap-6 rounded-[1.65rem] border border-white/[0.07] bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-white/[0.13] sm:p-4 lg:grid-cols-[minmax(0,1.16fr)_minmax(330px,0.84fr)] lg:items-stretch lg:gap-7 ${
        reverse ? "lg:grid-cols-[minmax(330px,0.84fr)_minmax(0,1.16fr)]" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.65rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 48px ${project.accent.glow}`,
        }}
      />

      <div className={reverse ? "lg:order-2" : ""}>
        <ProjectVisual project={project} />
      </div>

      <div
        className={`relative z-10 flex flex-col justify-between px-2 pb-3 pt-1 sm:px-3 sm:pb-4 lg:px-2 lg:py-4 ${
          reverse ? "lg:order-1" : ""
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-4">
            <span
              className="font-accent text-[0.7rem] font-bold tracking-[0.2em]"
              style={{ color: project.accent.primary }}
            >
              {project.label}
            </span>
            <span className="font-display text-4xl tracking-wide text-white/[0.08] sm:text-5xl">
              {project.number}
            </span>
          </div>

          <h3 className="mt-6 max-w-[520px] font-display text-[clamp(1.35rem,4.2vw,2.35rem)] leading-[1.08] tracking-wide text-[#F5F7FA]">
            {project.title}
          </h3>

          <p className="mt-4 max-w-[560px] text-[0.92rem] leading-7 text-white/55 sm:text-[0.98rem]">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-accent text-[0.62rem] font-bold tracking-[0.14em] text-white/50"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-2 gap-4">
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-accent text-[0.62rem] font-bold tracking-[0.16em] text-white/35">
                  {stat.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-white/82">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <a
            className="group/link inline-flex items-center gap-2 text-sm font-semibold text-white/[0.86] transition duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            href="/portfolio"
          >
            Pogledaj detalje
            <ArrowIcon />
          </a>
        </div>
      </div>
    </article>
  );
}
