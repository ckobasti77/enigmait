"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import type { ProjectMedia } from "@/constants/projects";
import { SHOWCASE_VIDEO } from "@/constants/showcaseVideoConfig";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** requestIdleCallback sa setTimeout fallback-om (Safari < 17). */
const onIdle = (cb: () => void) => {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;

  if (ric) {
    const id = ric(cb, { timeout: 2000 });
    return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
};

/**
 * Snimak klijentskog sajta u kartici na `/projects`.
 *
 * Ista gramatika kao `video-background.tsx` — `src` se ne kači u JSX, poster je
 * `background-image` na kontejneru, video je bez zvuka, kontrola i fullscreen-a
 * i drži se na `opacity: 0` do prvog dekodovanog frejma. Razlike su dve i obe
 * dolaze iz toga što ovo nije pozadina nego sadržaj:
 *
 *   1. Nema `mix-blend-mode`. Pozadina se blenduje jer je crn klip sa svetlim
 *      talasima i crno mora da izađe; ovde je klip snimak tuđeg sajta i mora da
 *      se vidi tačno onako kako taj sajt izgleda, u obe teme.
 *   2. Kačenje `src`-a čeka i `IntersectionObserver`, ne samo `load` + idle.
 *      Pozadina je jedna i uvek u kadru; ovih je šest i najčešće se vidi jedan.
 *
 * Ram (browser chrome traka, ivica, radijus) je DOM oko ove komponente, ne
 * njena briga — zato ovde nema nijedne dekorativne klase.
 */
export function ShowcaseVideo({
  media,
  className,
}: {
  media: ProjectMedia;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /** Deljeno sa efektom za `visibilitychange` — samo kadar odlučuje ko svira. */
  const inViewRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Kačenje src-a na ulazak u kadar, pauza na izlazak.
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || prefersReducedMotion) return;

    let cancelled = false;
    let attached = false;
    let loadArmed = !SHOWCASE_VIDEO.deferUntilLoad;
    let scrollArmed = !SHOWCASE_VIDEO.deferUntilScroll || window.scrollY > 0;
    let cancelIdle = () => {};
    let detachGesture = () => {};
    let detachScroll = () => {};

    const tryPlay = () => {
      const played = video.play();
      if (!played) return;

      played.catch(() => {
        // Autoplay odbijen (iOS Low Power Mode, stroga podešavanja). Poster
        // ostaje i čekamo prvi dodir korisnika — jedini trenutak kad nam
        // browser dozvoljava play.
        if (cancelled) return;

        const resume = () => {
          detachGesture();
          if (inViewRef.current) void video.play().catch(() => {});
        };

        window.addEventListener("pointerdown", resume, { once: true, passive: true });
        window.addEventListener("touchstart", resume, { once: true, passive: true });
        detachGesture = () => {
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("touchstart", resume);
        };
      });
    };

    const attach = () => {
      attached = true;

      const useSmall = window.matchMedia(`(max-width: ${SHOWCASE_VIDEO.mobileMaxWidth}px)`).matches;
      // WebM prvi, MP4 fallback. Odluka se pravi ovde, a ne preko `<source>`
      // elemenata u JSX-u — `<source src>` u markup-u browser počne da rešava
      // čim ga vidi, a to je tačno ono što ovde izbegavamo.
      const canWebm = video.canPlayType('video/webm; codecs="vp9"') !== "";
      const source = canWebm
        ? useSmall
          ? media.webmSm
          : media.webm
        : useSmall
          ? media.mp4Sm
          : media.mp4;

      video.setAttribute("disableremoteplayback", "");
      video.src = source;
      video.load();
      tryPlay();
    };

    /**
     * Jedina tačka odluke. Tri uslova i svaki ima svoj razlog: kadar (ne
     * plaćamo ono što se ne vidi), `load` + idle (ne takmičimo se sa LCP-om),
     * i prvi skrol (prvi red kartica je delom iznad preloma, pa bi ga sam
     * observer povukao na otvaranju stranice — vidi `showcaseVideoConfig.ts`).
     */
    const maybeStart = () => {
      if (cancelled || !loadArmed || !scrollArmed || !inViewRef.current) return;
      if (attached) tryPlay();
      else attach();
    };

    const arm = () => {
      if (cancelled) return;
      cancelIdle = onIdle(() => {
        loadArmed = true;
        maybeStart();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inViewRef.current = entry.isIntersecting;

          if (entry.isIntersecting) maybeStart();
          else if (SHOWCASE_VIDEO.pauseWhenOffscreen && attached) video.pause();
        }
      },
      { rootMargin: SHOWCASE_VIDEO.rootMargin }
    );

    observer.observe(container);

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
      observer.disconnect();
      cancelIdle();
      detachGesture();
      detachScroll();
      window.removeEventListener("load", arm);
    };
  }, [media, prefersReducedMotion]);

  // Pauza dok je tab u pozadini.
  useEffect(() => {
    if (!SHOWCASE_VIDEO.pauseWhenHidden) return;

    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video || !video.currentSrc) return;

      // Na povratku svira samo kartica koja je i dalje u kadru — observer ne
      // šalje nov event za nešto što se u međuvremenu nije pomerilo.
      if (document.hidden) video.pause();
      else if (inViewRef.current) void video.play().catch(() => {});
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={clsx("showcase-video-layer", className)}
      style={{ "--showcase-video-poster": `url("${media.poster}")` } as CSSProperties}
    >
      <video
        ref={videoRef}
        className="showcase-video-el"
        data-playing={isPlaying ? "true" : undefined}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        disablePictureInPicture
        onPlaying={() => setIsPlaying(true)}
        onEmptied={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default ShowcaseVideo;
