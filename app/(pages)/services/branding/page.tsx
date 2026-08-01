'use client';

import { useState } from "react";
import CtaButton from "@/components/ui/cta-button";
import Script from "next/script";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import {
  BadgeCheck,
  Compass,
  GaugeCircle,
  Layers,
  MessageSquare,
  Palette,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const detail = serviceDetails["branding"];

const scopeItems = [
  {
    title: "Strategija brenda i pozicioniranje",
    benefit: "Konkurentski uvidi i jasnoća publike oštre vaš narativ.",
    icon: Target,
  },
  {
    title: "Sistemi vizuelnog identiteta",
    benefit: "Paketi logotipa, tipografija i sistemi boja koji se skaliraju kroz touchpoint-e.",
    icon: Palette,
  },
  {
    title: "Messaging i verbalni identitet",
    benefit: "Glas, ton i stubovi poruka koji svaki tim drže usklađenim.",
    icon: MessageSquare,
  },
  {
    title: "Brand arhitektura i naming",
    benefit: "Jasno imenovanje proizvoda i hijerarhija koja podržava buduća lansiranja.",
    icon: Layers,
  },
  {
    title: "Launch asset-i i enablement",
    benefit: "Sales deck-ovi, social kit-ovi i template-i za usklađene rollout-e.",
    icon: BadgeCheck,
  },
  {
    title: "Employer brend i kultura",
    benefit: "Interni narativi i recruiting asset-i koji privlače prave talente.",
    icon: Users,
  },
];

const methodologyPillars = [
  {
    title: "Strateške radionice",
    points: [
      "Intervjui sa stakeholder-ima, competitive scan i segmentacija publike.",
      "Positioning statement i messaging mapa usklađeni sa GTM ciljevima.",
    ],
  },
  {
    title: "Dizajn sistema identiteta",
    points: [
      "Moodboard-i, porodice logotipa, tipografija i arhitektura boja.",
      "Tokenizovane Figma biblioteke i asset kit-ovi spremni za export.",
    ],
  },
  {
    title: "Rollout i governance",
    points: [
      "Knjiga standarda brenda, šabloni i pravila upotrebe za svaki tim.",
      "Launch plan sa internim enablement-om i eksternim rollout asset-ima.",
    ],
  },
];

const deliveryRail = [
  { phase: "Discovery", caption: "Istraživanje, audit i usklađivanje stakeholder-a" },
  { phase: "Pozicioniranje", caption: "Narativ, stubovi poruka i mapa vrednosti" },
  { phase: "Identitet", caption: "Paket logotipa, tipografija i vizuelni sistem" },
  { phase: "Lansiranje", caption: "Produkcija template-a i rollout asset-i" },
  { phase: "Skaliranje", caption: "Governance, obuka i održavanje brenda" },
];

const differentiators = [
  {
    title: "Brend se sreće sa product strategijom",
    body: "Povezujemo pozicioniranje sa onboarding-om, cenama i retencijom kako bi svaki touchpoint ojačao vašu vrednost.",
  },
  {
    title: "Sistemi, ne samo logotipi",
    body: "Komponentizovani brand tokeni i template-i omogućavaju timovima skaliranje bez gubitka konzistentnosti.",
  },
  {
    title: "Saradnički i transparentno",
    body: "Radionice i decision log-ovi drže stakeholder-e usklađenim i smanjuju doradu kroz timove.",
  },
  {
    title: "Asset-i spremni za lansiranje",
    body: "Isporučujemo deck-ove, social kit-ove i interni enablement kako bi rollout nastupio sigurno.",
  },
];

const trustSignals = [
  { value: "4 wks", label: "Brand sprint od kickoff-a" },
  { value: "20+", label: "Isporučeni launch asset-i" },
  { value: "95%", label: "Ocena usklađenosti stakeholder-a" },
  { value: "3x", label: "Rast prepoznatljivosti brenda" },
];

const journeyPhases = [
  {
    label: "1. Discovery i uvidi",
    description: "Auditujemo trenutni brend, istražujemo konkurente i usklađujemo ciljeve.",
    deliverable: "Brand audit i sažetak istraživanja",
  },
  {
    label: "2. Pozicioniranje i narativ",
    description: "Definišemo vašu priču, glas i diferencirane stubove poruka.",
    deliverable: "Positioning statement i stubovi poruka",
  },
  {
    label: "3. Dizajn sistema identiteta",
    description: "Kreiramo pakete logotipa, tipografiju, boje i motion pravce.",
    deliverable: "Paket logotipa i vizuelne smernice",
  },
  {
    label: "4. Produkcija asset-a i lansiranje",
    description: "Gradimo kolaterale i template-e potrebne timovima za brz rollout.",
    deliverable: "Launch kit i biblioteka template-a",
  },
  {
    label: "5. Governance i enablement",
    description: "Dokumentujemo upotrebu, obučavamo timove i pripremamo buduća proširenja.",
    deliverable: "Knjiga standarda brenda i obuka timova",
  },
];

const maintenanceHighlights = [
  "Kvartalne provere zdravlja brenda i perception scan-ovi.",
  "Osvežavanje template-a za nove kampanje i lansiranja.",
  "Auditi konzistentnosti brenda kroz web, proizvod i prodajne materijale.",
  "Podrška za naming i arhitekturu novih ponuda.",
  "Upravljanje asset bibliotekom za dizajnere i marketare.",
];

const faqItems = [
  {
    question: "Koliko traje tipičan branding angažman?",
    answer:
      "Većina brand sprintova traje 4-6 nedelja, u zavisnosti od dostupnosti stakeholder-a i broja potrebnih asset-a.",
  },
  {
    question: "Možete li osvežiti postojeći brend umesto da krećemo ispočetka?",
    answer:
      "Da. Možemo modernizovati vizuelni sistem, izoštriti messaging i ažurirati smernice uz očuvanje postojeće vrednosti brenda.",
  },
  {
    question: "Koliko koncepata logotipa nudite?",
    answer:
      "Obično isporučujemo 2-3 različita kreativna pravca, zatim iteriramo najjači sa vašim timom.",
  },
  {
    question: "Da li radite naming i messaging?",
    answer:
      "Apsolutno. Pozicioniranje i verbalni identitet su ključni delovi procesa, uključujući podršku za naming.",
  },
  {
    question: "Koje isporuke su uključene?",
    answer:
      "Očekujte brand book, paket logotipa, specifikacije tipografije i boja, template-e i asset kit spreman za lansiranje.",
  },
  {
    question: "Ko treba da učestvuje u radionicama?",
    answer:
      "Osnivači, marketing lideri i product stakeholder-i su idealni kako bi odluke odražavale celu poslovnu sliku.",
  },
  {
    question: "Možete li podržati rollout kroz timove?",
    answer:
      "Da. Isporučujemo enablement sesije, dokumentaciju i template-e kako bi interni timovi ostali konzistentni.",
  },
  {
    question: "Koliko košta angažman?",
    answer:
      "Brand programi počinju definisanim sprintom ili mesečnim retainer-om, u zavisnosti od opsega i obima asset-a.",
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

const Branding = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <>
      <PageHero {...detail} />

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container relative flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Opseg ukratko</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Brending koji drži svaku tačku kontakta usklađenom
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Od ranog pozicioniranja do globalnih rollout-a, gradimo brand sisteme kroz koje marketing, product i prodaja govore jednim glasom.
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
              <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">Kako oblikujemo vaš brend</h2>
              <p className="text-base leading-relaxed text-theme-muted">
                Spajamo istraživanje, kreativni pravac i egzekuciju kako bismo isporučili brand sistem koji timovi mogu odmah da koriste.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Pozicioniranje", "Ton brenda", "Vizuelni identitet", "Knjiga standarda", "Šabloni", "Paket za lansiranje"].map(
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
                <h3 className="text-xl font-semibold text-theme-primary">Preuzmite naš branding playbook</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Dobijte agendu brand sprinta, messaging framework i rollout checklist-u. Savršeno za stakeholder-e koji žele jasnoću pre kickoff-a.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.6em] text-theme-muted">Naš branding tok</span>
                <span className="text-xs uppercase tracking-[0.3em] text-theme-muted opacity-80 sm:text-right">
                  Prevucite da istražite svaku fazu
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
              Brand partneri koji usklađuju priču, dizajn i egzekuciju
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Spajamo strateško pozicioniranje sa praktičnom produkcijom kako bi se brend jasno pojavio gde god vas publika sretne.
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
            <h2 className="text-2xl font-semibold text-theme-primary md:text-3xl">Brand ishodi i metrike isporuke</h2>
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
              <Compass className="h-4 w-4 text-cyan-400" aria-hidden />
              Radionice pozicioniranja
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Palette className="h-4 w-4 text-cyan-400" aria-hidden />
              Sistemi vizuelnog identiteta
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-3 py-1">
              <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden />
              Asset-i spremni za lansiranje
            </span>
          </div>
        </div>
      </section>

      <section className="site-gutter theme-section py-20 sm:py-24 transition-theme">
        <div className="site-container flex flex-col gap-10 lg:gap-12">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs uppercase tracking-[0.6em] text-cyan-400">Proces / putanja</span>
            <h2 className="text-3xl font-semibold text-theme-primary md:text-4xl">
              Put od priče do sistema
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Jasne prekretnice drže stakeholder-e usklađenim i olakšavaju odobravanje brand odluka.
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
              Brinemo o brendu dugo posle lansiranja
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Brendovi evoluiraju sa proizvodom i tržištem. Ostajemo uključeni da smernice budu aktuelne, a timovi usklađeni.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:items-start">
            <div className="rounded-3xl border border-theme/70 theme-card p-6 shadow-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-[0_28px_80px_-48px_rgba(56,189,248,0.5)] translate-y-0">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                <GaugeCircle className="h-5 w-5 text-cyan-400" aria-hidden />
                Pregled brend podrške
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-theme-muted">
                Stalnu podršku usklađujemo sa vašim release ritmom, osiguravajući da update-i, kampanje i novi proizvodi ostanu vizuelno konzistentni.
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
              Česta pitanja o našim branding uslugama
            </h2>
            <p className="text-base leading-relaxed text-theme-muted">
              Odgovori na pitanja koja najčešće čujemo od osnivača, marketing lidera i product timova koji planiraju osveženje brenda.
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
            Izgradimo brand sistem koji se skalira sa vašim proizvodom
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-theme-muted">
            Recite nam gde vaš brend stoji danas i gde ide dalje, a mi ćemo kreirati pozicioniranje i vizuelni sistem koji svako lansiranje drži kohezivnim.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaButton href="/contact?intent=brand-sprint">
              <Sparkles className="h-4 w-4" aria-hidden />
              Pokrenite brand sprint
            </CtaButton>
            <CtaButton href="/projects" variant="secondary">
              <BadgeCheck className="h-4 w-4 text-cyan-400" aria-hidden />
              Pogledajte identity radove
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

export default Branding;


