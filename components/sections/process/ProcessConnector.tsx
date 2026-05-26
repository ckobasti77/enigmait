export function ProcessConnector() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 hidden -translate-y-1/2 lg:block">
      {/* Main connector line — dotted style with gradient glow */}
      <div className="relative mx-auto w-[calc(100%-40px)] max-w-[1140px]">
        {/* Solid subtle base line */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,183,255,0.12) 15%, rgba(0,109,255,0.18) 35%, rgba(107,55,255,0.18) 65%, rgba(139,53,255,0.12) 85%, transparent 100%)",
          }}
        />

        {/* Glow halo behind the line */}
        <div
          className="absolute inset-0 -top-1 -bottom-1 blur-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,183,255,0.06) 15%, rgba(0,109,255,0.10) 35%, rgba(107,55,255,0.10) 65%, rgba(139,53,255,0.06) 85%, transparent 100%)",
          }}
        />
      </div>

      {/* Glow diamond markers between cards */}
      <div className="absolute inset-x-0 top-1/2 mx-auto flex w-[calc(100%-40px)] max-w-[1140px] -translate-y-1/2 justify-between px-[calc(20%_-_10px)]">
        {[0, 1, 2, 3].map((i) => {
          const colors = [
            { from: "#00B7FF", to: "#006DFF", glow: "rgba(0,183,255,0.55)" },
            { from: "#006DFF", to: "#6B37FF", glow: "rgba(0,109,255,0.55)" },
            { from: "#6B37FF", to: "#8B35FF", glow: "rgba(107,55,255,0.55)" },
            { from: "#8B35FF", to: "#9B45FF", glow: "rgba(139,53,255,0.55)" },
          ];
          const c = colors[i];
          return (
            <div
              className="relative h-[6px] w-[6px] rotate-45 rounded-[1px]"
              key={i}
              style={{
                background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                boxShadow: `0 0 10px ${c.glow}, 0 0 22px ${c.glow.replace(/[\d.]+\)$/, "0.25)")}`,
                animation: `processDotPulse 3.5s ease-in-out ${i * 0.7}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
