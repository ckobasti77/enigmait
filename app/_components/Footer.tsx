import Link from "next/link";
import CtaButton from "@/components/ui/cta-button";
import { navLinks } from "@/constants/navLinks";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const services = navLinks.find((link) => link.dropdownLinks)?.dropdownLinks ?? [];
const primaryLinks = navLinks.filter((link) => !link.dropdownLinks && !link.cta);

const CHIP =
  "group relative flex h-10 w-10 items-center justify-center rounded-full border border-theme bg-card text-theme-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30";

const TOOLTIP =
  // Anchored to the chip's left edge, not centred: the first chip sits on the
  // gutter, and a centred tooltip runs off the viewport at mobile widths.
  "pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-0 whitespace-nowrap rounded-full border border-theme bg-card px-2.5 py-1 text-[11px] font-medium text-theme-primary opacity-0 shadow-theme transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100";

export default function Footer() {
  return (
    <footer className="site-gutter theme-section border-t border-theme py-10 transition-theme md:py-12">
      <div className="site-container flex flex-col gap-9">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.6fr)_minmax(0,0.85fr)] lg:gap-12">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-cyan-400">
              Enigma Digital
            </span>
            <h2 className="max-w-sm font-aeonik text-xl font-medium leading-snug text-theme-primary md:text-2xl">
              Iskustva koja definišu brend.
            </h2>

            <CtaButton href="/contact" size="sm">
              Pokreni projekat
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </CtaButton>

            {/* Kontakt kao kontrole, ne kao kartice: chrome, pa izlazi iz
                site-wide reveal-a - tooltip mora biti čitljiv istog trena. */}
            <div className="flex items-center gap-2 pt-1" data-reveal="off">
              <a href="tel:+442045771943" className={CHIP} aria-label="Pozovi +44 20 4577 1943">
                <Phone className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                <span className={TOOLTIP}>+44 20 4577 1943</span>
              </a>
              <a href="mailto:hello@enigma.digital" className={CHIP} aria-label="Pošalji e-poštu na hello@enigma.digital">
                <Mail className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                <span className={TOOLTIP}>hello@enigma.digital</span>
              </a>
              {/* Nema šta da se aktivira - pa nema ni tab stop-a. Tekst ide
                  čitačima ekrana kao sr-only, a mišu kao tooltip. */}
              <span className={CHIP}>
                <MapPin className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                <span className="sr-only">Evropa · remote-first</span>
                <span className={TOOLTIP} aria-hidden="true">
                  Evropa · remote-first
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-theme-muted">
              Kompanija
            </h3>
            <ul className="space-y-2 text-[13px] text-theme-muted">
              {primaryLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.to}
                    className="transition-theme hover:text-theme-primary"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-theme-muted">
              Usluge
            </h3>
            <ul className="space-y-2 text-[13px] text-theme-muted">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.to}`}
                    className="transition-theme hover:text-theme-primary"
                  >
                    {service.headline}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-theme pt-5 text-[12px] text-theme-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Enigma Digital. Sva prava zadržana.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-theme hover:text-theme-primary">
              Politika privatnosti
            </Link>
            <Link href="/terms" className="transition-theme hover:text-theme-primary">
              Uslovi korišćenja
            </Link>
            <Link href="/brand" className="transition-theme hover:text-theme-primary">
              Smernice brenda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
