"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { BACKGROUND_VIDEO } from "@/constants/backgroundVideoConfig";
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
 * Fiksna video pozadina.
 *
 * Dva sloja u izolovanom stacking kontekstu, odozdo naviše:
 *   1. medija — poster + `<video>`, blenduje se preko boje pozadine sajta
 *   2. vinjeta — spušta ivice da tekst uvek ima kontrast
 *
 * Blend je ono što nosi celu stvar: klip je crn sa svetlim talasima, pa
 * `screen` u tamnoj temi izbaci crno i ostavi samo talase preko `--background`.
 * U svetloj temi je video invertovan (bela sa tamnim tačkama) pa ide `multiply`
 * — isti mehanizam, obrnut smer. Zato nigde nema neprozirnog crnog pravougaonika
 * koji bi razbio svetlu temu.
 */
export function VideoBackground({ className }: { className?: string }) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Odloženo kačenje src-a + autoplay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    let cancelled = false;
    let cancelIdle = () => {};
    let detachGesture = () => {};

    const tryPlay = () => {
      const played = video.play();
      if (!played) return;

      played.catch(() => {
        // Autoplay odbijen (iOS Low Power Mode, stroga podešavanja). Poster
        // ostaje, a mi čekamo prvi dodir korisnika — jedini trenutak kad nam
        // browser dozvoljava play.
        if (cancelled) return;

        const resume = () => {
          detachGesture();
          void video.play().catch(() => {});
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
      if (cancelled) return;

      const useMobile = window.matchMedia(`(max-width: ${BACKGROUND_VIDEO.mobileMaxWidth}px)`).matches;
      video.setAttribute("disableremoteplayback", "");
      video.src = useMobile ? BACKGROUND_VIDEO.sources.mobile : BACKGROUND_VIDEO.sources.desktop;
      video.load();
      tryPlay();
    };

    const start = () => {
      if (cancelled) return;
      cancelIdle = onIdle(attach);
    };

    if (!BACKGROUND_VIDEO.deferUntilLoad || document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      cancelled = true;
      cancelIdle();
      detachGesture();
      window.removeEventListener("load", start);
    };
  }, [prefersReducedMotion]);

  // Pauza dok je tab u pozadini.
  useEffect(() => {
    if (!BACKGROUND_VIDEO.pauseWhenHidden) return;

    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video || !video.currentSrc) return;

      if (document.hidden) video.pause();
      else void video.play().catch(() => {});
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Parallax na pomeraj miša. Jedan rAF koji se gasi čim se kursor smiri.
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || prefersReducedMotion || !BACKGROUND_VIDEO.pointer.enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const { ease, parallax } = BACKGROUND_VIDEO.pointer;
    const { overscan } = BACKGROUND_VIDEO;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let targetX = 0.5;
    let targetY = 0.5;
    let x = 0.5;
    let y = 0.5;
    let frame = 0;

    const render = () => {
      frame = 0;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;

      media.style.transform = `translate3d(${(0.5 - x) * parallax}px, ${(0.5 - y) * parallax}px, 0) scale(${overscan})`;

      if (Math.abs(targetX - x) > 0.0005 || Math.abs(targetY - y) > 0.0005) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const kick = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX / width;
      targetY = event.clientY / height;
      kick();
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      kick();
    };

    kick();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      if (frame) window.cancelAnimationFrame(frame);
      media.style.transform = "";
    };
  }, [prefersReducedMotion]);

  return (
    <div
      aria-hidden
      className={clsx("bg-video-layer", className)}
      style={
        {
          "--bg-video-overscan": BACKGROUND_VIDEO.overscan,
          "--bg-video-poster": `url("${BACKGROUND_VIDEO.poster}")`,
        } as CSSProperties
      }
    >
      <div ref={mediaRef} className="bg-video-media">
        <video
          ref={videoRef}
          className="bg-video-el"
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
      <div className="bg-video-vignette" />
    </div>
  );
}
