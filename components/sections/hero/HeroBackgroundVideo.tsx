"use client";

import { useEffect, useRef } from "react";

type HeroBackgroundVideoProps = {
  className?: string;
  playbackRate?: number;
};

export function HeroBackgroundVideo({
  className,
  playbackRate = 4.5,
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const syncPlayback = () => {
      video.defaultPlaybackRate = playbackRate;
      video.playbackRate = playbackRate;
      void video.play().catch(() => undefined);
    };

    syncPlayback();
    video.addEventListener("loadedmetadata", syncPlayback);

    return () => {
      video.removeEventListener("loadedmetadata", syncPlayback);
    };
  }, [playbackRate]);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      className={className}
      muted
      playsInline
      poster="/images/hero-background.avif"
      preload="auto"
      src="/hero-background-video.webm"
    />
  );
}
