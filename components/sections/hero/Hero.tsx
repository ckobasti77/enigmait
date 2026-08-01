import HeroCube from "./HeroCube";
import { HeroContent } from "./HeroContent";

export function Hero() {
  return (
    // Desktop padding is a floor, not navbar clearance: symmetric so
    // `items-center` lands on the true viewport centre, and small enough that
    // the section still fits inside 100svh on short screens - anything taller
    // pushes the content past the fold and there is nothing left to centre.
    // The navbar overlays the top on purpose.
    <section
      aria-label="Enigma Digital hero"
      className="site-gutter relative flex min-h-svh w-full items-center pb-16 pt-28 lg:py-8"
    >
      <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Copy stays first in the DOM; below 1024px `order` lifts the cube above it. */}
        <div className="order-2 lg:order-1">
          <HeroContent />
        </div>
        {/* Lifted with a transform, not margin, so the copy below keeps its
            exact position while the cube sits closer to the navbar. */}
        <HeroCube className="order-1 mx-auto max-w-[min(72vw,20rem)] -translate-y-6 md:max-w-sm lg:order-2 lg:max-w-none lg:translate-y-0" />
      </div>
    </section>
  );
}
