import type { Metadata } from "next";
import { Rocket, Sparkles, Users } from "lucide-react";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import CtaButton from "@/components/ui/cta-button";
import ShowcaseVideo from "@/components/ui/showcase-video";
import { projects } from "@/constants/projects";

export const metadata: Metadata = {
  title: "Projekti — Enigma Digital",
  description:
    "Sajtovi i web-shopovi koje smo izradili: frizerski salon, turistička agencija, e-commerce, građevina, video nadzor i digitalni marketing.",
};

const capabilities = [
  {
    title: "Razgovor i plan",
    body: "Prvo razumemo posao i ljude koji na sajt dolaze, pa tek onda određujemo šta sajtu zaista treba i kojim redom.",
    icon: Users,
  },
  {
    title: "Dizajn i izrada",
    body: "Dizajn pravimo za vaš sadržaj, ne za šablon. Sajt gradimo tako da bude brz i da radi jednako dobro na telefonu i na velikom ekranu.",
    icon: Sparkles,
  },
  {
    title: "Lansiranje i podrška",
    body: "Postavljamo sajt, predajemo pristupe i ostajemo dostupni za izmene, dopune i sadržaj koji stiže kasnije.",
    icon: Rocket,
  },
];

/** The domain, shown as the card's proof: the site is live, go look. */
const displayHost = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function ProjectsPage() {
  return (
    <>
      <section className="site-gutter theme-section relative overflow-hidden py-20 transition-theme md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 z-0 h-[440px] w-[440px] -translate-x-1/2 rounded-full glow-accent blur-[150px]"
        />
        <div className="site-container relative z-10 flex flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
              Naši radovi
            </span>
            <AutoTypingConsole
              text="Sajtovi koje smo izradili, svi otvoreni za proveru"
              className="text-left text-3xl md:text-4xl"
            />
            <p className="max-w-xl text-base leading-relaxed text-theme-muted">
              Radimo sa salonima, agencijama, prodavnicama i izvođačima radova.
              Ispod je šest projekata: za svaki piše čime se klijent bavi i šta
              je posao obuhvatio, a adresa vodi na sajt uživo.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <CtaButton href="/contact">Pokreni projekat</CtaButton>
              <CtaButton href="/services" variant="secondary">
                Pogledajte usluge
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
        <div className="site-container space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <header className="max-w-2xl space-y-4">
              <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
                Izbor iz radova
              </span>
              <h2 className="text-2xl leading-snug text-theme-primary md:text-3xl">
                Šest projekata koje možete otvoriti i proveriti
              </h2>
            </header>
            <p className="max-w-md text-sm leading-relaxed text-theme-muted">
              Bez izvučenih procenata i bez tuđih brojeva. Piše šta je urađeno,
              a ostalo vidite na samom sajtu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <article
                key={project.id}
                className="card-lift group relative flex h-full flex-col overflow-hidden rounded-3xl border border-theme theme-card transition-theme hover:border-cyan-400/50"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-80"
                />

                {/* Media pane, the homepage process-card grammar: image on
                    top, body below. The browser chrome bar is the frame - it is
                    theme-aware DOM, and the recording sits edge-to-edge in the
                    space below it, carrying no frame of its own. Without media
                    the pane stays the DESIGNED cover: grid, glow, monogram. */}
                <div
                  aria-hidden
                  data-reveal="off"
                  className="relative aspect-[16/10] overflow-hidden border-b border-theme theme-card-muted"
                >
                  <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-1.5 border-b border-theme px-4">
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
                  </div>

                  {project.media ? (
                    <ShowcaseVideo
                      media={project.media}
                      className="absolute inset-0 top-9"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 top-9 opacity-[0.05]"
                        style={{
                          backgroundImage:
                            "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
                          backgroundSize: "36px 36px",
                        }}
                      />
                      <div className="absolute -left-14 -top-10 h-44 w-44 rounded-full glow-accent blur-[80px]" />
                      <div className="absolute inset-0 flex items-center justify-center pt-9">
                        <span className="font-accent text-5xl tracking-[0.2em] text-theme-primary opacity-20 transition-opacity duration-500 group-hover:opacity-35 md:text-6xl">
                          {project.monogram}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-full border border-theme px-3 py-1 text-[10px] uppercase tracking-[0.45em] text-cyan-300">
                      {project.tag}
                    </span>
                    <span
                      aria-hidden
                      className="font-accent text-xl text-theme-muted opacity-60"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-theme-muted">
                    {project.summary}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {project.scope.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-theme px-3 py-1 text-[11px] text-theme-muted"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-2 font-accent text-xs text-theme-muted transition-colors hover:text-cyan-300"
                  >
                    {displayHost(project.url)}
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
        <div className="site-container space-y-12">
          <header className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">
              Kako radimo
            </span>
            <h2 className="text-2xl leading-snug text-theme-primary md:text-3xl">
              Od prvog razgovora do sajta koji radi
            </h2>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {capabilities.map(({ title, body, icon: Icon }) => (
              <article
                key={title}
                className="card-lift relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-theme theme-card p-6 transition-theme hover:border-cyan-400/50"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-80"
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-theme theme-card-muted text-cyan-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-theme-muted">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-t border-theme py-20 transition-theme sm:py-24">
        <div className="site-container flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl text-2xl leading-snug text-theme-primary md:text-3xl">
            Treba vam nov sajt ili obnova postojećeg?
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-theme-muted">
            Recite nam čime se bavite i šta vas na trenutnom sajtu koči. Vraćamo
            se sa predlogom opsega posla, rokom i cenom, pa odluku donosite sa
            svim brojevima pred sobom.
          </p>
          <div className="pt-2">
            <CtaButton href="/contact">Zakažite uvodni razgovor</CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
