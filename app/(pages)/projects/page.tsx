import type { Metadata } from "next";
import clsx from "clsx";

import AutoTypingConsole from "@/components/ui/auto-typing-console";
import { RevealCard } from "@/components/ui/card";
import CtaButton from "@/components/ui/cta-button";
import ShowcaseVideo from "@/components/ui/showcase-video";
import { projects, type Project } from "@/constants/projects";

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

const [featured, ...rest] = projects;

/** The domain, shown as the card's proof: the site is live, go look. */
const displayHost = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Najviše tri čipa po kartici - ostatak opsega posla se vidi na samom sajtu. */
const MAX_CHIPS = 3;

/**
 * Medija pano kartice, homepage process-card gramatika: slika gore, telo ispod.
 * Browser chrome traka je ram - to je tema-svestan DOM, a snimak ispod nje ide
 * od ivice do ivice i nema svoj ram. Bez snimka pano ostaje DIZAJNIRANA korica:
 * rešetka, glow, monogram. `className` nosi samo odnos stranica i ivicu, jer se
 * ona razlikuje između featured panela (levo) i kartice u mreži (gore).
 */
function ProjectCover({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-reveal="off"
      className={clsx(
        "relative overflow-hidden border-theme theme-card-muted",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-1.5 border-b border-theme px-4">
        <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
      </div>

      {project.media ? (
        <ShowcaseVideo media={project.media} className="absolute inset-0 top-9" />
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
  );
}

/** Opseg posla, skraćen na tri stavke. */
function ScopeChips({ scope }: { scope: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {scope.slice(0, MAX_CHIPS).map((item) => (
        <li
          key={item}
          className="rounded-full border border-theme px-3 py-1 text-[11px] text-theme-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Adresa sajta kao dokaz: otvori i proveri. */
function LiveLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-fit items-center gap-2 font-accent text-xs text-theme-muted transition-colors hover:text-cyan-300"
    >
      {displayHost(url)}
      <span aria-hidden>↗</span>
    </a>
  );
}

export default function ProjectsPage() {
  return (
    <>
      {/* 01 - hero i odmah mreža radova. Jedna sekcija, jer je lista dokaz za
          tvrdnju iz hero-a i ne treba joj sopstveni uvod sa drugim naslovom. */}
      <section className="site-gutter theme-section relative overflow-hidden py-20 transition-theme md:py-24">
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Prvi projekat nosi celu širinu: medija levo, opis desno.
                `col-span` stoji na omotaču, ne na kartici: `Card` prosleđuje
                `className` sadržaju, a ćelija mreže je koren kartice. */}
            <div className="md:col-span-2">
              <RevealCard
                as="article"
                className="group grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
              >
                <ProjectCover
                  project={featured}
                  className="aspect-[16/10] border-b lg:aspect-auto lg:min-h-[24rem] lg:border-b-0 lg:border-r"
                />
                <div className="flex flex-col gap-5 p-7 sm:p-9">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-cyan-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                      Izdvojeno
                    </span>
                    <span className="inline-flex items-center rounded-full border border-theme px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-theme-muted">
                      {featured.tag}
                    </span>
                  </div>
                  <h2 className="text-xl leading-snug text-theme-primary md:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-theme-muted">
                    {featured.summary}
                  </p>
                  <ScopeChips scope={featured.scope} />
                  <div className="mt-auto flex flex-wrap items-center gap-5 pt-2">
                    {/* Podrazumevana veličina, ne `sm`: h-11 je 44px dodirne
                        zone, `sm` bi bilo 36. */}
                    <CtaButton
                      href={featured.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Otvori sajt
                    </CtaButton>
                    <LiveLink url={featured.url} />
                  </div>
                </div>
              </RevealCard>
            </div>

            {rest.map((project) => (
              <RevealCard
                as="article"
                key={project.id}
                className="group flex h-full flex-col"
              >
                <ProjectCover
                  project={project}
                  className="aspect-[16/10] border-b"
                />

                <div className="flex flex-1 flex-col gap-4 p-7">
                  <span className="inline-flex w-fit items-center rounded-full border border-theme px-3 py-1 text-[10px] uppercase tracking-[0.45em] text-cyan-300">
                    {project.tag}
                  </span>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-theme-muted">
                    {project.summary}
                  </p>
                  <ScopeChips scope={project.scope} />
                  <div className="mt-auto pt-3">
                    <LiveLink url={project.url} />
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* 02 - jedan kompaktan završni CTA. */}
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
