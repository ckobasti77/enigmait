'use client';

import { useState } from "react";
import CtaButton from "@/components/ui/cta-button";
import Script from "next/script";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import {
  BadgeCheck,
  Code2,
  GaugeCircle,
  LayoutDashboard,
  Network,
  Orbit,
  Server,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";

const detail = serviceDetails["web-development"];

const scopeItems = [
  {
    title: "Sajtovi i marketing platforme",
    benefit: "Composable CMS temelji koji growth timovima omogućavaju objavljivanje bez trenja.",
    icon: LayoutDashboard,
  },
  {
    title: "SaaS proizvod i arhitektura",
    benefit: "TypeScript-first platforme koje ostaju održive dok se korisnička putovanja šire.",
    icon: Code2,
  },
  {
    title: "Edge i serverless funkcije",
    benefit: "Brzo deploy-ujte i pametno skalirajte latency-sensitive compute tamo gde je važan.",
    icon: Network,
  },
  {
    title: "Performanse i observability",
    benefit: "Vitals, tracing i alerti su povezani tako da problemi isplivaju pre nego što ih korisnici primete.",
    icon: GaugeCircle,
  },
  {
    title: "Automatizacija i CI/CD alati",
    benefit: "Pipeline-i, QA zaštitni mehanizmi i DX unapređenja skraćuju svaki release ciklus.",
    icon: Workflow,
  },
  {
    title: "Bezbedne integracije podataka",
    benefit: "Ojačani API-ji, zero-trust autentifikacija i privacy-first analitika odmah iz kutije.",
    icon: Shield,
  },
];

const methodologyPillars = [
  {
    title: "TypeScript-first isporuka",
    points: [
      "Next.js, Remix, Astro i Edge runtime-i podešeni su prema opterećenju.",
      "Deljene biblioteke komponenti i dokumentacija spremna za Storybook.",
    ],
  },
  {
    title: "Opsesija performansama",
    points: [
      "Core Web Vitals budžeti sa automatizovanim Lighthouse ili Calibre proverama.",
      "Real user monitoring hook-ovi i edge keširanje svesno troškova.",
    ],
  },
  {
    title: "Observability ugrađen",
    points: [
      "Telemetrija kroz OpenTelemetry, Logtail, Datadog ili vaš stack.",
      "Incident runbook-ovi i alert routing usklađeni su sa vašim on-call modelom.",
    ],
  },
];

const deliveryRail = [
  { phase: "Kickoff", caption: "Discovery radionice i arhitektonski blueprint" },
  { phase: "Dizajn", caption: "Tokovi iskustva, specifikacije komponenti, usklađivanje developera" },
  { phase: "Izrada", caption: "Agilni timovi isporučuju nedeljno uz stabilan CI/CD" },
  { phase: "Iteracija", caption: "Optimizacije zasnovane na podacima i roadmap grooming" },
  { phase: "Skaliranje", caption: "Production hardening, edge podešavanja, kontrola troškova" },
];

const differentiators = [
  {
    title: "Građeno za rast",
    body: "Engineering-led timovi sarađuju sa product-om od roadmap-a do release-a, držeći akviziciju, aktivaciju i retenciju u fokusu.",
  },
  {
    title: "Održivo od prvog sprinta",
    body: "Čista arhitektura, tipizovani API-ji i jasni putevi za contributore znače da svaka nova funkcija stiže bez gomilanja duga.",
  },
  {
    title: "Performanse ugrađene",
    body: "Strategije keširanja, CDN pravila i profiling rade se tokom razvoja, kako biste pogodili 99%+ pouzdanosti prvog prikaza.",
  },
  {
    title: "Remote-first, usklađeno kroz vremenske zone",
    body: "Distribuirani inženjeri širom EMEA regiona i Severne Amerike rade uz vaš tim, pokrivajući ključne sate bez praznina u predaji.",
  },
];

const trustSignals = [
  { value: "99%+", label: "Stopa uspešnog prvog prikaza kroz lansiranja" },
  { value: "4 weeks", label: "Najbrži growth-stage MVP do produkcije" },
  { value: "EMEA / NA", label: "Ugrađeni remote engineering timovi" },
  { value: "40%", label: "Prosečan rast konverzije posle angažmana" },
];

const journeyPhases = [
  {
    label: "1. Discovery i roadmap",
    description: "Auditujemo trenutni stack, mapiramo KPI-jeve i usklađujemo merljive ishode.",
    deliverable: "Arhitektonski brief i prioritizovani backlog",
  },
  {
    label: "2. Dizajn i prototipovanje",
    description: "Postavljamo UX tokove, sistematizujemo UI i validiramo putanje sa product owner-ima.",
    deliverable: "Komponentni kit sa loop-ovima povratnih informacija na prototip",
  },
  {
    label: "3. Inženjering i izrada",
    description: "Implementiramo funkcije u nedeljnim inkrementima uz CI/CD i QA zaštitne mehanizme.",
    deliverable: "Production-ready inkrementi i release notes",
  },
  {
    label: "4. Lansiranje i iteracija",
    description: "Koordiniramo release-e, instrumentujemo analitiku i aktiviramo marketing automatizaciju.",
    deliverable: "Go-live checklist-a i tracking dashboard-i",
  },
  {
    label: "5. Monitoring i skaliranje",
    description: "Pratimo vitals, podešavamo infrastrukturu i isporučujemo unapređenja na osnovu podataka.",
    deliverable: "Mesečni pregled performansi i backlog optimizacije",
  },
];

const maintenanceHighlights = [
  "Mesečni pregled performansi i Core Web Vitals-a sa action item-ima.",
  "Održavanje observability dashboard-a, sintetičkih testova i alert routinga.",
  "Kontinuirani backlog grooming usklađen sa GTM eksperimentima i OKR-ovima.",
  "Profilisanje Edge funkcija i preporuke za optimizaciju troškova.",
  "Bezbednosne zakrpe, nadogradnje zavisnosti i automatizovani QA zaštitni mehanizmi.",
];

const faqItems = [
  {
    question: "Sa koliko velikim web development timom ću raditi?",
    answer:
      "Uključujemo posvećen tim od 3-6 specijalista (lead engineer, product designer, frontend/backend developeri, QA) prilagođen vašem roadmap-u i budžetu.",
  },
  {
    question: "Koje tech stack-ove preferirate?",
    answer:
      "Next.js, Remix i Astro na frontendu; serverless edge runtime-i, Node.js i GraphQL ili REST API-ji u sredini; moderni data store-ovi poput PlanetScale, Supabase ili DynamoDB gde odgovara. Svaki build je TypeScript-first.",
  },
  {
    question: "Kako rešavate održavanje posle lansiranja?",
    answer:
      "Ostajemo odgovorni kroz observability, mesečne health review-e, automatizovani QA i brzo rešavanje bug-ova kako bi platforma nastavila da napreduje.",
  },
  {
    question: "Možete li podržati agresivne ciljeve performansi?",
    answer:
      "Da. Dizajniramo ka prvom prikazu ispod dve sekunde, instrumentujemo real user monitoring i pokrećemo regresione testove pri svakom deploy-u kako bi vitals ostali u zelenom.",
  },
  {
    question: "Da li će moj proizvod skalirati sa rastom potražnje?",
    answer:
      "Planiramo rast od prvog dana kroz multi-region deploy-e, infrastructure-as-code i strategije database sharding-a ili read replica po potrebi.",
  },
  {
    question: "Da li se uklapate sa postojećim timovima i dobavljačima?",
    answer:
      "Apsolutno. Sarađujemo kroz marketing, product i ops, uključujući se u alate poput Linear-a, Jira-e, GitHub-a i Notion-a da sve ostane transparentno.",
  },
  {
    question: "Koliko brzo možemo da počnemo?",
    answer:
      "Discovery može početi u roku od nedelju dana. Definišemo opseg, KPI-jeve i pokrećemo posvećen remote engineering tim usklađen sa EMEA ili severnoameričkim satima.",
  },
  {
    question: "Koliko košta angažman?",
    answer:
      "Timovi kreću od fleksibilnih retainera sa transparentnim nedeljnim metrikama brzine. Dajemo detaljne ponude sa sastavom tima, ritmom i ishodima.",
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

const WebDevelopment = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <>
      <PageHero {...detail} />

      <section className="site-gutter theme-section py-24 transition-theme">
        <div className="site-container relative flex flex-col gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Opseg ukratko</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Izrada weba koja pokriva svaku fazu vaše platforme
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Od marketing sajtova do mission-critical SaaS rešenja, sastavljamo tačan miks frontend, backend i infrastructure ekspertize da vaša mapa puta nastavi da se kreće.
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

      <section className="site-gutter theme-section border-y border-theme/60 bg-slate-950/50 py-24 transition-theme">
        <div className="site-container flex flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Tehnologija i metodologija</span>
              <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">Kako gradimo</h2>
              <p className="text-base leading-relaxed text-theme-muted">
                Donosimo skalabilan stack koji balansira developer experience, budžete performansi i vidljivost za stakeholder-e. Rezultat je remote engineering tim koji isporučuje sigurno, čak i pod pritiskom brzog rasta.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "Remix", "GraphQL", "Edge functions", "TypeScript first", "CI/CD automation"].map(
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
                <h3 className="text-xl font-semibold text-theme-primary">Preuzmite brief za usluge izrade weba</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Dobijte kompletan okvir arhitektonskog blueprint-a, primer roadmap-a i remote squad playbook. Idealno za stakeholder-e koji žele detalje pre kickoff poziva.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.6em] text-theme-muted">Naš tok izrade</span>
                <span className="text-xs uppercase tracking-[0.3em] text-theme-muted opacity-80 sm:text-right">
                  Prevucite da istražite svaku fazu isporuke
                </span>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-theme/70 theme-card p-6 shadow-[inset_0_1px_0_rgba(148,163,184,0.1)] backdrop-blur-sm transition-theme md:p-8">
                <span className="pointer-events-none absolute left-8 right-8 top-14 hidden h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/45 to-violet-500/0 md:block" />
                <div className="flex gap-6 overflow-x-auto pb-3 pt-2 md:grid md:grid-cols-5 md:gap-8 md:overflow-visible md:p-0">
                  {deliveryRail.map(({ phase, caption }, index) => (
                    <div
                      key={phase}
                      className="group relative flex min-w-[200px] flex-col gap-4 rounded-2xl border border-transparent bg-transparent p-4 transition-all duration-500 ease-out hover:border-cyan-400/40 hover:bg-theme-primary/5 md:min-w-0 md:flex-1 md:border-none md:bg-transparent md:p-0"
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
                          className="pointer-events-none absolute right-[-28px] top-12 hidden h-px w-[56px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/45 to-violet-500/0 md:block"
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

      <section className="site-gutter theme-section py-24 transition-theme">
        <div className="site-container flex flex-col gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Zašto izabrati nas</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Remote timovi za izradu weba projektovani za skaliranje
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Spajamo product strategiju, inženjersku disciplinu i kontinuiranu optimizaciju da vaša skalabilna web platforma ostane ispred potražnje.
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
            <h2 className="text-2xl font-semibold text-theme-primary md:text-3xl">Ključne metrike i društveni dokaz</h2>
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
              <Server className="h-4 w-4 text-cyan-400" aria-hidden />
              Remote engineering timovi
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Orbit className="h-4 w-4 text-cyan-400" aria-hidden />
              Partnerstva sa growth-stage timovima
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden />
              Dizajn i inženjering u istom ritmu
            </span>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-24 transition-theme">
        <div className="site-container flex flex-col gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Proces / putanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Put od ideje do otporne platforme
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Transparentne prekretnice drže stakeholder-e uključene i obezbeđuju da remote engineering tim ostane usklađen sa poslovnim ishodima.
            </p>
          </div>
          <ol className="relative grid gap-8 lg:grid-cols-5">
            <span className="pointer-events-none absolute left-1/2 top-12 hidden h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-cyan-400 via-violet-500 to-cyan-400 lg:inline-block" />
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

      <section className="site-gutter theme-section border-y border-theme/60 bg-slate-950/50 py-24 transition-theme">
        <div className="site-container flex flex-col gap-10">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Održavanje i rast</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Ostajemo odgovorni dugo posle lansiranja
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Vaša skalabilna web platforma treba brigu i iteraciju. Ostajemo uključeni da pratimo, optimizujemo i razvijamo funkcije kako baza korisnika raste.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-start">
            <div className="rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                <GaugeCircle className="h-5 w-5 text-cyan-400" aria-hidden />
                Pregled stalnog angažmana
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Retainere usklađujemo sa ciljevima brzine, isporučujući merljive ishode svakog sprinta uz predvidive budžete.
              </p>
            </div>
            <ul className="space-y-3 rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:border-cyan-400/60">
              {maintenanceHighlights.map((item) => (
                <li
                  key={item}
                  className="group flex items-start gap-3 text-sm leading-relaxed text-theme-muted transition-colors duration-300 hover:text-theme-primary"
                >
                  <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" aria-hidden />
                  <span className="transition-colors duration-300 group-hover:text-theme-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-24 transition-theme">
        <div className="site-container flex flex-col gap-8">
          <div className="max-w-3xl space-y-5 text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Česta pitanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Česta pitanja o našim uslugama izrade weba
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Odgovori na teme koje najčešće prolazimo sa growth-stage osnivačima, marketing liderima i product timovima koji istražuju remote web development partnerstva.
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

      <section className="site-gutter theme-section border-t border-theme/60 py-24 transition-theme">
        <div className="site-container flex flex-col items-center gap-6 text-center md:text-left">
          <h2 className="text-3xl font-semibold text-theme-muted md:text-4xl">
              Definišimo vašu mapu puta i isporučimo skalabilnu web platformu
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-theme-muted">
              Podelite gde ste danas i koje KPI-jeve treba pomeriti, a mi ćemo sastaviti tim za izradu weba na daljinu koji se uklapa u vaš tim, uz ciljeve performansi i praćenje sistema od prvog sprinta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton href="/contact?intent=define-roadmap">
              <Sparkles className="h-4 w-4" aria-hidden />
              Definišimo mapu puta
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              <BadgeCheck className="h-4 w-4 text-cyan-400" aria-hidden />
              Pogledajte skorašnje projekte
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

export default WebDevelopment;
