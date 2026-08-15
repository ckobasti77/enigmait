"use client";

import type { CSSProperties } from "react";
import clsx from "clsx";

import {
  STEPPER_DOT_DURATION,
  STEPPER_DOT_EASE_CSS,
} from "@/components/sections/disciplines/disciplinesTiming";
import { ArrowCaret } from "@/components/ui/arrow-caret";
import { projects } from "@/constants/projects";

/** Ista tabela prelaza kao stepper disciplina, predata stilu kao promenljive. */
const DOT_TIMING = {
  "--project-dot-duration": `${STEPPER_DOT_DURATION}s`,
  "--project-dot-ease": STEPPER_DOT_EASE_CSS,
} as CSSProperties;

type ProjectShowcaseStepperProps = {
  /** Odredište, ne potvrđen indeks - tačka ne sme da kasni ceo slajd za klikom. */
  activeIndex: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  className?: string;
};

/**
 * Strelica, tačke, strelica.
 *
 * Nijedno dugme nije `disabled` i nema pravila za `:disabled` - lista se vrti, pa
 * nijedna strelica nikad ne stiže do kraja.
 *
 * Tačke NEMAJU sopstveno hvatanje strelica na tastaturi, za razliku od steppera
 * disciplina. Ovde `useProjectIndex` sluša strelice na prozoru (strana JESTE
 * slajder), pa bi drugi listener značio dva koraka po jednom pritisku.
 */
export default function ProjectShowcaseStepper({
  activeIndex,
  onStep,
  onSelect,
  className,
}: ProjectShowcaseStepperProps) {
  return (
    <div
      className={clsx("project-stepper", className)}
      style={DOT_TIMING}
      role="group"
      aria-label="Kontrole slajdera projekata"
    >
      <button
        type="button"
        className="project-arrow"
        data-dir="prev"
        aria-label="Prethodni projekat"
        onClick={() => onStep(-1)}
      >
        <ArrowCaret direction={-1} />
      </button>

      <div className="project-dots">
        {projects.map((project, position) => (
          <button
            key={project.id}
            type="button"
            className="project-dot"
            aria-label={project.title}
            aria-current={position === activeIndex ? "true" : undefined}
            onClick={() => onSelect(position)}
          />
        ))}
      </div>

      <button
        type="button"
        className="project-arrow"
        data-dir="next"
        aria-label="Sledeći projekat"
        onClick={() => onStep(1)}
      >
        <ArrowCaret direction={1} />
      </button>
    </div>
  );
}
