export function ProcessBottomPanel() {
  return (
    <div className="relative mt-14 overflow-hidden rounded-2xl px-6 py-10 sm:mt-16 sm:px-10 sm:py-12 lg:mt-20 lg:px-14 lg:py-14">
      {/* Panel background with glass */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.012) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 30% 50%, rgba(0,109,255,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Colored top edge line */}
      <div
        className="absolute left-6 right-6 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,109,255,0.25), rgba(107,55,255,0.25), transparent)",
        }}
      />

      {/* Decorative wave grid SVG on the right */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.05] sm:opacity-[0.07]">
        <svg
          className="h-full w-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 400 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Horizontal wave lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              d={`M0 ${20 + i * 20} Q100 ${12 + i * 20} 200 ${
                20 + i * 20
              } T400 ${20 + i * 20}`}
              key={`h-${i}`}
              stroke="url(#panelWaveGrad)"
              strokeWidth="0.7"
            />
          ))}
          {/* Vertical lines */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`v-${i}`}
              stroke="url(#panelWaveGrad)"
              strokeWidth="0.4"
              x1={28 + i * 28}
              x2={28 + i * 28}
              y1="0"
              y2="200"
            />
          ))}
          <defs>
            <linearGradient
              id="panelWaveGrad"
              x1="0%"
              x2="100%"
              y1="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00B7FF" />
              <stop offset="50%" stopColor="#6B37FF" />
              <stop offset="100%" stopColor="#8B35FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-10 lg:text-left">
        {/* Star emblem */}
        <div className="relative mb-5 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full lg:mb-0 lg:h-16 lg:w-16">
          {/* Circle bg */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0,109,255,0.08), transparent 70%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 0 16px rgba(0,109,255,0.15), inset 0 0 10px rgba(0,109,255,0.04)",
            }}
          />
          <div
            className="relative"
            style={{
              filter: "drop-shadow(0 0 8px rgba(0,183,255,0.35))",
            }}
          >
            <svg
              fill="none"
              height="26"
              viewBox="0 0 24 24"
              width="26"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74L12 2z"
                stroke="url(#starGrad)"
                strokeLinejoin="round"
                strokeWidth="1.3"
              />
              <defs>
                <linearGradient
                  id="starGrad"
                  x1="3"
                  x2="21"
                  y1="2"
                  y2="19"
                >
                  <stop offset="0%" stopColor="#00B7FF" />
                  <stop offset="50%" stopColor="#6B37FF" />
                  <stop offset="100%" stopColor="#8B35FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className="font-display text-[1.1rem] font-bold tracking-wide text-[#F5F7FA] sm:text-[1.25rem] lg:text-[1.35rem]">
            Vaš uspeh je naš cilj.
          </h3>
          <p className="mt-2 max-w-[480px] text-[0.88rem] leading-relaxed text-white/45 sm:text-[0.92rem] lg:text-[0.95rem]">
            Ne gradimo samo proizvode — gradimo partnerstva.
          </p>
        </div>
      </div>
    </div>
  );
}
