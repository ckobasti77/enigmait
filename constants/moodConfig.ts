export const MOOD_CAMERA = {
  start: [0, 1, 3] as [number, number, number],
  end: [0, 0.85, 0.4] as [number, number, number],
  fov: 45,
};

export const MOOD_THRESHOLDS = {
  /** Overlay starts fading in at this progress */
  overlayStart: 0.82,
  /** Mood is fully engaged at this progress */
  engaged: 1.0,
  /** ScrollTrigger scrub duration (seconds) */
  scrub: 1,
  /** Extra scroll distance for the pin (percentage of viewport) */
  pinDistance: "+=150%",
};
