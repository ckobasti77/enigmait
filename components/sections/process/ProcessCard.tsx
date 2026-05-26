import { ProcessIcon } from "./ProcessIcons";
import type { ProcessStep } from "./processData";

type ProcessCardProps = {
  step: ProcessStep;
  index: number;
};

export function ProcessCard({ step, index }: ProcessCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center rounded-2xl px-5 py-8 text-center transition-all duration-500 ease-out hover:-translate-y-1 sm:px-6 sm:py-9 lg:px-5 lg:py-10"
      style={
        {
          transitionDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
    >
      {/* ── Card background with glass effect ── */}
      <div
        className="absolute inset-0 rounded-2xl border transition-all duration-500"
        style={{
          background: `linear-gradient(180deg, ${step.glowColor.replace(/[\d.]+\)$/, "0.04)")}, rgba(255,255,255,0.015) 40%, rgba(255,255,255,0.01) 100%)`,
          borderColor: `${step.accentColor}18`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      {/* Hover: border brightens */}
      <div
        className="absolute inset-0 rounded-2xl border opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderColor: `${step.accentColor}38`,
        }}
      />

      {/* ── Colored top edge glow line ── */}
      <div
        className="absolute left-4 right-4 top-0 h-px opacity-50 transition-opacity duration-500 group-hover:opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.accentColor}60, transparent)`,
        }}
      />

      {/* ── Hover glow aura behind card ── */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 32px ${step.glowColor.replace(/[\d.]+\)$/, "0.18)")}, 0 0 80px ${step.glowColor.replace(/[\d.]+\)$/, "0.08)")}`,
        }}
      />

      {/* ── Glowing circular icon area ── */}
      <div className="relative z-10 mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full sm:h-[66px] sm:w-[66px] lg:h-[70px] lg:w-[70px]">
        {/* Filled gradient ring behind icon */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-500"
          style={{
            background: `radial-gradient(circle at center, ${step.glowColor.replace(/[\d.]+\)$/, "0.12)")}, transparent 70%)`,
            border: `1px solid ${step.accentColor}22`,
            boxShadow: `0 0 20px ${step.glowColor.replace(/[\d.]+\)$/, "0.25)")}, inset 0 0 16px ${step.glowColor.replace(/[\d.]+\)$/, "0.06)")}`,
          }}
        />
        {/* Hover: intensify glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `0 0 28px ${step.glowColor.replace(/[\d.]+\)$/, "0.40)")}, inset 0 0 20px ${step.glowColor.replace(/[\d.]+\)$/, "0.10)")}`,
          }}
        />
        {/* Outer halo */}
        <div
          className="pointer-events-none absolute inset-[-14px] rounded-full opacity-25 transition-opacity duration-500 group-hover:opacity-45"
          style={{
            background: `radial-gradient(circle at center, ${step.glowColor.replace(/[\d.]+\)$/, "0.20)")}, transparent 65%)`,
          }}
        />
        <ProcessIcon
          className="relative z-10 h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]"
          name={step.icon}
          style={{ color: step.accentColor }}
        />
      </div>

      {/* ── Step number ── */}
      <span
        className="relative z-10 font-accent text-[11px] font-bold tracking-[0.22em] sm:text-xs"
        style={{ color: step.accentColor }}
      >
        {step.number}
      </span>

      {/* ── Step title — always 2 lines, split on "&" ── */}
      <h3 className="relative z-10 mt-2.5 font-accent text-[10.5px] font-extrabold leading-snug tracking-[0.14em] text-[#F5F7FA] sm:text-[11.5px]">
        {step.title.includes("&") ? (
          <>
            {step.title.split("&")[0].trim()}{" "}&amp;
            <br />
            {step.title.split("&")[1].trim()}
          </>
        ) : (
          step.title
        )}
      </h3>

      {/* ── Divider line with accent color ── */}
      <div
        className="relative z-10 mx-auto mt-4 mb-4 h-px w-8 sm:w-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.accentColor}30, transparent)`,
        }}
      />

      {/* ── Description ── */}
      <p className="relative z-10 max-w-[210px] text-[12px] leading-[1.7] text-white/50 sm:text-[12.5px] sm:leading-[1.75]">
        {step.description}
      </p>
    </div>
  );
}
