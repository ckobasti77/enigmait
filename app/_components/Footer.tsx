import Link from "next/link";
import CtaButton from "@/components/ui/cta-button";
import { navLinks } from "@/constants/navLinks";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const services = navLinks.find((link) => link.dropdownLinks)?.dropdownLinks ?? [];
const primaryLinks = navLinks.filter((link) => !link.dropdownLinks && !link.cta);

export default function Footer() {
  return (
    <footer className="site-gutter theme-section border-t border-theme py-16 transition-theme">
      <div className="site-container flex flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.6em] text-cyan-400">
                Enigma Digital
              </span>
              <h2 className="max-w-lg font-aeonik text-3xl font-medium text-theme-primary md:text-4xl">
                Isporučujemo iskustva koja definišu brend uz odgovoran inženjering.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-theme-muted">
                Strategija, dizajn i inženjering rade zajedno kako bi svako lansiranje podiglo metrike koje su važne. Uključujemo timove u vaš product tim i održavamo visok tempo od početka do iteracije.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaButton href="/contact">
                Pokreni projekat
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </CtaButton>
              <CtaButton href="mailto:hello@enigma.digital" variant="secondary">
                hello@enigma.digital
              </CtaButton>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-theme-muted">
                Kompanija
              </h3>
              <ul className="space-y-3 text-sm text-theme-muted">
                {primaryLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.to}
                      className="group inline-flex items-center gap-2 transition-theme hover:text-theme-primary"
                    >
                      <span>{link.text}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-theme-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-theme-muted">
                Usluge
              </h3>
              <ul className="space-y-3 text-sm text-theme-muted">
                {services.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services/${service.to}`}
                      className="group inline-flex items-center gap-2 transition-theme hover:text-theme-primary"
                    >
                      <span>{service.headline}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-theme-muted">
                Poseta i kontakt
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-theme theme-card p-4 transition-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme">
                  <MapPin className="mt-0.5 h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <div className="text-sm text-theme-muted">
                    <p className="font-semibold text-theme-primary">Evropa / prvo na daljinu</p>
                    <p>Partnerstva sa timovima širom EMEA regiona i Severne Amerike.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-theme theme-card p-4 transition-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme">
                  <Phone className="mt-0.5 h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <div className="text-sm text-theme-muted">
                    <p className="font-semibold text-theme-primary">Poziv</p>
                    <Link href="tel:+442045771943" className="transition-theme hover:text-theme-primary">
                      +44 20 4577 1943
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-theme theme-card p-4 transition-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme">
                  <Mail className="mt-0.5 h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <div className="text-sm text-theme-muted">
                    <p className="font-semibold text-theme-primary">E-pošta</p>
                    <Link href="mailto:hello@enigma.digital" className="transition-theme hover:text-theme-primary">
                      hello@enigma.digital
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-theme pt-6 text-sm text-theme-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Enigma Digital. Sva prava zadržana.</p>
          <div className="flex flex-wrap items-center gap-4">
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

