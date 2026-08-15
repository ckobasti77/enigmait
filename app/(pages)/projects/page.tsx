import type { Metadata } from "next";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import CtaButton from "@/components/ui/cta-button";
import ProjectShowcase from "@/components/sections/projects";
import { projects } from "@/constants/projects";

export const metadata: Metadata = {
  title: "Projekti — Enigma Digital",
  description:
    "Sajtovi i web-shopovi koje smo izradili: frizerski salon, turistička agencija, e-commerce, građevina, video nadzor i digitalni marketing.",
};

/**
 * Kako radimo, sažeto u jedan red u hero-u. Ranije je to bila cela sekcija sa
 * tri kartice - isti sadržaj već stoji na početnoj i na stranicama usluga, pa
 * ovde ostaje samo trag koraka, ne treće pričanje iste priče.
 */
const steps = ["Razgovor i plan", "Dizajn i izrada", "Lansiranje i podrška"];

/**
 * Tri proof pločice. Sve tri se **računaju iz same liste projekata** umesto da
 * budu ukucane: `constants/projects.ts` namerno nema metrika jer nemamo pristup
 * tuđoj analitici, pa jedini broj koji sme da stoji ovde je broj koji čitalac
 * može da prebroji na istoj stranici. Doda li se sedmi projekat, pločica se
 * pomera sama.
 */
const webShopCount = projects.filter((project) =>
  project.scope.some((item) => item.startsWith("Web-shop"))
).length;

const proofs = [
  { value: String(projects.length), label: "Projekata uživo" },
  { value: String(webShopCount), label: "Web-shopa sa naplatom" },
  { value: "100%", label: "Adresa vodi na živ sajt" },
];

/**
 * `ItemList` svih šest projekata.
 *
 * Mora da bude u serviranom HTML-u, pa se gradi ovde na serveru i ide kao običan
 * `<script>` - `next/script` sa `afterInteractive` ubacuje tag tek posle
 * hidracije, pa `.next/server/app/*.html` ostaje bez ijednog `application/ld+json`.
 * Isti razlog i isti oblik kao `DisciplinesSection.tsx`.
 */
const ITEM_LIST_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Projekti — Enigma Digital",
  numberOfItems: projects.length,
  itemListElement: projects.map((project, position) => ({
    "@type": "ListItem",
    position: position + 1,
    name: project.title,
    description: project.summary,
    url: project.url,
  })),
});

export default function ProjectsPage() {
  return (
    <>
      {/* 01 - hero. Tvrdnja i brojevi; dokaz je scena odmah ispod. */}
      <section className="site-gutter theme-section relative overflow-hidden pb-10 pt-20 transition-theme md:pb-12 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 z-0 h-[440px] w-[440px] -translate-x-1/2 rounded-full glow-accent blur-[150px]"
        />
        <div className="site-container relative z-10 flex flex-col gap-14">
          <div className="flex max-w-2xl flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
              Naši radovi
            </span>
            <AutoTypingConsole
              text="Radovi otvoreni za proveru"
              className="text-left text-3xl md:text-4xl"
            />
            <p className="text-base leading-relaxed text-theme-muted">
              Šest sajtova za salone, agencije, prodavnice i izvođače — svaka
              adresa otvara živ sajt.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <CtaButton href="/contact">Pokreni projekat</CtaButton>
              <CtaButton href="/services" variant="secondary">
                Pogledajte usluge
              </CtaButton>
            </div>

            {/* Vrednost je u blok <span>-u, nikad go tekst u ćeliji mreže -
                isto kao ServiceProofStrip, zbog text reveal ugovora. */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {proofs.map((proof) => (
                <div
                  key={proof.label}
                  className="relative overflow-hidden rounded-2xl border border-theme theme-card-muted px-4 py-3"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-80"
                  />
                  <span className="block font-accent text-2xl text-theme-primary">
                    {proof.value}
                  </span>
                  <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-theme-muted">
                    {proof.label}
                  </span>
                </div>
              ))}
            </div>

            <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-theme-muted">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="font-accent text-[10px] tracking-[0.3em] text-cyan-400">
                    {`0${index + 1}`}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 02 - jedna scena, četiri uređaja, šest projekata koji klize kroz njih. */}
      <ProjectShowcase>
        {/*
          CEO SEO ARGUMENT STRANE, renderovan na serveru.

          Vidljivi tekst pripada jednom projektu u datom trenutku, pa bi bez ovoga
          u HTML-u koji crawler dobije stajao jedan od šest. Ovde su sva šest, sa
          pravim `href`-om, bez obzira da li se ijedan canvas ikad montira.

          `data-reveal="off"` nije dekoracija: site-wide kontroler kreće od
          `opacity: 0` i otkriva na presek sa kadrom, a `sr-only` element je
          isečen na 1px - njegov observer možda nikad ne opali i tekst bi ostao
          neotkriven zauvek.

          `tabIndex={-1}` na linkovima: blok je vizuelno isečen, pa bi ih tastatura
          inače obilazila kao nevidljive stanice. Čitač ekrana i crawler ih i dalje
          vide, a tastatura do svakog od šest sajtova stiže kroz vidljiv CTA koji
          se menja sa slajderom.
        */}
        <section aria-label="Svi projekti" data-reveal="off" className="sr-only">
          <h2>Svi projekti</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                >
                  {project.title}
                </a>
                <p>{project.summary}</p>
                <p>{project.scope.join(", ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ITEM_LIST_JSON_LD }}
        />
      </ProjectShowcase>

      {/* 03 - jedan kompaktan završni CTA. */}
      <section className="site-gutter theme-section border-t border-theme py-16 transition-theme sm:py-20">
        <div className="site-container flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-3xl text-2xl leading-snug text-theme-primary md:text-3xl">
            Treba vam nov sajt ili obnova postojećeg?
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-theme-muted">
            Recite nam čime se bavite i šta vas na trenutnom sajtu koči. Vraćamo
            se sa predlogom opsega posla, rokom i cenom, pa odluku donosite sa
            svim brojevima pred sobom.
          </p>
          <div className="pt-1">
            <CtaButton href="/contact">Zakažite uvodni razgovor</CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
