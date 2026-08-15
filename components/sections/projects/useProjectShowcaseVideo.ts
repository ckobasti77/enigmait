"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ProjectMedia } from "@/constants/projects";
import { SHOWCASE_VIDEO } from "@/constants/showcaseVideoConfig";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** requestIdleCallback sa setTimeout fallback-om (Safari < 17). */
const onIdle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
};

/**
 * Scroll snimak klijentskog sajta, bez DOM-a oko sebe - da ga uzme `VideoTexture`.
 *
 * Ovo je telo efekta iz `components/ui/showcase-video.tsx`, izvučeno iz
 * komponente i ništa više. Drei-jev `useVideoTexture` bi bio kraći i pogrešan iz
 * tri razloga, po težini: SUSPENDUJE (a suspenzija unutar `<Canvas>` obara ceo
 * `<Suspense>` podstablo - video je nadogradnja preko snimka koji je već tačan i
 * ne sme da ima moć da isprazni ekran), pravi svoj `<video>` i odmah zove
 * `play()` (čime pada svaki gejt ispod), i ponovo suspenduje na svaku promenu
 * `src`-a - a ovde se `src` menja na svakom koraku slajdera.
 *
 * `SHOWCASE_VIDEO` se NE forkuje: to je ista politika za isti klip.
 *
 * `active` je jedina komanda. Slajder ga gasi na početku koraka i pali tek kad se
 * slegne, pa video nikad ne svira dok snimci klize - i pošto se `media` menja
 * tačno na settle-u, zamena izvora i povratak u kadar su isti trenutak.
 */
export function useProjectShowcaseVideo(
  media: ProjectMedia | null,
  active: boolean
) {
  const [video, setVideoNode] = useState<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  /** Šta je trenutno zakačeno, da povratak u kadar ne bude nov `load()`. */
  const attachedRef = useRef<string | null>(null);
  /**
   * Prvi klip je već prošao kroz `load` + idle kapiju.
   *
   * Ta kapija postoji zbog LCP-a - da 2 MB videa ne krene dok se strana još meri -
   * i taj razlog važi tačno jednom. Na svakoj sledećoj zameni bila bi šteta:
   * `requestIdleCallback` ume da čeka do dve sekunde, a efekat se raspada na svaki
   * sledeći korak, pa bi posetilac koji prelistava projekte klip dobio tek kad se
   * potpuno zaustavi. Posle prvog puta kapija se skida.
   */
  const armedOnceRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const setVideo = useCallback((node: HTMLVideoElement | null) => {
    setVideoNode(node);
  }, []);

  // `playing` se čita iz elementa, ne iz JSX handlera: element pravi pozivalac, a
  // ova zastavica vozi uniformu u šejderu i mora da bude tačna i kad se pauza
  // desi iz ovog fajla.
  useEffect(() => {
    if (!video) return;

    const onPlaying = () => setPlaying(true);
    const onStopped = () => setPlaying(false);

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onStopped);
    video.addEventListener("emptied", onStopped);
    video.addEventListener("stalled", onStopped);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onStopped);
      video.removeEventListener("emptied", onStopped);
      video.removeEventListener("stalled", onStopped);
    };
  }, [video]);

  useEffect(() => {
    if (!video || !media || prefersReducedMotion) return;

    if (!active) {
      video.pause();
      return;
    }

    let cancelled = false;
    let loadArmed = !SHOWCASE_VIDEO.deferUntilLoad || armedOnceRef.current;
    let scrollArmed =
      !SHOWCASE_VIDEO.deferUntilScroll ||
      armedOnceRef.current ||
      window.scrollY > 0;
    let cancelIdle = () => {};
    let detachGesture = () => {};
    let detachScroll = () => {};

    const tryPlay = () => {
      const played = video.play();
      if (!played) return;

      played.catch(() => {
        // Autoplay odbijen (iOS Low Power Mode, stroga podešavanja). Snimak
        // ostaje na ekranu i čekamo prvi dodir - jedini trenutak kad nam browser
        // dozvoljava play.
        if (cancelled) return;

        const resume = () => {
          detachGesture();
          if (!cancelled) void video.play().catch(() => {});
        };

        window.addEventListener("pointerdown", resume, { once: true, passive: true });
        window.addEventListener("touchstart", resume, { once: true, passive: true });
        detachGesture = () => {
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("touchstart", resume);
        };
      });
    };

    const resolveSource = () => {
      const useSmall = window.matchMedia(
        `(max-width: ${SHOWCASE_VIDEO.mobileMaxWidth}px)`
      ).matches;
      // WebM prvi, MP4 fallback. Odluka se pravi ovde a ne preko `<source>`
      // elemenata - browser počne da rešava `<source src>` čim ga vidi, a to je
      // tačno ono što izbegavamo.
      const canWebm = video.canPlayType('video/webm; codecs="vp9"') !== "";
      if (canWebm) return useSmall ? media.webmSm : media.webm;
      return useSmall ? media.mp4Sm : media.mp4;
    };

    const start = () => {
      if (cancelled) return;

      const source = resolveSource();
      if (attachedRef.current === source) {
        // Isti klip, samo se vratio u kadar: nastavi, ne učitavaj ponovo.
        tryPlay();
        return;
      }

      attachedRef.current = source;
      armedOnceRef.current = true;
      video.setAttribute("disableremoteplayback", "");
      video.src = source;
      video.load();
      tryPlay();
    };

    const maybeStart = () => {
      if (cancelled || !loadArmed || !scrollArmed) return;
      start();
    };

    const arm = () => {
      if (cancelled) return;
      cancelIdle = onIdle(() => {
        loadArmed = true;
        maybeStart();
      });
    };

    if (loadArmed || document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    if (!scrollArmed) {
      const onScroll = () => {
        scrollArmed = true;
        detachScroll();
        maybeStart();
      };

      window.addEventListener("scroll", onScroll, { once: true, passive: true });
      detachScroll = () => window.removeEventListener("scroll", onScroll);
    }

    return () => {
      cancelled = true;
      cancelIdle();
      detachGesture();
      detachScroll();
      window.removeEventListener("load", arm);
    };
  }, [video, media, active, prefersReducedMotion]);

  /**
   * Poslednji efekat u fajlu i jedini koji sme da ostane bez zavisnosti: gasi
   * element kad komponenta nestane.
   *
   * `src = ""` NIJE zamena za `removeAttribute` - prazan `src` se razrešava u
   * odnosu na URL dokumenta, pa browser povuče samu HTML stranu kao medij. A bez
   * ovoga curi jedan medijski element po promeni rute, dok Chrome-ov limit po
   * tabu ne ubije video na celom sajtu.
   */
  useEffect(() => {
    if (!video) return;
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      attachedRef.current = null;
    };
  }, [video]);

  return { setVideo, video, playing };
}
