import CtaButton from "@/components/ui/cta-button";

/**
 * The page's closing invitation, for the reader the FAQ didn't answer: a
 * kicker, the headline, one line and the ask - centred, borderless, set off
 * from the FAQ card above by space and a single soft glow rather than by
 * another bordered box (which here would read as one more FAQ item).
 *
 * The heading is a real display `h2` now, in the site's Microgramma face like
 * every other section title - the same face already carries the FAQ header's
 * own Serbian diacritics above it, so there is nothing to opt out of. Its copy,
 * the kicker and the line all arrive word by word on the site-wide reveal; the
 * body is a plain block so the words are not scattered by a flex gap.
 */
export default function ServiceFaqCta() {
  return (
    <section className="site-gutter py-20 transition-theme sm:py-24">
      <div className="site-container">
        <div className="service-faq-cta">
          <span aria-hidden className="service-faq-cta-glow glow-accent" />
          <div className="service-faq-cta-body">
            <span className="block text-xs uppercase tracking-[0.6em] text-cyan-400">
              Sledeći korak
            </span>
            <h2 className="mt-4 text-2xl leading-snug text-theme-primary md:text-3xl">
              Imate specifično pitanje?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-theme-muted">
              Pišite nam i dobićete jasan odgovor.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/contact" text="Pitajte nas" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
