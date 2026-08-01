'use client';

import { useState } from "react";
import CtaButton from "@/components/ui/cta-button";
import Script from "next/script";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import {
  BadgeCheck,
  GaugeCircle,
  Server,
  SignalHigh,
  Smartphone,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

const detail = serviceDetails["mobile-app-development"];

const scopeItems = [
  {
    title: "Product strategija i opseg",
    benefit: "Definisanje funkcija i usklađivanje roadmap-a kako bi svako izdanje pomeralo ključne KPI-jeve.",
    icon: Target,
  },
  {
    title: "Cross-platform razvoj",
    benefit: "React Native ili Flutter build-ovi sa deljenom logikom i native završnicom.",
    icon: Smartphone,
  },
  {
    title: "Native performanse i pristup uređaju",
    benefit: "Iskustva od 60 fps uz integracije kamere, lokacije i hardvera.",
    icon: GaugeCircle,
  },
  {
    title: "Backend API-ji i integracije",
    benefit: "Bezbedni servisi, sinhronizacija podataka i third-party integracije građene za skaliranje.",
    icon: Server,
  },
  {
    title: "QA i release management",
    benefit: "Automatizacija testova, device lab-ovi i predaja u prodavnice rešeni od početka do kraja.",
    icon: Workflow,
  },
  {
    title: "Analitika i lifecycle angažovanje",
    benefit: "Praćenje događaja, funnel-i i push strategije za rast retencije.",
    icon: SignalHigh,
  },
];

const methodologyPillars = [
  {
    title: "Product discovery",
    points: [
      "Mapiranje korisničkog putovanja, prioritizacija funkcija i definisanje opsega izdanja.",
      "Klikabilni prototipovi i validacija stakeholder-a pre početka inženjeringa.",
    ],
  },
  {
    title: "Performanse i stabilnost",
    points: [
      "Profilisanje za animacije od 60 fps i efikasne native bridge-eve.",
      "Crash monitoring i regression suite-ovi ugrađeni u CI/CD.",
    ],
  },
  {
    title: "Automatizacija izdanja",
    points: [
      "CI pipeline-i, beta kanali i release notes vode se svakog sprinta.",
      "Predaja u prodavnice, compliance provere i koordinacija rollout-a.",
    ],
  },
];

const deliveryRail = [
  { phase: "Definisanje", caption: "Product brief, metrike uspeha i opseg" },
  { phase: "Prototip", caption: "UX tokovi, dizajn interakcije i validacija" },
  { phase: "Izrada", caption: "Agilni razvoj sa nedeljnim build-ovima" },
  { phase: "Lansiranje", caption: "Predaja u prodavnicu, QA i go-live" },
  { phase: "Rast", caption: "Eksperimenti retencije i širenje funkcija" },
];

const differentiators = [
  {
    title: "Native završnica uz deljenu brzinu",
    body: "Krećemo se brzo sa cross-platform temeljima, a native UX standardi ostaju netaknuti.",
  },
  {
    title: "Spremnost za prodavnice ugrađena",
    body: "App Store i Play Store compliance ugrađen je u svaku prekretnicu, ne ostavlja se za kraj.",
  },
  {
    title: "Analitika sa retencijom na prvom mestu",
    body: "Događaji, funnel-i i lifecycle poruke planiraju se zajedno sa razvojem funkcija.",
  },
  {
    title: "Bezbednost i usklađenost",
    body: "Sigurno skladištenje, auth tokovi i privatnost uključeni su od prvog dana.",
  },
];

const trustSignals = [
  { value: "60 fps", label: "Cilj performansi" },
  { value: "99.5%", label: "Sesije bez pada aplikacije" },
  { value: "8 wks", label: "MVP to store" },
  { value: "4.8", label: "Prosečan rast ocene" },
];

const journeyPhases = [
  {
    label: "1. Discovery i validacija",
    description: "Usklađujemo ciljeve, validiramo tokove rada i definišemo roadmap funkcija.",
    deliverable: "Product brief i mapa funkcija",
  },
  {
    label: "2. UX i prototipovanje",
    description: "Dizajniramo mobile-first tokove sa interaktivnim prototipovima i feedback loop-ovima.",
    deliverable: "Klikabilni prototip i UI kit",
  },
  {
    label: "3. Inženjering i QA",
    description: "Gradimo, testiramo i iteriramo kroz device lab-ove i automatizovane regression testove.",
    deliverable: "Release candidate build-ovi i QA izveštaji",
  },
  {
    label: "4. Lansiranje u prodavnici",
    description: "Pripremamo listing-e, privacy disclosure-e i koordiniramo go-live plan.",
    deliverable: "Store listing-i i go-live checklist-a",
  },
  {
    label: "5. Rast i iteracija",
    description: "Pratimo retenciju, isporučujemo unapređenja i planiramo proširenje funkcija.",
    deliverable: "Roadmap retencije i analytics dashboard",
  },
];

const maintenanceHighlights = [
  "Ažuriranja kompatibilnosti OS-a i uređaja za svako izdanje.",
  "Crash monitoring, profilisanje performansi i hotfix odgovor.",
  "Feature flag-ovi, fazni rollout-i i podrška za A/B testiranje.",
  "Optimizacija store listing-a i upravljanje recenzijama.",
  "Pregledi analitike vezani za ciljeve aktivacije i retencije.",
];

const faqItems = [
  {
    question: "Da li pravite native ili cross-platform aplikacije?",
    answer:
      "Radimo oba. React Native i Flutter su idealni za deljene codebase-ove, ali isporučujemo i native iOS/Android kada je potrebno.",
  },
  {
    question: "Kako rešavate predaju u App Store i Play Store?",
    answer:
      "Vodimo listing asset-e, compliance provere i submission tokove kako bi lansiranja bila glatka i na vreme.",
  },
  {
    question: "Možete li se integrisati sa našim postojećim backend-om?",
    answer:
      "Da. Radimo sa vašim API-jima, autentifikacijom i data layer-ima ili gradimo nove servise kada je potrebno.",
  },
  {
    question: "Da li će aplikacija podržati offline korišćenje?",
    answer:
      "Dizajniramo offline stanja i strategije sinhronizacije podataka za tokove koji traže pristup bez konekcije.",
  },
  {
    question: "Kako obezbeđujete performanse i stabilnost?",
    answer:
      "Profilisemo ključne tokove, pratimo crash rate i pokrećemo automatizovane testove uređaja svakog sprinta.",
  },
  {
    question: "Šta se dešava posle lansiranja?",
    answer:
      "Ostajemo na retainer-u za OS update-e, unapređenja funkcija, preglede analitike i brze popravke.",
  },
  {
    question: "Sa kojim timom ćemo raditi?",
    answer:
      "Posvećen tim obično uključuje mobile lead-a, product dizajnera, inženjere i QA podršku.",
  },
  {
    question: "How fast can we start?",
    answer:
      "Discovery može početi u roku od nedelju dana, a MVP plan i roadmap isporučujemo ubrzo posle kickoff-a.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const MobileAppDevelopment = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <>
      <PageHero {...detail} />

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container relative flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Opseg ukratko</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Mobilna isporuka koja vraća korisnike
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Od definisanja proizvoda do lansiranja u prodavnici, spajamo mobilni UX sa pouzdanim inženjeringom da aplikacija zasluži svakodnevno angažovanje.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scopeItems.map(({ title, benefit, icon: Icon }) => (
              <article
                key={title}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-theme/70 theme-card p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_32px_90px_-45px_rgba(56,189,248,0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,var(--spotlight-accent,rgba(56,189,248,0.14))_0%,rgba(15,23,42,0)_70%)] before:opacity-0 before:transition-opacity before:duration-500 before:ease-out group-hover:before:opacity-100 translate-y-0"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-theme theme-card-muted text-cyan-300 transition-all duration-500 ease-out group-hover:border-cyan-400 group-hover:text-cyan-400 group-hover:shadow-[0_18px_36px_-24px_rgba(56,189,248,0.75)]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-theme-primary">{title}</h3>
                  <p className="text-sm leading-relaxed text-theme-muted">{benefit}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-y border-theme/60 bg-slate-950/50 py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Tehnologija i metodologija</span>
              <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">Kako isporučujemo mobilne aplikacije</h2>
              <p className="text-base leading-relaxed text-theme-muted">
                Balansiramo product discovery, ciljeve performansi i release disciplinu kako bi se svaki sprint završio stabilnim build-om spremnim za testiranje.
              </p>
              <div className="flex flex-wrap gap-2">
                {["React Native", "Flutter", "App Store", "Play Store", "CI/CD", "Analytics"].map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-theme px-3 py-1 text-xs uppercase tracking-[0.3em] text-theme-muted"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-6">
              {methodologyPillars.map(({ title, points }) => (
                <article
                  key={title}
                  className="group rounded-3xl border border-theme/70 theme-card p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                    <BadgeCheck className="h-5 w-5 text-cyan-400" aria-hidden />
                    {title}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-theme-muted">
                    {points.map((point) => (
                      <li key={point} className="flex gap-2 transition-colors duration-300 group-hover:text-theme-primary">
                        <Sparkles className="mt-1 h-4 w-4 text-cyan-400" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-theme theme-card p-6 shadow-theme">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-theme-primary">Preuzmite brief za mobilno lansiranje</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Pogledajte release checklist-u, QA framework i plan analitike koje koristimo za put od koncepta do prodavnice.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.6em] text-theme-muted">Naš mobilni tok</span>
                <span className="text-xs uppercase tracking-[0.3em] text-theme-muted opacity-80 sm:text-right">
                  Prevucite da istražite svaku fazu isporuke
                </span>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-theme/70 theme-card p-6 shadow-[inset_0_1px_0_rgba(148,163,184,0.1)] backdrop-blur-sm transition-theme md:p-8">
                <span className="pointer-events-none absolute left-8 right-8 top-14 hidden h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/45 to-violet-500/0 lg:block" />
                <div className="flex gap-6 overflow-x-auto pb-3 pt-2 lg:grid lg:grid-cols-5 lg:gap-8 lg:overflow-visible lg:p-0">
                  {deliveryRail.map(({ phase, caption }, index) => (
                    <div
                      key={phase}
                      className="group relative flex min-w-[200px] flex-col gap-4 rounded-2xl border border-transparent bg-transparent p-4 transition-all duration-500 ease-out hover:border-cyan-400/40 hover:bg-theme-primary/5 lg:min-w-0 lg:flex-1 lg:border-none lg:bg-transparent lg:p-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-theme/70 theme-card text-sm font-semibold uppercase tracking-[0.2em] text-theme-primary transition-all duration-500 group-hover:border-cyan-400/70 group-hover:text-cyan-200">
                          {phase.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-theme-primary transition-colors duration-500 group-hover:text-cyan-200">
                          {phase}
                        </span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.28em] text-theme-muted leading-relaxed transition-colors duration-500 group-hover:text-theme-primary">
                        {caption}
                      </p>
                      {index < deliveryRail.length - 1 ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute right-[-28px] top-12 hidden h-px w-[56px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/45 to-violet-500/0 lg:block"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Zašto izabrati nas</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Mobilni timovi projektovani za retenciju
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Spajamo dizajn, inženjering i release management kako bi mobilno iskustvo ostalo brzo i pouzdano.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {differentiators.map(({ title, body }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_32px_90px_-50px_rgba(56,189,248,0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/0 before:via-cyan-500/10 before:to-violet-500/10 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100 translate-y-0"
              >
                <h3 className="text-xl font-semibold text-theme-primary">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-theme-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-y border-theme/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 transition-theme">
        <div className="site-container flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Dokazi kojima možete verovati</span>
            <h2 className="text-2xl font-semibold text-theme-primary md:text-3xl">Metrike mobilnih performansi</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustSignals.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col rounded-3xl border border-theme theme-card-muted px-5 py-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-1 hover:border-cyan-400/60 translate-y-0"
              >
                <span className="text-3xl font-semibold text-theme-primary">{value}</span>
                <span className="mt-2 text-xs uppercase tracking-[0.3em] text-theme-muted">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-theme-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Smartphone className="h-4 w-4 text-cyan-400" aria-hidden />
              iOS i Android isporuka
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Workflow className="h-4 w-4 text-cyan-400" aria-hidden />
              Automatizacija izdanja
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden />
              Lifecycle analitika
            </span>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Proces / putanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Put od ideje do app store-a
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Transparentne prekretnice drže tim informisanim, a izdanja predvidivim.
            </p>
          </div>
          <ol className="relative grid gap-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
            <span className="pointer-events-none absolute left-1/2 top-12 hidden h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-cyan-400 via-violet-500 to-cyan-400 xl:inline-block" />
            {journeyPhases.map(({ label, description, deliverable }, index) => (
              <li
                key={label}
                className="group relative overflow-hidden rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_32px_90px_-50px_rgba(56,189,248,0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/0 before:via-cyan-500/10 before:to-violet-500/10 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100 translate-y-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-theme text-sm font-semibold text-theme-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-theme-primary">{label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-theme-muted">{description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-cyan-400">Isporučujemo: {deliverable}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-gutter theme-section border-y border-theme/60 bg-slate-950/50 py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Održavanje i rast</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Ostajemo odgovorni posle lansiranja
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Mobilni proizvodi zahtevaju stalnu iteraciju. Ostajemo blizu da izdanja budu stabilna, a performanse snažne.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-start">
            <div className="rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                <GaugeCircle className="h-5 w-5 text-cyan-400" aria-hidden />
                Pregled stalnog angažmana
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Podršku usklađujemo sa vašim ritmom izdanja, obezbeđujući update-e, analitiku i brze popravke svakog sprinta.
              </p>
            </div>
            <ul className="space-y-3 rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:border-cyan-400/60">
              {maintenanceHighlights.map((item) => (
                <li
                  key={item}
                  className="group flex items-start gap-3 text-sm leading-relaxed text-theme-muted transition-colors duration-300 hover:text-theme-primary"
                >
                  <Sparkles
                    className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300"
                    aria-hidden
                  />
                  <span className="transition-colors duration-300 group-hover:text-theme-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-8">
          <div className="max-w-3xl space-y-5 text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Česta pitanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Česta pitanja o izradi mobilnih aplikacija
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Odgovori na teme koje najčešće prolazimo sa osnivačima i product liderima koji planiraju mobilno lansiranje.
            </p>
          </div>
          <div className="divide-y divide-theme rounded-3xl border border-theme theme-card">
            {faqItems.map(({ question, answer }) => {
              const isActive = activeQuestion === question;
              return (
                <div key={question}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-theme-primary/5"
                    aria-expanded={isActive}
                    onClick={() => setActiveQuestion((prev) => (prev === question ? null : question))}
                  >
                    <span
                      className={`text-base font-semibold transition-colors duration-300 ${
                        isActive ? "text-cyan-200" : "text-theme-primary"
                      }`}
                    >
                      {question}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border border-theme text-sm transition-colors duration-300 ${
                        isActive ? "bg-theme-primary text-theme-contrast" : "text-theme-muted"
                      }`}
                      aria-hidden
                    >
                      {isActive ? "-" : "+"}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden px-6 transition-[max-height] duration-300 ${
                      isActive ? "max-h-[320px]" : "max-h-0"
                    }`}
                  >
                    <p className="pb-6 text-sm leading-relaxed text-theme-muted">{answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section border-t border-theme/60 py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col items-center gap-6 text-center md:text-left">
          <h2 className="text-3xl font-semibold text-theme-muted md:text-4xl">
            Mapirajmo vaše sledeće mobilno lansiranje
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-theme-muted">
            Podelite product ciljeve i rokove, a mi ćemo sastaviti mobilni tim koji može da isporuči stabilnu, angažujuću aplikaciju na vreme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton href="/contact?intent=mobile-launch">
              <Sparkles className="h-4 w-4" aria-hidden />
              Isplanirajte mobilno lansiranje
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              <BadgeCheck className="h-4 w-4 text-cyan-400" aria-hidden />
              Pogledajte mobilne radove
            </CtaButton>
          </div>
        </div>
      </section>

      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
    </>
  );
};

export default MobileAppDevelopment;


