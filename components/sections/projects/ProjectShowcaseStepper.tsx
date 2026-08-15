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
  /**
   * Scena je u kadru. Strelice su `position: fixed`, pa bez ovoga bi lebdele uz
   * ivice ekrana i nad hero-om i nad završnim CTA-om - isti razlog i isti
   * `data-visible` prekidač kao kod karusela usluga.
   */
  visible: boolean;
  className?: string;
};

/**
 * Strelice uz ivice ekrana, tačke pod scenom - gramatika slajdera na
 * `/services`.
 *
 * Strelice su namerno IZVAN toka: kao `position: fixed` na pola visine ekrana
 * one stoje uz levu i desnu ivicu dok je scena u kadru, pa ruka ne mora da se
 * vraća pod scenu za svaki korak. Tačke ostaju dole jer su navigacija po listi, a
 * ne komanda - i one moraju da budu uz sadržaj koji broje.
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
  visible,
  className,
}: ProjectShowcaseStepperProps) {
  return (
    <>
      <button
        type="button"
        className="project-arrow project-arrow--prev"
        aria-label="Prethodni projekat"
        data-visible={visible}
        tabIndex={visible ? 0 : -1}
        onClick={() => onStep(-1)}
      >
        <ArrowCaret direction={-1} />
      </button>
      <button
        type="button"
        className="project-arrow project-arrow--next"
        aria-label="Sledeći projekat"
        data-visible={visible}
        tabIndex={visible ? 0 : -1}
        onClick={() => onStep(1)}
      >
        <ArrowCaret direction={1} />
      </button>

      <div
        className={clsx("project-dots", className)}
        style={DOT_TIMING}
        role="group"
        aria-label="Kontrole slajdera projekata"
      >
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
    </>
  );
}
