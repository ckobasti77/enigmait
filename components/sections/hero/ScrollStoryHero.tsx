"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { HeroNavbar } from "./HeroNavbar";
import { scrollStorySlides } from "./scrollStoryData";

type SequenceKey = "desktop" | "mobile";

type FrameSequence = {
  firstFrame: number;
  key: SequenceKey;
  lastFrame: number;
  publicPath: string;
  stopFrames: readonly number[];
};

type CachedFrame = {
  failed?: boolean;
  image?: HTMLImageElement;
  promise?: Promise<HTMLImageElement | null>;
};

const DESKTOP_SEQUENCE: FrameSequence = {
  firstFrame: 1,
  key: "desktop",
  lastFrame: 394,
  publicPath: "/hero-frames-web",
  stopFrames: [91, 242, 242, 394, 394],
};

const MOBILE_SEQUENCE: FrameSequence = {
  firstFrame: 1,
  key: "mobile",
  lastFrame: 334,
  publicPath: "/hero-frames-mobile",
  stopFrames: [91, 183, 183, 334, 334],
};

const INTRO_DURATION_MS = 2050;
const TRANSITION_DURATION_MS = 1050;
const INPUT_LOCK_EXTRA_MS = 300;
const WHEEL_THRESHOLD = 56;
const TOUCH_THRESHOLD = 52;
const STORY_STATE_COUNT = scrollStorySlides.length;
const LAST_STORY_INDEX = STORY_STATE_COUNT - 1;

function NextSlideIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6.5 9 5.5 5.5L17.5 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function NextSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6.5 7.5 5.5 5.5 5.5-5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M6.5 17h11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function frameSrc(sequence: FrameSequence, frame: number) {
  return `${sequence.publicPath}/${String(frame).padStart(3, "0")}_compressed.webp`;
}

function frameCacheKey(sequence: FrameSequence, frame: number) {
  return `${sequence.key}:${frame}`;
}

function jumpWindowTo(top: number) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo(0, top);
  root.style.scrollBehavior = previousScrollBehavior;
}

function isKeyboardEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "a, button, input, textarea, select, summary, [contenteditable='true']",
    ),
  );
}

function useMobileSequence() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return prefersReducedMotion;
}

export function ScrollStoryHero() {
  const isMobileSequence = useMobileSequence();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sequence = isMobileSequence ? MOBILE_SEQUENCE : DESKTOP_SEQUENCE;
  const activeSlide = scrollStorySlides[0];

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef(new Map<string, CachedFrame>());
  const sequenceRef = useRef<FrameSequence>(sequence);
  const activeIndexRef = useRef(0);
  const currentFrameRef = useRef(sequence.firstFrame);
  const paintRequestRef = useRef(0);
  const frameAnimationRef = useRef<number | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const inputLockUntilRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const introCompleteRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isIntroReady, setIsIntroReady] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isStoryActive, setIsStoryActive] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const selectedSlide = scrollStorySlides[activeIndex] ?? activeSlide;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    introCompleteRef.current = isIntroComplete;
  }, [isIntroComplete]);

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  const loadFrameImage = useCallback(
    (frame: number, targetSequence = sequenceRef.current) => {
      const safeFrame = clamp(
        Math.round(frame),
        targetSequence.firstFrame,
        targetSequence.lastFrame,
      );
      const cacheKey = frameCacheKey(targetSequence, safeFrame);
      const cached = imageCacheRef.current.get(cacheKey);

      if (cached?.image) {
        return Promise.resolve(cached.image);
      }

      if (cached?.failed) {
        return Promise.resolve(null);
      }

      if (cached?.promise) {
        return cached.promise;
      }

      const promise = new Promise<HTMLImageElement | null>((resolve) => {
        const image = new window.Image();

        image.decoding = "async";
        image.onload = () => {
          imageCacheRef.current.set(cacheKey, { image });
          resolve(image);
        };
        image.onerror = () => {
          imageCacheRef.current.set(cacheKey, { failed: true });
          resolve(null);
        };
        image.src = frameSrc(targetSequence, safeFrame);
      });

      imageCacheRef.current.set(cacheKey, { promise });

      return promise;
    },
    [],
  );

  const paintLoadedFrame = useCallback(
    (image: HTMLImageElement, frame: number, targetSequence: FrameSequence) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;

      if (!context || cssWidth <= 0 || cssHeight <= 0) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(cssWidth * dpr);
      const pixelHeight = Math.round(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.fillStyle = "#02030A";
      context.fillRect(0, 0, cssWidth, cssHeight);

      const scale = cssHeight / image.naturalHeight;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = cssHeight;
      const drawX = (cssWidth - drawWidth) / 2;
      const drawY = 0;
      const sideGap = Math.max(0, drawX);

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      canvas.dataset.frame = String(frame);
      canvas.dataset.sequence = targetSequence.key;
      sectionRef.current?.style.setProperty(
        "--scroll-story-side-gap",
        `${sideGap}px`,
      );
    },
    [],
  );

  const drawFrame = useCallback(
    (frame: number, targetSequence = sequenceRef.current) => {
      const safeFrame = clamp(
        Math.round(frame),
        targetSequence.firstFrame,
        targetSequence.lastFrame,
      );
      const paintRequest = paintRequestRef.current + 1;

      paintRequestRef.current = paintRequest;
      currentFrameRef.current = safeFrame;

      void loadFrameImage(safeFrame, targetSequence).then((image) => {
        if (
          !image ||
          paintRequest !== paintRequestRef.current ||
          sequenceRef.current.key !== targetSequence.key
        ) {
          return;
        }

        paintLoadedFrame(image, safeFrame, targetSequence);
      });
    },
    [loadFrameImage, paintLoadedFrame],
  );

  const primeRange = useCallback(
    (from: number, to: number, targetSequence = sequenceRef.current) => {
      const start = clamp(
        Math.round(from),
        targetSequence.firstFrame,
        targetSequence.lastFrame,
      );
      const end = clamp(
        Math.round(to),
        targetSequence.firstFrame,
        targetSequence.lastFrame,
      );
      const direction = start <= end ? 1 : -1;

      for (
        let frame = start;
        direction > 0 ? frame <= end : frame >= end;
        frame += direction
      ) {
        void loadFrameImage(frame, targetSequence);
      }
    },
    [loadFrameImage],
  );

  const playToFrame = useCallback(
    (targetFrame: number, duration: number) => {
      if (frameAnimationRef.current !== null) {
        cancelAnimationFrame(frameAnimationRef.current);
        frameAnimationRef.current = null;
      }

      const targetSequence = sequenceRef.current;
      const startFrame = currentFrameRef.current;
      const safeTarget = clamp(
        Math.round(targetFrame),
        targetSequence.firstFrame,
        targetSequence.lastFrame,
      );

      primeRange(startFrame, safeTarget, targetSequence);

      return new Promise<void>((resolve) => {
        if (
          prefersReducedMotionRef.current ||
          duration <= 0 ||
          startFrame === safeTarget
        ) {
          drawFrame(safeTarget, targetSequence);
          resolve();
          return;
        }

        const startedAt = performance.now();

        const tick = (now: number) => {
          const progress = clamp((now - startedAt) / duration, 0, 1);
          const eased = easeOutCubic(progress);
          const frame = Math.round(startFrame + (safeTarget - startFrame) * eased);

          drawFrame(frame, targetSequence);

          if (progress < 1) {
            frameAnimationRef.current = requestAnimationFrame(tick);
            return;
          }

          drawFrame(safeTarget, targetSequence);
          frameAnimationRef.current = null;
          resolve();
        };

        frameAnimationRef.current = requestAnimationFrame(tick);
      });
    },
    [drawFrame, primeRange],
  );

  const smoothScrollTo = useCallback((targetY: number, duration: number) => {
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    return new Promise<void>((resolve) => {
      const startY = window.scrollY;
      const distance = targetY - startY;

      if (prefersReducedMotionRef.current || duration <= 0 || Math.abs(distance) < 1) {
        jumpWindowTo(targetY);
        resolve();
        return;
      }

      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = clamp((now - startedAt) / duration, 0, 1);
        const eased = easeOutCubic(progress);

        jumpWindowTo(startY + distance * eased);

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(tick);
          return;
        }

        jumpWindowTo(targetY);
        scrollAnimationRef.current = null;
        resolve();
      };

      scrollAnimationRef.current = requestAnimationFrame(tick);
    });
  }, []);

  const navigateToIndex = useCallback(
    (targetIndex: number) => {
      if (!introCompleteRef.current || isAnimatingRef.current) {
        return;
      }

      const nextIndex = clamp(Math.round(targetIndex), 0, LAST_STORY_INDEX);
      const currentIndex = activeIndexRef.current;

      if (nextIndex === currentIndex) {
        return;
      }

      const targetSequence = sequenceRef.current;
      const targetFrame = targetSequence.stopFrames[nextIndex] ?? targetSequence.stopFrames[0];
      const section = sectionRef.current;
      const sectionTop = section
        ? section.getBoundingClientRect().top + window.scrollY
        : 0;
      const targetY = sectionTop + nextIndex * window.innerHeight;
      const duration = prefersReducedMotionRef.current ? 0 : TRANSITION_DURATION_MS;

      isAnimatingRef.current = true;
      inputLockUntilRef.current =
        performance.now() + duration + INPUT_LOCK_EXTRA_MS;
      wheelAccumRef.current = 0;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setIsTransitioning(true);

      window.dispatchEvent(
        new CustomEvent("scroll-story-transition-start", {
          detail: { from: currentIndex, to: nextIndex },
        }),
      );

      void Promise.all([
        playToFrame(targetFrame, duration),
        smoothScrollTo(targetY, duration),
      ]).finally(() => {
        const nextFrame =
          targetSequence.stopFrames[
            clamp(nextIndex + 1, 0, LAST_STORY_INDEX)
          ] ?? targetFrame;

        isAnimatingRef.current = false;
        setIsTransitioning(false);
        primeRange(targetFrame, nextFrame, targetSequence);
        window.dispatchEvent(
          new CustomEvent("scroll-story-transition-end", {
            detail: { activeIndex: nextIndex },
          }),
        );
      });
    },
    [playToFrame, primeRange, smoothScrollTo],
  );

  const navigateToNextSection = useCallback(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const targetY = sectionTop + section.offsetHeight;

    inputLockUntilRef.current = performance.now() + 800;
    wheelAccumRef.current = 0;
    void smoothScrollTo(targetY, prefersReducedMotionRef.current ? 0 : 700);
  }, [smoothScrollTo]);

  const shouldTrapInput = useCallback((direction: number) => {
    const section = sectionRef.current;

    if (!section || direction === 0) {
      return false;
    }

    const rect = section.getBoundingClientRect();
    const isPinnedRange = rect.top <= 2 && rect.bottom >= window.innerHeight - 2;

    if (!isPinnedRange) {
      return false;
    }

    if (!introCompleteRef.current) {
      return true;
    }

    const currentIndex = activeIndexRef.current;

    if (direction > 0 && currentIndex >= LAST_STORY_INDEX) {
      return false;
    }

    if (direction < 0 && currentIndex <= 0) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    sequenceRef.current = sequence;

    if (introCompleteRef.current) {
      drawFrame(sequence.stopFrames[activeIndexRef.current] ?? sequence.stopFrames[0], sequence);
    }
  }, [drawFrame, sequence]);

  useEffect(() => {
    let cancelled = false;
    let introTimeout: number | null = null;
    let revealFrame: number | null = null;
    let completeFrame: number | null = null;

    sequenceRef.current = sequence;
    revealFrame = requestAnimationFrame(() => {
      if (!cancelled) {
        setIsIntroReady(true);
      }
    });

    if (introCompleteRef.current) {
      drawFrame(sequence.stopFrames[activeIndexRef.current] ?? sequence.stopFrames[0], sequence);
      return () => {
        cancelled = true;
        if (revealFrame !== null) {
          cancelAnimationFrame(revealFrame);
        }
      };
    }

    const introTarget = sequence.stopFrames[0];

    if (prefersReducedMotion) {
      drawFrame(introTarget, sequence);
      introCompleteRef.current = true;
      completeFrame = requestAnimationFrame(() => {
        if (!cancelled) {
          setIsIntroComplete(true);
        }
      });
      return () => {
        cancelled = true;
        if (revealFrame !== null) {
          cancelAnimationFrame(revealFrame);
        }
        if (completeFrame !== null) {
          cancelAnimationFrame(completeFrame);
        }
      };
    }

    drawFrame(sequence.firstFrame, sequence);
    primeRange(sequence.firstFrame, introTarget, sequence);

    introTimeout = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      void playToFrame(introTarget, INTRO_DURATION_MS).then(() => {
        if (cancelled) {
          return;
        }

        introCompleteRef.current = true;
        setIsIntroComplete(true);
        primeRange(introTarget, sequence.stopFrames[1] ?? introTarget, sequence);
      });
    }, 140);

    return () => {
      cancelled = true;

      if (introTimeout !== null) {
        window.clearTimeout(introTimeout);
      }
      if (revealFrame !== null) {
        cancelAnimationFrame(revealFrame);
      }
      if (completeFrame !== null) {
        cancelAnimationFrame(completeFrame);
      }
    };
  }, [
    drawFrame,
    playToFrame,
    prefersReducedMotion,
    primeRange,
    sequence,
  ]);

  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameRef.current, sequenceRef.current);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawFrame]);

  useEffect(() => {
    let raf: number | null = null;

    const updateFromScroll = () => {
      raf = null;

      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const active = rect.top <= 4 && rect.bottom >= window.innerHeight - 4;

      setIsStoryActive((current) => (current === active ? current : active));

      if (!introCompleteRef.current || isAnimatingRef.current || !active) {
        return;
      }

      const sectionTop = rect.top + window.scrollY;
      const rawIndex = (window.scrollY - sectionTop) / window.innerHeight;
      const nearestIndex = clamp(Math.round(rawIndex), 0, LAST_STORY_INDEX);

      if (nearestIndex !== activeIndexRef.current) {
        const targetFrame =
          sequenceRef.current.stopFrames[nearestIndex] ??
          sequenceRef.current.stopFrames[0];

        activeIndexRef.current = nearestIndex;
        setActiveIndex(nearestIndex);
        drawFrame(targetFrame, sequenceRef.current);
      }
    };

    const scheduleUpdate = () => {
      if (raf !== null) {
        return;
      }

      raf = requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [drawFrame]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY);

      if (!shouldTrapInput(direction)) {
        wheelAccumRef.current = 0;
        return;
      }

      event.preventDefault();

      if (!introCompleteRef.current) {
        return;
      }

      const now = performance.now();

      if (isAnimatingRef.current || now < inputLockUntilRef.current) {
        return;
      }

      const previousAccum = wheelAccumRef.current;

      if (Math.sign(previousAccum) !== direction) {
        wheelAccumRef.current = 0;
      }

      wheelAccumRef.current += event.deltaY;

      if (Math.abs(wheelAccumRef.current) < WHEEL_THRESHOLD) {
        return;
      }

      navigateToIndex(activeIndexRef.current + direction);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current === null) {
        return;
      }

      const currentY = event.touches[0]?.clientY;

      if (typeof currentY !== "number") {
        return;
      }

      const delta = touchStartYRef.current - currentY;
      const direction = Math.sign(delta);

      if (Math.abs(delta) > 8 && shouldTrapInput(direction)) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartYRef.current === null || !introCompleteRef.current) {
        touchStartYRef.current = null;
        return;
      }

      const endY = event.changedTouches[0]?.clientY;

      if (typeof endY !== "number") {
        touchStartYRef.current = null;
        return;
      }

      const delta = touchStartYRef.current - endY;
      const direction = Math.sign(delta);

      touchStartYRef.current = null;

      if (Math.abs(delta) < TOUCH_THRESHOLD || !shouldTrapInput(direction)) {
        return;
      }

      navigateToIndex(activeIndexRef.current + direction);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isKeyboardEditableTarget(event.target)) {
        return;
      }

      const downKeys = new Set(["ArrowDown", "PageDown", " "]);
      const upKeys = new Set(["ArrowUp", "PageUp"]);
      const direction = downKeys.has(event.key) ? 1 : upKeys.has(event.key) ? -1 : 0;

      if (!shouldTrapInput(direction)) {
        return;
      }

      event.preventDefault();

      if (!introCompleteRef.current) {
        return;
      }

      navigateToIndex(activeIndexRef.current + direction);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigateToIndex, shouldTrapInput]);

  useEffect(() => {
    return () => {
      if (frameAnimationRef.current !== null) {
        cancelAnimationFrame(frameAnimationRef.current);
      }

      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Enigma IT scrollytelling hero"
      className="scroll-story-hero relative isolate h-[500svh] w-full bg-[#02030A] text-[#F5F7FA]"
      data-scroll-story-chapter={selectedSlide.id}
      data-scroll-story-frame-group={selectedSlide.frameGroup}
      data-scroll-story-hero
      data-scroll-story-stop={activeIndex}
      style={{ "--scroll-story-side-gap": "0px" } as CSSProperties}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="scroll-story-canvas absolute inset-0 z-0 h-full w-full"
          data-frame={sequence.firstFrame}
          data-sequence={sequence.key}
        />

        <div aria-hidden="true" className="scroll-story-edge-fade absolute inset-0 z-[1]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_58%_42%,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_38%,rgba(2,3,10,0.42)_78%),linear-gradient(90deg,rgba(2,3,10,0.82)_0%,rgba(2,3,10,0.34)_32%,rgba(2,3,10,0.12)_58%,rgba(2,3,10,0.62)_100%),linear-gradient(0deg,rgba(2,3,10,0.76)_0%,rgba(2,3,10,0.12)_42%,rgba(2,3,10,0.28)_100%)]"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1690px] flex-col px-4 sm:px-7 lg:px-10 xl:px-12">
          <HeroNavbar forceVisible={isStoryActive} />

          <div className="flex min-h-0 flex-1 items-end justify-center pb-20 pt-24 sm:pb-24 sm:pt-28 lg:pb-20 xl:pb-24">
            <div
              className={`scroll-story-intro-reveal w-full max-w-[940px] text-center transition duration-700 ease-out ${
                isIntroReady
                  ? "translate-y-0 opacity-100 blur-0"
                  : "translate-y-4 opacity-0 blur-sm"
              }`}
            >
              <div
                key={selectedSlide.id}
                className="scroll-story-copy mx-auto px-3 py-2"
                data-transitioning={isTransitioning}
              >
                <h1 className="mx-auto max-w-[900px] font-display text-[clamp(1.65rem,7vw,2.65rem)] leading-[1.08] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.86)] sm:text-[clamp(2rem,5vw,3.55rem)] lg:text-[clamp(2.35rem,3.1vw,4rem)]">
                  {selectedSlide.title}
                </h1>

                <div className="mx-auto mt-4 grid max-w-[820px] gap-2 text-[0.95rem] leading-7 text-white/78 drop-shadow-[0_10px_28px_rgba(0,0,0,0.88)] sm:text-[1.08rem] sm:leading-8 lg:text-[1.16rem]">
                  {selectedSlide.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            aria-label="Scrollytelling kontrole"
            className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-5 sm:bottom-7"
          >
            <button
              aria-label="Sledeći slajd"
              className="grid h-11 w-11 place-items-center text-white/88 drop-shadow-[0_8px_22px_rgba(0,0,0,0.82)] transition duration-300 hover:translate-x-0.5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:pointer-events-none disabled:opacity-32"
              disabled={!isIntroComplete || isTransitioning || activeIndex >= LAST_STORY_INDEX}
              onClick={() => navigateToIndex(activeIndex + 1)}
              type="button"
            >
              <NextSlideIcon />
            </button>
            <button
              aria-label="Sledeća sekcija"
              className="grid h-11 w-11 place-items-center text-white/88 drop-shadow-[0_8px_22px_rgba(0,0,0,0.82)] transition duration-300 hover:translate-y-0.5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:pointer-events-none disabled:opacity-32"
              disabled={!isIntroComplete || isTransitioning}
              onClick={navigateToNextSection}
              type="button"
            >
              <NextSectionIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
