import CtaButton from "@/components/ui/cta-button";

/**
 * One line under the FAQ for the reader it didn't answer: a title and a CTA,
 * side by side. No card, no border - just the gap that already separates every
 * section on the page, because a bordered box here would read as a second FAQ
 * item rather than a way out of the list.
 *
 * The heading opts out of the site's Microgramma display face
 * (`data-display-font="off"`) - it is a label next to a button, not a
 * headline, and Microgramma mis-renders a lowercase "č" mid-word here.
 */
export default function ServiceFaqCta() {
  return (
    <section className="site-gutter py-14 transition-theme sm:py-16">
      <div className="site-container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <h2
          data-display-font="off"
          className="text-xl leading-snug font-aeonik text-theme-primary md:text-2xl"
        >
          Imate specifično pitanje?
        </h2>
        <CtaButton href="/contact" text="Pitajte nas" />
      </div>
    </section>
  );
}
