"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import clsx from "clsx";

import { useLanguage } from "@/app/_components/LanguageProvider";
import CtaButton from "@/components/ui/cta-button";
import {
  COPY_CTA_START,
  COPY_ENTER_EASE,
  COPY_LEDE_BLUR,
  COPY_LEDE_DURATION,
  COPY_LEDE_STAGGER_EACH,
  COPY_LEDE_STAGGER_MAX,
  COPY_LEDE_START,
  COPY_LEDE_Y,
  COPY_LEDE_Y_PERCENT,
  COPY_TITLE_BLUR,
  COPY_TITLE_DURATION,
  COPY_TITLE_STAGGER_EACH,
  COPY_TITLE_STAGGER_MAX,
  COPY_TITLE_START,
  COPY_TITLE_Y_PERCENT,
  COPY_WORD_EASE,
} from "@/components/sections/disciplines/disciplinesTiming";
import type { Project } from "@/constants/projects";
import { TEXT_REVEAL } from "@/constants/textRevealConfig";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { restoreWords, splitWords, type Split } from "@/lib/textReveal";

/**
 * Offseti su iz iste tabele kao panel discipline, samo pomereni na nulu.
 *
 * Tamo je `COPY_TITLE_START = 0,30` zato što šest panela stoji u DOM-u i taj
 * razmak pripada IZLAZU onog koji odlazi. Ovde je panel jedan i njegov tekst se
 * menja u mestu, pa izlaza nema - a 300 ms praznine pre prve reči bilo bi čekanje
 * bez ičega na ekranu. Unutrašnji ritam (naslov vodi, rečenica za njim, dugmad
 * poslednja) ostaje netaknut.
 */
const START_OFFSET = COPY_TITLE_START;

/**
 * Prva rečenica sažetka.
 *
 * Panel stoji preko scene i ima mesta za jedan red misli, ne za dva. Seče se na
 * granici rečenice a ne na broju karaktera, pa nema odsečenih reči ni tri tačke.
 * Obe strane ovog skraćenja imaju svoj `[en, sr]` par u `lib/i18n.ts`:
 * `LanguageProvider` prevodi ceo tekstualni čvor, pa skraćena verzija ne pogađa
 * par pune verzije i bez tog para ostala bi na srpskom.
 */
const firstSentence = (text: string) => {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
};

type ProjectShowcaseCopyProps = {
  project: Project;
  className?: string;
};

/**
 * Tekst trenutnog projekta: ime sajta, jedna rečenica, dva dugmeta.
 *
 * ARRIVAL JE SAJTOV REVEAL I IGRA SVAKI PUT. Panel izlazi iz site-wide prolaza
 * sa `data-reveal="off"` i vozi svoj, jer globalni kontroler otkrije element
 * jednom i sa njim je gotov - a ovde je tekst nov na svakom koraku, uključujući i
 * povratak na projekat koji je posetilac već video. Isti splitter, isti ugovor sa
 * `LanguageProvider`: pomeri tekstualni čvor, nosi `data-no-translate` dok je
 * podeljen, vrati ga pre nego što walker prevođenja krene.
 *
 * Svaki `opacity` ispod je čist `opacity`, nikad `autoAlpha` - taj piše
 * `visibility: hidden` i vadi copy iz stabla pristupačnosti.
 *
 * Pun sažetak, opseg posla i adresa svih šest projekata žive u `sr-only` bloku
 * koji strana renderuje na serveru, pa ovo skraćenje ne uzima ništa crawler-u.
 */
export default function ProjectShowcaseCopy({
  project,
  className,
}: ProjectShowcaseCopyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  /** Sve što je trenutno podeljeno, da restore nikad ne mora da traži. */
  const splitsRef = useRef<Array<{ element: HTMLElement; split: Split }>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const { locale } = useLanguage();
  // Jednokratan ulazak, pa Save-Data i slaba baterija ne brišu animaciju - samo
  // OS podešavanje. `.claude/rules` to izdvaja baš za ovaj slučaj.
  const prefersReducedMotion = usePrefersReducedMotion({
    includeDataAndBattery: false,
  });

  /**
   * Prvi projekat ne sme da odigra praznoj sali. Isti okidač koji koristi
   * site-wide kontroler - `enterRatio` u kadar, a ne čim zakači prelom - da se
   * dvoje slože oko toga šta znači "stiglo".
   */
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      {
        rootMargin: `0px 0px -${Math.round(TEXT_REVEAL.enterRatio * 100)}% 0px`,
        threshold: 0,
      }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const title = titleRef.current;
    const lede = ledeRef.current;
    const cta = ctaRef.current;
    if (!title || !lede || !cta) return;

    timelineRef.current?.kill();
    timelineRef.current = null;

    /**
     * Vrati svakoj podeljenoj liniji njen originalni tekstualni čvor. Zove se čim
     * se ulazak završi, a ne kad panel ode: podeljen element nosi
     * `data-no-translate`, a copy koji ostane podeljen je copy do kojeg promena
     * jezika ne može da dođe.
     */
    const release = () => {
      const splits = splitsRef.current;
      if (!splits.length) return;
      splitsRef.current = [];

      for (const { element, split } of splits) {
        restoreWords(element, split);
        gsap.set(element, { clearProps: "opacity,transform,filter,willChange" });
      }
    };

    if (prefersReducedMotion) {
      release();
      gsap.set([title, lede, cta], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([title, lede, cta], { opacity: 0 });

    if (!inView) return;

    const timeline = gsap.timeline({ onComplete: release });

    /**
     * Jedna linija, reč po reč. Pada na pomeranje cele linije kad nema šta da se
     * deli (nema teksta, ili je preko kapice splitter-a) - linija i dalje stiže,
     * samo stiže cela.
     */
    const arrive = (
      element: HTMLElement,
      settings: {
        start: number;
        duration: number;
        blur: number;
        yPercent: number;
        staggerEach: number;
        staggerMax: number;
        fallbackY: number;
      }
    ) => {
      const split = splitWords(element);

      if (!split) {
        timeline.fromTo(
          element,
          { opacity: 0, y: settings.fallbackY },
          {
            opacity: 1,
            y: 0,
            duration: settings.duration,
            ease: COPY_ENTER_EASE,
          },
          settings.start
        );
        return;
      }

      splitsRef.current.push({ element, split });

      gsap.set(element, { opacity: 1 });
      timeline.fromTo(
        split.words,
        {
          opacity: 0,
          filter: `blur(${settings.blur}px)`,
          yPercent: settings.yPercent,
          willChange: "opacity, transform, filter",
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: settings.duration,
          ease: COPY_WORD_EASE,
          // Van redosleda, i razvučeno preko fiksnog ukupnog vremena a ne fiksnog
          // razmaka po reči, pa linija od tri reči i linija od dvadeset završe
          // zajedno - i panel traje isto u oba jezika.
          stagger: {
            amount: Math.min(
              settings.staggerMax,
              settings.staggerEach * Math.max(split.words.length - 1, 0)
            ),
            from: "random",
          },
          clearProps: "filter,willChange,transform",
        },
        settings.start
      );
    };

    arrive(title, {
      start: COPY_TITLE_START - START_OFFSET,
      duration: COPY_TITLE_DURATION,
      blur: COPY_TITLE_BLUR,
      yPercent: COPY_TITLE_Y_PERCENT,
      staggerEach: COPY_TITLE_STAGGER_EACH,
      staggerMax: COPY_TITLE_STAGGER_MAX,
      fallbackY: COPY_LEDE_Y,
    });

    arrive(lede, {
      start: COPY_LEDE_START - START_OFFSET,
      duration: COPY_LEDE_DURATION,
      blur: COPY_LEDE_BLUR,
      yPercent: COPY_LEDE_Y_PERCENT,
      staggerEach: COPY_LEDE_STAGGER_EACH,
      staggerMax: COPY_LEDE_STAGGER_MAX,
      fallbackY: COPY_LEDE_Y,
    });

    // Dugmad ostaju blok: kontrola koja se sklapa od reči čita se kao tekst. Red
    // je i flex kutija, pa bi reči u njoj ionako pokupile `gap` između sebe.
    timeline.fromTo(
      cta,
      { opacity: 0, y: COPY_LEDE_Y },
      {
        opacity: 1,
        y: 0,
        duration: COPY_LEDE_DURATION,
        ease: COPY_ENTER_EASE,
      },
      COPY_CTA_START - START_OFFSET
    );

    timelineRef.current = timeline;
    return () => {
      timeline.kill();
      release();
    };
    // `project.id` je ono što ulazak ponavlja: tekst je nov na svakom koraku.
  }, [project.id, inView, prefersReducedMotion]);

  /**
   * `LanguageProvider` prevodi cele tekstualne čvorove, pa svaka podeljena linija
   * mora da bude cela pre nego što njegov walker krene. React pokreće ovaj efekat
   * deteta pre efekta provajdera - to je jedini razlog zašto ovo radi.
   */
  const localeRef = useRef(locale);
  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;

    const splits = splitsRef.current;
    if (!splits.length) return;

    timelineRef.current?.kill();
    splitsRef.current = [];

    for (const { element, split } of splits) {
      restoreWords(element, split);
      gsap.set(element, { clearProps: "opacity,transform,filter,willChange" });
    }
  }, [locale]);

  return (
    <div
      ref={rootRef}
      // Ovo je ono što sprečava site-wide kontroler da preuzme ovaj tekst, pa
      // panel sme da ga otkrije ponovo na svakom dolasku umesto jednom po
      // učitavanju strane.
      data-reveal="off"
      className={clsx("project-copy", className)}
    >
      {/* `h2` pod `h1`-om iz heroja. Microgramma dolazi sama - nelejerovano
          pravilo u `globals.css` hvata svaki `h2` unutar `.app-shell`. */}
      <h2
        ref={titleRef}
        className="text-2xl leading-tight text-theme-primary md:text-3xl"
      >
        {project.name}
      </h2>

      <p ref={ledeRef} className="text-sm leading-relaxed text-theme-muted md:text-base">
        {firstSentence(project.summary)}
      </p>

      <div
        ref={ctaRef}
        className="flex w-full flex-wrap items-center justify-end gap-5"
      >
        {/* Go link, bez rama: izvor koda je sekundarna radnja i ne sme da se
            takmiči sa CTA-om pored sebe. Renderuje se samo kad `repo` stvarno
            postoji - link koji ne vodi nigde je gori od linka kojeg nema. Adresa
            se dodaje kao `repo` u `constants/projects.ts`. */}
        {project.repo ? (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 font-accent text-xs text-theme-muted transition-colors hover:text-cyan-300"
          >
            Otvori kod
            <span aria-hidden>↗</span>
          </a>
        ) : null}
        {/* Podrazumevana veličina, ne `sm`: h-11 je 44px dodirne zone. */}
        <CtaButton href={project.url} target="_blank" rel="noreferrer">
          Otvori sajt
        </CtaButton>
      </div>
    </div>
  );
}
