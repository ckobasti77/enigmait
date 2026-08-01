"use client";

import { useMood } from "./MoodProvider";
import { ChevronDown } from "lucide-react";

export default function MoodToggle() {
  const { moodActive, setMoodActive } = useMood();

  return (
    <button
      onClick={() => setMoodActive(!moodActive)}
      aria-label="Promeni raspoloženje"
      aria-pressed={moodActive}
      className="group inline-flex items-center gap-2 rounded-full border border-theme px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-theme-primary backdrop-blur-md transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-[0_0_24px_var(--glow-accent-1)] data-[active=true]:border-[var(--glow-accent-1)] data-[active=true]:shadow-[0_0_32px_var(--glow-accent-1)]"
      data-active={moodActive}
    >
      <span>Promeni ton</span>
      <ChevronDown
        className="h-4 w-4 transition-transform duration-300 group-data-[active=true]:rotate-180"
        aria-hidden
      />
    </button>
  );
}
