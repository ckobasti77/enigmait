import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt — Enigma Digital",
  description:
    "Pošaljite brief — vraćamo prva pitanja u roku od 12 sati, a plan, tim i rok u roku od 48. Remote-first tim kroz EMEA sate.",
};

const CONTACT_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Kontakt — Enigma Digital",
  url: "/contact",
  mainEntity: {
    "@type": "Organization",
    name: "Enigma Digital",
    email: "office@enigmait.rs",
    telephone: "+44 20 4577 1943",
  },
}).replace(/</g, "\\u003c");

/** Direct lines, not boxed cards - the page is one hero and the form. */
const directLines = [
  { href: "mailto:office@enigmait.rs", icon: Mail, label: "office@enigmait.rs" },
  { href: "tel:+442045771943", icon: Phone, label: "+44 20 4577 1943" },
];

/** One line each. The full pitch belongs to the reply, not the page. */
const nextSteps = [
  "Odgovor u roku od 12 sati",
  "Uvodni poziv od 30 minuta",
  "Plan i tim u roku od 48 sati",
];

export default function ContactPage() {
  return (
    <>
      <section className="site-gutter theme-section relative flex min-h-svh items-center overflow-hidden py-28 transition-theme">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 z-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full glow-accent blur-[150px]"
        />

        <div className="site-container relative z-10 grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <AutoTypingConsole
                text="Pošaljite brief. Mi dovodimo tim."
                className="text-left text-3xl md:text-4xl"
              />
              <p className="max-w-xl text-base leading-relaxed text-theme-muted md:text-lg">
                Recite nam koji ishod vam treba u naredna dva kvartala.
                Sastavićemo pravi tim stratega, dizajnera i inženjera, zatim
                ostati uz vas dok playbook ne zaživi u vašem timu.
              </p>
            </div>

            <div className="flex flex-col gap-3" data-reveal="off">
              {directLines.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  className="group inline-flex w-fit items-center gap-3 text-base text-theme-primary transition-theme hover:text-cyan-300 md:text-lg"
                >
                  <Icon
                    className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover:-translate-y-0.5"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                  <span className="font-accent tracking-wide">{label}</span>
                </a>
              ))}
            </div>

            <div className="max-w-md border-t border-theme pt-6">
              <ol className="space-y-3">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex items-baseline gap-4">
                    <span
                      aria-hidden
                      className="font-accent text-sm text-cyan-400"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-theme-muted md:text-base">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 max-w-md text-xs leading-relaxed text-theme-muted opacity-80">
                Ako nismo najbolji partner, uputićemo vas na nekoga iz naše
                mreže ko jeste.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: CONTACT_JSON_LD }}
      />
    </>
  );
}
