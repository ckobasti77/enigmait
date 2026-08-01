'use client';

import { useState } from "react";
import CtaButton from "@/components/ui/cta-button";
import Script from "next/script";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import {
  BadgeCheck,
  GaugeCircle,
  Megaphone,
  MessageSquare,
  SignalHigh,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const detail = serviceDetails["social-media"];

const scopeItems = [
  {
    title: "Strategija kanala i ton",
    benefit: "Izbor platformi, smernice glasa i content stubovi građeni oko vaše publike.",
    icon: Target,
  },
  {
    title: "Produkcija sadržaja i motion",
    benefit: "Kratki video formati, carousel objave i kreativni materijali dizajnirani za svaku platformu.",
    icon: Sparkles,
  },
  {
    title: "Upravljanje zajednicom",
    benefit: "Engagement playbook-ovi, smernice moderacije i response workflow-i.",
    icon: MessageSquare,
  },
  {
    title: "Plaćena promocija i amplifikacija",
    benefit: "Planiranje kampanja, targeting i optimizacija za širenje dosega.",
    icon: Megaphone,
  },
  {
    title: "Creator partnerstva",
    benefit: "Influencer brief-ovi, outreach ka kreatorima i brand-safe saradnje.",
    icon: Users,
  },
  {
    title: "Izveštavanje i uvidi",
    benefit: "Dashboard-i, analiza trendova i praćenje eksperimenata koji vode strategiju.",
    icon: SignalHigh,
  },
];

const methodologyPillars = [
  {
    title: "Kreativa prirodna za platformu",
    points: [
      "Formati, hook-ovi i storytelling prilagođeni algoritmu svakog kanala.",
      "Kreativni sistemi koji balansiraju konzistentnost brenda i agilnost prema trendovima.",
    ],
  },
  {
    title: "Brzo eksperimentisanje",
    points: [
      "Nedeljni planovi testiranja kreative, copy-ja i tajminga.",
      "Pregledi performansi sadržaja direktno povezani sa KPI-jevima.",
    ],
  },
  {
    title: "Loop-ovi rasta zajednice",
    points: [
      "Engagement workflow-i grade lojalnost i pretvaraju pratioce u zastupnike brenda.",
      "Koordinacija paid i organic aktivnosti za maksimalan doseg i retenciju.",
    ],
  },
];

const deliveryRail = [
  { phase: "Strategija", caption: "Audit kanala, voice guide i KPI podešavanje" },
  { phase: "Kreiranje", caption: "Produkcija sadržaja i razvoj asset-a" },
  { phase: "Objava", caption: "Zakazivanje, distribucija i lansiranje" },
  { phase: "Optimizacija", caption: "Analiza performansi i testiranje" },
  { phase: "Skaliranje", caption: "Evergreen biblioteke i growth kampanje" },
];

const differentiators = [
  {
    title: "Always-on content engine",
    body: "Održavamo kanale aktivnim uz rolling calendar i brzu izradu kreative.",
  },
  {
    title: "Monitoring u realnom vremenu",
    body: "Dnevni dashboard-i i praćenje komentara drže angažovanje visokim, a rizike niskim.",
  },
  {
    title: "Paid i organic zajedno",
    body: "Kreativni pravac i media planning su usklađeni kako bi svaka kampanja kumulirala rezultate.",
  },
  {
    title: "Brand-safe briga o zajednici",
    body: "Smernice moderacije i escalation paths štite reputaciju dok se skalirate.",
  },
];

const trustSignals = [
  { value: "5x", label: "Rast angažovanja" },
  { value: "24h", label: "Rok za kreativu" },
  { value: "12", label: "Kampanje po kvartalu" },
  { value: "2x", label: "Rast pratilaca" },
];

const journeyPhases = [
  {
    label: "1. Discovery i glas",
    description: "Auditujemo kanale, definišemo glas i usklađujemo ciljeve.",
    deliverable: "Voice guide i audit kanala",
  },
  {
    label: "2. Planiranje sadržaja",
    description: "Gradimo content kalendar vezan za lansiranja, događaje i KPI-jeve.",
    deliverable: "90-dnevni content kalendar",
  },
  {
    label: "3. Produkcija i zakazivanje",
    description: "Kreiramo asset-e, pišemo copy i zakazujemo objave kroz kanale.",
    deliverable: "Asset biblioteka i publishing plan",
  },
  {
    label: "4. Zajednica i plaćena promocija",
    description: "Angažujemo zajednicu i lansiramo ciljane paid kampanje.",
    deliverable: "Engagement playbook i paid testovi",
  },
  {
    label: "5. Izveštavanje i iteracija",
    description: "Pregledamo performanse, testiramo nove ideje i doterujemo kalendar.",
    deliverable: "Performance dashboard i test log",
  },
];

const maintenanceHighlights = [
  "Nedeljno planiranje sadržaja i mapiranje trendova.",
  "Dnevni monitoring sa smernicama odgovora i escalation paths.",
  "Osvežavanje kreative i update-i evergreen biblioteke.",
  "Optimizacija paid budžeta i podešavanje targetinga.",
  "Mesečno izveštavanje sa growth eksperimentima i učenjima.",
];

const faqItems = [
  {
    question: "Kojim društvenim platformama upravljate?",
    answer:
      "Pokrivamo TikTok, Instagram, LinkedIn, YouTube, X i nove platforme prema vašoj publici i ciljevima.",
  },
  {
    question: "Koliko objava možete proizvesti nedeljno?",
    answer:
      "Obim prilagođavamo strategiji, obično 3-7 objava nedeljno uz prateće stories ili shorts.",
  },
  {
    question: "Da li rešavate odobrenja i brand compliance?",
    answer:
      "Da. Pre objave postavljamo review workflow-e, approval gate-ove i brand-safe smernice.",
  },
  {
    question: "Možete li upravljati i paid social oglasima?",
    answer:
      "Apsolutno. Vodimo kreativu, targeting i optimizaciju, a izveštaje o performansama delimo nedeljno.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Pratimo angažovanje, doseg, rast pratilaca, click-through i konverzione metrike vezane za KPI-jeve.",
  },
  {
    question: "Da li odgovarate na komentare i poruke?",
    answer:
      "Da. Pratimo smernice odgovora, vodimo moderaciju i brzo eskaliramo probleme kada je potrebno.",
  },
  {
    question: "Koliko brzo možete lansirati kampanju?",
    answer:
      "Možemo početi u roku od nedelju dana, sa auditom kanala i content kalendarom ubrzo nakon toga.",
  },
  {
    question: "Koliko košta angažman?",
    answer:
      "Angažmani se definišu mesečno prema broju kanala, obimu sadržaja i podršci za paid media.",
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

const SocialMedia = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <>
      <PageHero {...detail} />

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container relative flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Opseg ukratko</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Društvene mreže koje grade zamah
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Od content kalendara do community management-a, držimo vaš brend vidljivim, responzivnim i u rastu.
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
              <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">Kako razvijamo društvene zajednice</h2>
              <p className="text-base leading-relaxed text-theme-muted">
                Spajamo platform-native kreativu sa optimizacijom u realnom vremenu kako bi sadržaj nastavio da kumulira doseg.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Kalendar sadržaja", "Kratki video", "Plaćena promocija", "Kreatori", "Zajednica", "Izveštavanje"].map(
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
                <h3 className="text-xl font-semibold text-theme-primary">Preuzmite social growth playbook</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Dobijte template content kalendara, ritam izveštavanja i framework kreativnog testiranja koji koristimo za skaliranje social kanala.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.6em] text-theme-muted">Naš social tok</span>
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
              Social timovi koji održavaju visok zamah
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Spajamo strategiju, produkciju i brigu o zajednici kako bi kanali ostali aktivni i u skladu sa brendom.
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
            <h2 className="text-2xl font-semibold text-theme-primary md:text-3xl">Metrike social rasta</h2>
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
              <Megaphone className="h-4 w-4 text-cyan-400" aria-hidden />
              Paid i organic kampanje
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <MessageSquare className="h-4 w-4 text-cyan-400" aria-hidden />
              Upravljanje zajednicom
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden />
              Loop-ovi kreativnog testiranja
            </span>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Proces / putanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Put od strategije do svakodnevnog angažovanja
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Prekretnice drže tim usklađenim, a content kalendar punim.
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
              Ostajemo blizu dok se zajednica skalira
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Social momentum zahteva stalnu iteraciju. Pratimo, osvežavamo i optimizujemo iz nedelje u nedelju.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-start">
            <div className="rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                <GaugeCircle className="h-5 w-5 text-cyan-400" aria-hidden />
                Pregled stalnog angažmana
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Izveštavanje, osvežavanje kreative i podršku kanalima usklađujemo sa kalendarom kampanja.
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
              Česta pitanja o uslugama društvenih mreža
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Odgovori na teme koje najčešće prolazimo sa marketing i community timovima koji planiraju social rast.
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
            Lansirajmo vaš social engine
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-theme-muted">
            Recite nam koji kanali su najvažniji i izgradićemo social strategiju, ritam sadržaja i plan izveštavanja koji drži vaš brend prisutnim.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton href="/contact?intent=social-strategy">
              <Sparkles className="h-4 w-4" aria-hidden />
              Pokrenite kampanju
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              <BadgeCheck className="h-4 w-4 text-cyan-400" aria-hidden />
              Pogledajte uspehe na mrežama
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

export default SocialMedia;


