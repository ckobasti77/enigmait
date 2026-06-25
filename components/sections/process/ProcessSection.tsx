import { processSteps } from "./processData";
import { ProcessCard } from "./ProcessCard";
import { ProcessBottomPanel } from "./ProcessBottomPanel";

const processCardPositions = ["center", "left", "right", "left", "center"] as const;

export function ProcessSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#02030A] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28 xl:py-32"
      id="proces"
    >
      {/* ═══════════════════════════════════════════
          BACKGROUND ATMOSPHERE LAYERS
          ═══════════════════════════════════════════ */}

      {/* 1. Primary nebula glow behind heading — wide, centered, blue-violet */}
      <div
        className="pointer-events-none absolute left-1/2 top-[5%] h-[700px] w-[1100px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at center, rgba(0,109,255,0.09) 0%, rgba(107,55,255,0.05) 35%, transparent 70%)",
        }}
      />

      {/* 2. Intense central glow behind the cards — this is the "lightning" feel */}
      <div
        className="pointer-events-none absolute left-1/2 top-[45%] h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at center, rgba(0,140,255,0.08) 0%, rgba(75,50,255,0.06) 30%, rgba(139,53,255,0.03) 55%, transparent 75%)",
        }}
      />

      {/* 3. Lower bottom glow — purple dominance, supports the arcs */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[550px] w-[1000px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 65% 60% at center bottom, rgba(107,55,255,0.07) 0%, rgba(139,53,255,0.04) 40%, transparent 70%)",
        }}
      />

      {/* 4. Subtle side glow left */}
      <div
        className="pointer-events-none absolute left-0 top-[30%] h-[400px] w-[350px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,183,255,0.03) 0%, transparent 70%)",
        }}
      />

      {/* 5. Subtle side glow right */}
      <div
        className="pointer-events-none absolute right-0 top-[30%] h-[400px] w-[350px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,53,255,0.03) 0%, transparent 70%)",
        }}
      />

      {/* 6. Arc traces near bottom — concentric ellipses */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[350px] overflow-hidden">
        <svg
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          fill="none"
          height="350"
          viewBox="0 0 1400 350"
          width="1400"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Inner arc — strongest */}
          <ellipse
            cx="700"
            cy="380"
            opacity="0.12"
            rx="420"
            ry="170"
            stroke="url(#processArc1)"
            strokeWidth="1.2"
          />
          {/* Middle arc */}
          <ellipse
            cx="700"
            cy="400"
            opacity="0.09"
            rx="540"
            ry="220"
            stroke="url(#processArc2)"
            strokeWidth="1"
          />
          {/* Outer arc — faintest */}
          <ellipse
            cx="700"
            cy="420"
            opacity="0.06"
            rx="660"
            ry="270"
            stroke="url(#processArc3)"
            strokeWidth="0.8"
          />
          {/* Extra wide soft arc */}
          <ellipse
            cx="700"
            cy="440"
            opacity="0.035"
            rx="780"
            ry="320"
            stroke="url(#processArc1)"
            strokeWidth="0.6"
          />
          <defs>
            <linearGradient
              id="processArc1"
              x1="150"
              x2="1250"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="#00B7FF" />
              <stop offset="50%" stopColor="#4B32FF" />
              <stop offset="80%" stopColor="#8B35FF" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient
              id="processArc2"
              x1="100"
              x2="1300"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop offset="15%" stopColor="#006DFF" />
              <stop offset="50%" stopColor="#6B37FF" />
              <stop offset="85%" stopColor="#8B35FF" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient
              id="processArc3"
              x1="50"
              x2="1350"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop offset="10%" stopColor="#00B7FF" />
              <stop offset="50%" stopColor="#6B37FF" />
              <stop offset="90%" stopColor="#9B45FF" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glow halo behind arcs */}
        <div
          className="absolute bottom-0 left-1/2 h-[200px] w-[700px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at center bottom, rgba(75,50,255,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* 7. Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "12%", top: "18%", delay: "0s", size: 2, opacity: 0.2 },
          { left: "82%", top: "12%", delay: "1.5s", size: 1.5, opacity: 0.15 },
          { left: "42%", top: "72%", delay: "2.8s", size: 2, opacity: 0.2 },
          { left: "73%", top: "58%", delay: "0.6s", size: 1.5, opacity: 0.18 },
          { left: "22%", top: "82%", delay: "2s", size: 1.5, opacity: 0.15 },
          { left: "92%", top: "38%", delay: "3.2s", size: 1, opacity: 0.12 },
          { left: "8%", top: "52%", delay: "1.8s", size: 1, opacity: 0.1 },
          { left: "58%", top: "28%", delay: "0.3s", size: 1.5, opacity: 0.15 },
          { left: "35%", top: "45%", delay: "4s", size: 1, opacity: 0.1 },
          { left: "65%", top: "88%", delay: "1s", size: 2, opacity: 0.18 },
        ].map((p, i) => (
          <div
            className="absolute rounded-full"
            key={i}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: `rgba(255,255,255,${p.opacity})`,
              animation: `processParticleFade 5s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-[1240px]">
        {/* ── Header ── */}
        <div className="mx-auto max-w-[660px] text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 sm:mb-7">
            <span className="font-accent text-[9px] font-bold tracking-[0.22em] text-white/40 sm:text-[10px]">
              NAŠ PROCES
            </span>
            <span className="text-[10px] text-white/25">✦</span>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.1rem)] font-bold leading-[1.1] tracking-wide text-[#F5F7FA]">
            Od ideje do
            <br />
            gotovog{" "}
            <span className="enigma-gradient-text">rešenja.</span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-[520px] text-[0.9rem] leading-[1.7] text-white/50 sm:mt-6 sm:text-[0.95rem] sm:leading-[1.75] lg:text-base">
            Pratimo jasan i proveren proces koji obezbeđuje kvalitet,
            transparentnost i rezultate koji prave stvarnu razliku za vaš
            biznis.
          </p>

          {/* Glowing accent line under subtitle */}
          <div className="relative mx-auto mt-7 sm:mt-8">
            <div
              className="mx-auto h-px w-28 sm:w-36 lg:w-44"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,109,255,0.45) 30%, rgba(107,55,255,0.35) 70%, transparent)",
              }}
            />
            {/* Subtle glow beneath the line */}
            <div
              className="mx-auto mt-px h-[2px] w-20 blur-[4px] sm:w-28"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,109,255,0.3), rgba(107,55,255,0.3), transparent)",
              }}
            />
          </div>
        </div>

        {/* ── Scroll-unlock Process Timeline ── */}
        <div className="relative mx-auto mt-14 max-w-6xl sm:mt-16 lg:mt-20">
          <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 z-0 w-px -translate-x-1/2 overflow-hidden bg-gradient-to-b from-transparent via-white/[0.09] to-transparent">
            <div className="process-rail-flow absolute left-0 top-0 h-28 w-px bg-gradient-to-b from-transparent via-[#00B7FF] to-transparent" />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-[760px] -translate-y-1/2 lg:block"
            style={{
              background:
                "radial-gradient(ellipse 48% 58% at center, rgba(0,109,255,0.075) 0%, rgba(107,55,255,0.045) 38%, transparent 72%)",
            }}
          />

          <div className="relative z-10 space-y-7 sm:space-y-9 lg:space-y-12">
            {processSteps.map((step, index) => {
              const position = processCardPositions[index] ?? "center";
              const isLeft = position === "left";
              const isRight = position === "right";

              return (
                <div
                  className={[
                    "relative flex w-full",
                    position === "center"
                      ? "justify-center"
                      : isLeft
                        ? "justify-center lg:justify-start"
                        : "justify-center lg:justify-end",
                  ].join(" ")}
                  key={step.number}
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 z-20 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] border border-white/15 bg-[#02030A] lg:block"
                    style={{
                      boxShadow: `0 0 18px ${step.glowColor.replace(/[\d.]+\)$/, "0.35)")}`,
                    }}
                  >
                    <div
                      className="absolute inset-[3px] rounded-[2px]"
                      style={{
                        background: `linear-gradient(135deg, ${step.accentColor}, rgba(139,53,255,0.95))`,
                      }}
                    />
                  </div>

                  {(isLeft || isRight) && (
                    <div
                      aria-hidden="true"
                      className={[
                        "absolute top-1/2 z-0 hidden h-px -translate-y-1/2 lg:block",
                        isLeft
                          ? "left-[calc(50%_-_5rem)] right-1/2"
                          : "left-1/2 right-[calc(50%_-_5rem)]",
                      ].join(" ")}
                      style={{
                        background: `linear-gradient(90deg, transparent, ${step.accentColor}70, transparent)`,
                        boxShadow: `0 0 18px ${step.glowColor.replace(/[\d.]+\)$/, "0.22)")}`,
                      }}
                    />
                  )}

                  <ProcessCard
                    index={index}
                    position={position}
                    step={step}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA Panel ── */}
        <ProcessBottomPanel />
      </div>
    </section>
  );
}
