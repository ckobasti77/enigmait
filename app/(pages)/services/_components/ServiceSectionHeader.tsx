"use client";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import type { ServiceSectionIntro } from "@/constants/services/types";

/**
 * Kicker + h2 + optional lede - the one header every content section opens
 * with. `typed` renders the title in the homepage's section-title voice (the
 * Timeline pattern: terminal face, letter-by-letter cursor) - one section per
 * page carries it, the rest stay plain so the effect keeps its weight.
 */
export default function ServiceSectionHeader({
  intro,
  typed = false,
}: {
  intro: ServiceSectionIntro;
  typed?: boolean;
}) {
  return (
    <header className="max-w-2xl space-y-4">
      <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
        {intro.kicker}
      </span>
      {typed ? (
        <AutoTypingConsole
          as="h2"
          text={intro.title}
          className="text-left text-2xl md:text-3xl"
        />
      ) : (
        <h2 className="text-2xl leading-snug text-theme-primary md:text-3xl">
          {intro.title}
        </h2>
      )}
      {intro.lede ? (
        <p className="text-base leading-relaxed text-theme-muted">
          {intro.lede}
        </p>
      ) : null}
    </header>
  );
}
