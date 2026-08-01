'use client';

import { useState } from "react";
import CtaButton from "@/components/ui/cta-button";
import Script from "next/script";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import {
  BadgeCheck,
  GaugeCircle,
  Globe2,
  LayoutDashboard,
  MapPin,
  Search,
  SignalHigh,
  Sparkles,
} from "lucide-react";

const detail = serviceDetails["seo-geo"];

const scopeItems = [
  {
    title: "Tehnički SEO audit",
    benefit: "Crawl analiza, zdravlje indeksa i schema provere otkrivaju skrivene praznine.",
    icon: Search,
  },
  {
    title: "Performanse sajta i crawlability",
    benefit: "Core Web Vitals i arhitektura sajta podešeni za brzinu i jasnoću.",
    icon: GaugeCircle,
  },
  {
    title: "Arhitektura sadržaja i intent",
    benefit: "Topic cluster-i, interno linkovanje i page template-i građeni za konverziju.",
    icon: LayoutDashboard,
  },
  {
    title: "Lokalno i geo širenje",
    benefit: "Lokacijske strane, listing-i i hreflang podešavanja za nova tržišta.",
    icon: MapPin,
  },
  {
    title: "Autoritet i link strategija",
    benefit: "Digital PR i planiranje backlink-ova usklađeni sa ciljevima rasta.",
    icon: BadgeCheck,
  },
  {
    title: "Izveštavanje i eksperimentisanje",
    benefit: "Dashboard-i, rank tracking i test loop-ovi koji dokazuju uticaj.",
    icon: SignalHigh,
  },
];

const methodologyPillars = [
  {
    title: "Tehnički temelj",
    points: [
      "Crawl budžeti, strategija indeksiranja i schema markup podešeni za skaliranje.",
      "Poboljšanja performansi mapirana na konverzije i rast vidljivosti.",
    ],
  },
  {
    title: "Mapiranje sadržaja i intent-a",
    points: [
      "Analiza search intent-a vezana za product funnel-e i ciljeve konverzije.",
      "Cluster strategija konsoliduje autoritet i vodi interno linkovanje.",
    ],
  },
  {
    title: "Merenje i iteracija",
    points: [
      "Dashboard-i sa pozicijama, saobraćajem i revenue attribution update-ima.",
      "Logovi eksperimenata i kvartalni pregledi održavaju kumulativni zamah.",
    ],
  },
];

const deliveryRail = [
  { phase: "Audit", caption: "Tehnički pregled, crawl podaci i početne metrike" },
  { phase: "Strategija", caption: "Mapiranje ključnih reči, content plan i prioritetne popravke" },
  { phase: "Implementacija", caption: "Tehničke popravke i on-page optimizacija" },
  { phase: "Širenje", caption: "Lokacijske strane, prevodi i rollout po tržištima" },
  { phase: "Optimizacija", caption: "Izveštavanje, testovi i stalna unapređenja" },
];

const differentiators = [
  {
    title: "Engineering-led SEO",
    body: "Tehnička poboljšanja spajamo sa product i analytics timovima kako bi izmene brzo izašle i ostale.",
  },
  {
    title: "Geo širenje ugrađeno",
    body: "Lokalne strane, listing-i i planovi lokalizacije deo su roadmap-a, ne naknadna misao.",
  },
  {
    title: "Sadržaj usklađen sa konverzijom",
    body: "Search intent oblikuje landing strane i onboarding kako bi organski saobraćaj konvertovao.",
  },
  {
    title: "Transparentno izveštavanje",
    body: "Nedeljni dashboard-i i logovi eksperimenata jasno pokazuju odakle dolazi rast.",
  },
];

const trustSignals = [
  { value: "30%", label: "Cilj rasta saobraćaja" },
  { value: "90d", label: "Ritam roadmap-a" },
  { value: "50+", label: "Optimizovane strane" },
  { value: "12", label: "Podržana tržišta" },
];

const journeyPhases = [
  {
    label: "1. Audit i bazno merenje",
    description: "Pregledamo crawl podatke, pozicije i tehničko zdravlje da definišemo prioritete.",
    deliverable: "Tehnički audit i crawl izveštaj",
  },
  {
    label: "2. Strategija i roadmap",
    description: "Usklađujemo prilike ključnih reči sa content planovima i product ciljevima.",
    deliverable: "90-dnevni SEO roadmap",
  },
  {
    label: "3. Implementacija i popravke",
    description: "Isporučujemo tehnička unapređenja i optimizujemo prioritetne landing strane.",
    deliverable: "Backlog popravki i implementation checklist-a",
  },
  {
    label: "4. Sadržaj i geo širenje",
    description: "Objavljujemo nove strane, lokalne listing-e i prevedena iskustva.",
    deliverable: "Optimizovane strane i geo template-i",
  },
  {
    label: "5. Izveštavanje i iteracija",
    description: "Merimo uticaj, pokrećemo eksperimente i ažuriramo roadmap.",
    deliverable: "Dashboard-i performansi i log eksperimenata",
  },
];

const maintenanceHighlights = [
  "Mesečno praćenje pozicija i izveštavanje o vidljivosti.",
  "Ciklusi osvežavanja sadržaja i ažuriranja internog linkovanja.",
  "Tehničke health provere za indeksiranje i Core Web Vitals.",
  "Update-i lokalnih listing-a i smernice za odgovore na recenzije.",
  "Praćenje algorithm update-a i planovi brzog odgovora.",
];

const faqItems = [
  {
    question: "Koliko brzo ćemo videti SEO rezultate?",
    answer:
      "Rani signali se obično vide za 6-12 nedelja, a rast se kumulira kako tehnički i content rad sazrevaju.",
  },
  {
    question: "Da li radite tehničke popravke ili samo strategiju?",
    answer:
      "Radimo oba. Naš tim može implementirati tehničke SEO popravke ili sarađivati sa vašim engineering timom na isporuci.",
  },
  {
    question: "Da li pišete sadržaj?",
    answer:
      "Možemo obezbediti content brief-ove, outline-e i podršku u pisanju ili raditi uz vaš interni content tim.",
  },
  {
    question: "Možete li podržati internacionalni ili višejezični SEO?",
    answer:
      "Da. Planiramo hreflang podešavanja, lokalizovan sadržaj i page template-e specifične za tržišta.",
  },
  {
    question: "Da li upravljate lokalnim listing-ima?",
    answer:
      "Radimo lokacijske strane i strategiju listing-a, a možemo koordinisati review management sa vašim timom.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Pratimo pozicije, organski saobraćaj, konverzije i revenue attribution vezan za vaše KPI-jeve.",
  },
  {
    question: "Možete li raditi sa našim internim developerima?",
    answer:
      "Apsolutno. Uklapamo se u vaš workflow kroz Jira-u, Linear ili GitHub radi transparentne egzekucije.",
  },
  {
    question: "Kako izgleda angažman?",
    answer:
      "Većina angažmana radi se kroz kvartalni roadmap, mesečno izveštavanje i kontinuirane optimizacione sprintove.",
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

const SeoGeo = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <>
      <PageHero {...detail} />

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container relative flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Opseg ukratko</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              SEO pokrivenost koja kumulativno gradi vidljivost
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Usklađujemo tehnička poboljšanja, strategiju sadržaja i geo širenje kako biste uhvatili potražnju u svakoj fazi funnel-a.
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
              <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Strategija i metodologija</span>
              <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">Kako gradimo organsku vidljivost</h2>
              <p className="text-base leading-relaxed text-theme-muted">
                Spajamo tehnički SEO, arhitekturu sadržaja i analitiku kako bi rast bio merljiv i ponovljiv.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Tehnički SEO", "Schema", "Hreflang", "Lokalni SEO", "Tematski klasteri", "Izveštavanje"].map(
                  (keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-theme px-3 py-1 text-xs uppercase tracking-[0.3em] text-theme-muted"
                    >
                      {keyword}
                    </span>
                  )
                )}
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
                <h3 className="text-xl font-semibold text-theme-primary">Preuzmite SEO roadmap template</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Dobijte audit checklist-u, framework za mapiranje ključnih reči i ritam izveštavanja koji koristimo za kumulativni rast.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.6em] text-theme-muted">Naš SEO tok</span>
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
              SEO partneri fokusirani na merljive ishode
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Usklađujemo se sa vašim product, marketing i engineering timovima kako bismo isporučili search rast koji možete povezati sa prihodom.
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
            <h2 className="text-2xl font-semibold text-theme-primary md:text-3xl">Najvažnije search performanse</h2>
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
              <Search className="h-4 w-4 text-cyan-400" aria-hidden />
              Tehnička SEO pokrivenost
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Globe2 className="h-4 w-4 text-cyan-400" aria-hidden />
              Strategija geo širenja
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <SignalHigh className="h-4 w-4 text-cyan-400" aria-hidden />
              Transparentno izveštavanje
            </span>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Proces / putanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Put od audita do kumulativnog rasta
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Svaka prekretnica drži tim usklađenim i obezbeđuje dokumentovanje search rasta.
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
              Održavamo SEO zdravim dok se algoritmi menjaju
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Organske performanse zahtevaju stalnu pažnju. Pratimo update-e i održavamo roadmap svežim.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-start">
            <div className="rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                <GaugeCircle className="h-5 w-5 text-cyan-400" aria-hidden />
                Pregled stalnog angažmana
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Mesečno izveštavanje i optimizacione sprintove usklađujemo da pozicije ostanu stabilne, a saobraćaj raste.
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
              Česta pitanja o SEO i geo uslugama
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Odgovori na teme koje najčešće prolazimo sa growth i marketing timovima koji istražuju search partnerstva.
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
            Izgradimo search roadmap koji se skalira
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-theme-muted">
            Podelite tržišta, ciljeve i prioritete, a mi ćemo napraviti SEO roadmap koji usklađuje svaki tim oko merljivog rasta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton href="/contact?intent=seo-audit">
              <Sparkles className="h-4 w-4" aria-hidden />
              Zatražite SEO audit
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              <BadgeCheck className="h-4 w-4 text-cyan-400" aria-hidden />
              Pogledajte priče o rastu
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

export default SeoGeo;


