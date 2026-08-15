import Link from "next/link";
import CtaButton from "@/components/ui/cta-button";
import { navLinks } from "@/constants/navLinks";
import { socialLinks } from "@/constants/socialLinks";
import { ArrowUpRight } from "lucide-react";

const servicesParent = navLinks.find((link) => link.dropdownLinks);
const services = servicesParent?.dropdownLinks ?? [];
const primaryLinks = navLinks.filter((link) => !link.dropdownLinks && !link.cta);

/** Two side-by-side lists of three, so reading and tab order stay 1-2-3 | 4-5-6. */
const serviceColumns = [services.slice(0, 3), services.slice(3)];

const CHIP =
  "icon-orb group relative flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30";

const TOOLTIP =
  // Anchored to the chip's right edge: the cluster sits on the right end of the
  // CTA row, and a centred or left-anchored tooltip runs off the viewport there.
  "pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 whitespace-nowrap rounded-full border border-theme bg-card px-2.5 py-1 text-[11px] font-medium text-theme-primary opacity-0 shadow-theme transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100";

export default function Footer() {
  return (
    <footer className="site-gutter theme-section border-t border-theme py-8 transition-theme md:py-10">
      <div className="site-container flex flex-col gap-7">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.6fr)_minmax(0,0.85fr)] lg:gap-12">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-cyan-400">
              Enigma Digital
            </span>
            <h2 className="max-w-sm font-aeonik text-xl font-medium leading-snug text-theme-primary md:text-2xl">
              Iskustva koja definišu brend.
            </h2>

            {/* CTA i social/kontakt čipovi dele jedan red. `ml-auto` na klasteru
                je justify-between koji preživljava wrap: u jednoj liniji gura
                čipove skroz desno, a kad se red prelomi ostaju uz desnu ivicu,
                pa tooltip-ovi sidreni desno ne beže sa ekrana. Chrome, pa van
                site-wide reveal-a - tooltip mora biti čitljiv istog trena. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-4 pt-1" data-reveal="off">
              <CtaButton href="/contact" size="sm">
                Pokreni projekat
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </CtaButton>
              <div className="ml-auto flex items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={CHIP}
                      aria-label={item.ariaLabel ?? item.label}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      <span className={TOOLTIP}>{item.tooltip ?? item.label}</span>
                    </a>
                  );
                })}
              </div>
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
            <div className="grid grid-cols-2 gap-x-6">
              {serviceColumns.map((group, index) => (
                <ul key={index} className="space-y-2 text-[13px] text-theme-muted">
                  {group.map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`${servicesParent?.to ?? "/services"}/${service.to}`}
                        className="transition-theme hover:text-theme-primary"
                      >
                        {service.headline}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-theme pt-5 text-[12px] text-theme-muted md:flex-row md:items-center md:justify-between">
          {/* One template literal = one text node: the i18n dynamic pattern
              matches the whole © line, and JSX interpolation would split it
              into three nodes the walker can never match. */}
          <p>{`© ${new Date().getFullYear()} Enigma Digital. Sva prava zadržana.`}</p>
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
