"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { SLIDE_DURATION } from "@/components/sections/disciplines/disciplinesTiming";
import { SETTLE_GRACE_MS } from "@/constants/projectShowcase3D";

/** Napred znači da trenutni snimak odlazi ulevo. */
export type SlideDirection = 1 | -1;

export type Move = { target: number; direction: SlideDirection };

type ProjectIndexOptions = {
  count: number;
  /**
   * Slajd sme da putuje. Van kadra i na skrivenom tabu je `false` i korak sleće
   * odmah - `frameloop` je tada `"never"`, pa nema frejmova u kojima bi se
   * putovalo, a tween bi samo zaključao kontrole na 0.68 s bez ijedne slike.
   */
  animate: boolean;
  /**
   * Čeka se pre nego što slajd krene. Ovde ulaze snimci sledećeg projekta:
   * uređaj koji nema teksturu ostavlja rupu u kućištu, i to baš na skoku na
   * udaljenu tačku - jedini korak koji prefetch ne pokriva.
   */
  prepare?: (index: number) => Promise<unknown>;
};

/**
 * Ceo ulaz slajdera projekata.
 *
 * Potkresana kopija `useDisciplineIndex`, sa dve namerne razlike.
 *
 * SMER JE STANJE, NE IZVOD - to je zadržano doslovno. Lista se vrti, pa 5 -> 0
 * jeste korak NAPRED a 0 -> 5 korak nazad, i nikakvo poređenje dva broja to ne
 * razlikuje od skoka na drugu stranu. Zato onaj ko pomera kaže kojim smerom, a
 * tačka - koja imenuje odredište a ne smer - dobija kraći put.
 *
 * NEMA WHEEL CAPTURE, i to je jedina stvar koja je izbačena a ne prepisana. Na
 * početnoj je ta sekcija jedna od mnogih, pa je otimanje skrola branjivo. Ovde je
 * scena GLAVNI sadržaj strane, odmah ispod heroja: kursor nad njom koji jede
 * skrol je razlika između posetioca koji stigne do završnog CTA i onog koji ne
 * stigne.
 */
export function useProjectIndex({
  count,
  animate,
  prepare,
}: ProjectIndexOptions) {
  const [index, setIndex] = useState(0);
  const [move, setMove] = useState<Move | null>(null);

  const indexRef = useRef(0);
  /** Zaključavanje za trajanje koraka: dva slajda odjednom nemaju zajednički `p`. */
  const busyRef = useRef(false);
  const timerRef = useRef(0);
  const aliveRef = useRef(true);

  /**
   * `animate` i `prepare` se čitaju kroz ref, ne kroz zavisnosti `goTo`.
   * `goTo` visi na listenerima; da mu se identitet menjao sa svakim ulaskom
   * scene u kadar, svaki listener bi se otkačio i zakačio ponovo.
   */
  const animateRef = useRef(animate);
  const prepareRef = useRef(prepare);

  useEffect(() => {
    animateRef.current = animate;
    prepareRef.current = prepare;
  }, [animate, prepare]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const goTo = useCallback(
    (target: number, direction?: SlideDirection) => {
      if (busyRef.current) return;

      const next = ((target % count) + count) % count;
      if (next === indexRef.current) return;

      // Koliko se ide napred da bi se stiglo tamo. Ispod pola liste znači da je
      // napred kraći put; preko toga je brže nazad.
      const forward = (((next - indexRef.current) % count) + count) % count;
      const dir: SlideDirection = direction ?? (forward * 2 <= count ? 1 : -1);

      busyRef.current = true;

      const commit = () => {
        timerRef.current = 0;
        indexRef.current = next;
        // Sinhrono, u jednom prolazu: da između zamene indeksa i gašenja slajda
        // ne postoji frejm u kojem su novi snimci na staroj poziciji.
        flushSync(() => {
          setIndex(next);
          setMove(null);
        });
        busyRef.current = false;
      };

      const begin = () => {
        if (!aliveRef.current) {
          busyRef.current = false;
          return;
        }

        if (!animateRef.current) {
          commit();
          return;
        }

        setMove({ target: next, direction: dir });
        timerRef.current = window.setTimeout(
          commit,
          SLIDE_DURATION * 1000 + SETTLE_GRACE_MS
        );
      };

      const ready = prepareRef.current?.(next);
      if (!ready) {
        begin();
        return;
      }

      // Rešava se u istom mikrotasku kad je projekat već rezidentan, što je
      // slučaj za strelicu i swipe.
      void ready.then(begin, begin);
    },
    [count]
  );

  const step = useCallback(
    (direction: SlideDirection) => goTo(indexRef.current + direction, direction),
    [goTo]
  );

  /**
   * Tastatura na prozoru, sa istim ogradama kao `ServiceCarousel`: strana JESTE
   * slajder, pa strelice rade i kad ništa nije fokusirano - ali nikad u polju za
   * unos, nikad sa modifikatorom, i nikad preko nečega što je već potrošeno.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  return {
    /** Potvrđen projekat. Menja se na settle-u, ne na početku koraka. */
    index,
    /** Ne-null dok slajd traje. Nosi odredište i smer. */
    move,
    /** Tačke prate ODREDIŠTE, da ne kasne ceo slajd za klikom. */
    activeIndex: move ? move.target : index,
    sliding: move !== null,
    goTo,
    step,
  };
}
