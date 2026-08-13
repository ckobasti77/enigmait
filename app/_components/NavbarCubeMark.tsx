"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import clsx from "clsx";

/**
 * The emblem in the navbar: the hero's 3D cube, drawn small, drawing itself.
 *
 * Loaded on demand, and that is not an optimisation detail - the navbar is in
 * the root layout, so importing it eagerly would put three.js and R3F in the
 * first-load bundle of every page on the site, including the ones with no 3D on
 * them at all. Behind `ssr: false` it arrives after hydration instead, and the
 * pages that never had a WebGL context still ship none of it.
 *
 * Until it does, the emblem PNG holds the frame. Both are the same cube at the
 * same angle (see EMBLEM_AZIMUTH in HeroCubeMark), and the loop opens on the
 * finished mark, so the hand-off is one still cross-fading into another. The
 * canvas is cropped to the model while the PNG carries its own padding, so the
 * 3D mark sits slightly larger - the cross-fade is what covers that step.
 */
const HeroCubeMark = dynamic(
  () => import("@/components/sections/hero/HeroCubeMark"),
  { ssr: false }
);

export default function NavbarCubeMark({ className }: { className?: string }) {
  const [markReady, setMarkReady] = useState(false);
  const handleReady = useCallback(() => setMarkReady(true), []);

  return (
    // The box is fixed at every breakpoint and owned here rather than by either
    // layer, so nothing in the bar moves between the placeholder and the canvas.
    // Sizes and glow are the ones the emblem has always had.
    <span
      className={clsx(
        "relative block h-[40px] w-[40px] shrink-0 drop-shadow-[0_0_16px_rgba(0,183,255,0.26)] sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/logos/logo-emblem.png"
        alt=""
        className={clsx(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
          markReady ? "opacity-0" : "opacity-100"
        )}
        width={1024}
        height={1024}
        priority
        sizes="(min-width: 1024px) 52px, (min-width: 640px) 46px, 40px"
      />
      <span
        className={clsx(
          "absolute inset-0 transition-opacity duration-300",
          markReady ? "opacity-100" : "opacity-0"
        )}
      >
        <HeroCubeMark onReady={handleReady} />
      </span>
    </span>
  );
}
