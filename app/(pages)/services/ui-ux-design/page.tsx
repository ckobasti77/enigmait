'use client';

import { useEffect, useState } from "react";
import PageHero from "@/app/_components/PageHero";
import { serviceDetails } from "@/constants/serviceDetails";
import { Button } from "@/components/ui/button";
import CtaButton from "@/components/ui/cta-button";
import {
  Accessibility,
  ArrowRight,
  Compass,
  Frame,
  Heart,
  Layers,
  MousePointerClick,
  Palette,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

const detail = serviceDetails["ui-ux-design"];

const designNarrative = [
  "Interfejse dizajniramo oko ljudi, ne oko ekrana. Svaki koncept počinje kvalitativnim istraživanjem, razgovorima uživo i mapiranjem ponašanja kako bismo interfejs uskladili sa namerom, emocijom i kontekstom korisnika.",
  "Empatija, upotrebljivost i glas brenda spajaju se dok storyboard-ujemo tokove, prototipujemo interakcije i testiramo poruke sa stvarnim korisnicima. Rezultat je proizvod koji deluje prirodno i svrhovito, ne samo pixel-perfect.",
  "Naši vizuelni sistemi proširuju vaš brend. Tipografija, ilustracije i obrasci interakcije ostaju kohezivni kroz platforme, pa timovi isporučuju konzistentno dok korisnici osećaju jasan i siguran identitet.",
];

const processVisuals = [
  {
    stage: "Wireframe mapa empatije",
    description: "Low-fidelity tokovi usklađuju stakeholder-e pre nego što se obavežemo na vizuale.",
    accent: "from-slate-900 via-slate-800 to-slate-900",
    badge: "Wireframe",
  },
  {
    stage: "High-fidelity dizajn brenda",
    description: "Komponentizovani UI koji spaja vašu paletu, tipografiju i glas.",
    accent: "from-rose-500/20 via-fuchsia-500/10 to-cyan-400/10",
    badge: "Vizuelni dizajn",
  },
  {
    stage: "Prototip i motion studija",
    description: "Interaktivni prototipovi sa dokumentovanim motion stanjima i mikrointerakcijama.",
    accent: "from-cyan-500/30 via-sky-400/20 to-violet-500/20",
    badge: "Prototip",
  },
];

const journeyPhases = [
  {
    phase: "Svest",
    headline: "Razjasnite vrednost na prvi pogled",
    touchpoints: ["Hero narativi landing strana", "Onboarding modali za konkretne oglase"],
  },
  {
    phase: "Razmatranje",
    headline: "Vodite istraživanje jasnoćom",
    touchpoints: ["Interaktivni product tour-ovi", "Comparison grid-ovi i proof point-i"],
  },
  {
    phase: "Odluka",
    headline: "Smanjite trenje u trenutku izbora",
    touchpoints: ["Progresivni checkout tokovi", "Widget-i pomoći u realnom vremenu"],
  },
  {
    phase: "Retencija",
    headline: "Održite zamah posle konverzije",
    touchpoints: ["Lifecycle email template-i", "In-app podsticaji i success dashboard-i"],
  },
];

const journeyCallouts = [
  {
    label: "Mikrointerakcije",
    copy: "Prijatne tranzicije i taktilni feedback pojačavaju ključne akcije.",
    desktopPosition: "sm:top-10 sm:left-[12%]",
    mobilePosition: "top-6 left-6",
  },
  {
    label: "Provera pristupačnosti",
    copy: "Tokovi spremni za WCAG 2.2 AA, testiranje kontrasta i validirane putanje tastaturom.",
    desktopPosition: "sm:top-[46%] sm:left-[52%]",
    mobilePosition: "top-1/2 left-1/2",
  },
  {
    label: "Emocionalno relevantan micro-copy",
    copy: "Copy oblikovan bihejvioralnom naukom da održi visok zamah.",
    desktopPosition: "sm:bottom-12 sm:right-[12%]",
    mobilePosition: "bottom-6 right-6",
  },
];

const beforeAfterProjects = [
  {
    title: "Redizajniran onboarding tok",
    metric: "45% pad napuštanja",
    before: "Gusta forma od 8 koraka bez signala napretka.",
    after: "Vođeno progresivno profilisanje uz kontekstualne tooltip-ove.",
  },
  {
    title: "E-commerce product detail strana",
    metric: "22% rast add-to-cart stope",
    before: "Statične tabele specifikacija i preopširan sadržaj za poređenje.",
    after: "Narativni layout sa sticky pomagačima odluke i social proof-om.",
  },
  {
    title: "SaaS analytics dashboard",
    metric: "30% rast nedeljno aktivnih korisnika",
    before: "Kompleksno filtriranje sa nekonzistentnom vizuelnom hijerarhijom.",
    after: "Modularne kartice, sačuvani prikazi i adaptivno tematizovanje po ulogama.",
  },
  {
    title: "Redizajn mobilnog bankarstva",
    metric: "60% rast završavanja zadataka",
    before: "Fragmentirana navigacija i skrivene brze akcije.",
    after: "Prečice po ulogama, biometrijski ulaz i kontekstualni podsticaji.",
  },
];

const accessibilityChecklist = [
  "Odnosi kontrasta boja provereni prema WCAG 2.2 AA.",
  "Keyboard-first navigacione putanje i upravljanje fokusom.",
  "Semantika za screen reader-e sa aria-label-ima i live regions.",
  "Responzivna tipografija i razmaci za čitljivost na svim uređajima.",
  "Poštovanje motion preferencija kroz reduced motion stanja.",
];

const prototypeSteps = [
  {
    title: "Skica i wireframe",
    description: "Mapiramo tokove zadataka, storyboard putanje i usklađujemo metrike uspeha.",
    icon: Compass,
  },
  {
    title: "High-fidelity dizajn",
    description: "Gradimo layout-e vođene komponentama u Figmi sa sistemskim tokenima.",
    icon: Palette,
  },
  {
    title: "Interaktivni prototip",
    description: "Animiramo u Figmi i Framer-u, slojevito dodajemo mikrointerakcije i pripremamo dev beleške.",
    icon: MousePointerClick,
  },
  {
    title: "Usability testiranje i iteracija",
    description: "Testiramo sa 5-7 korisnika, pregledamo heatmap-e i prioritizujemo dorade.",
    icon: Workflow,
  },
];

const uxMetrics = [
  { value: "+30%", label: "Vreme na zadatku", description: "Korisnici ostaju angažovani kroz bogatije, personalizovane tokove." },
  { value: "-25%", label: "Stopa grešaka", description: "Poboljšana validacija i feedback loop-ovi smanjuju skupe greške." },
  { value: "+18 pts", label: "NPS poeni", description: "Redizajni vođeni iskustvom podstiču merljivu lojalnost brendu." },
];

const industryInsights = [
  {
    industry: "SaaS dashboard-i",
    challenge: "Preoblikovali smo kompleksnu analitiku za netehničke operatere.",
    outcome: "Isporučili smo modularnu biblioteku uvida sa brzim akcijama po ulogama.",
  },
  {
    industry: "E-commerce",
    challenge: "Pojednostavili smo discovery za 3k+ SKU-ova kroz mobilne površine.",
    outcome: "Uveli smo vođenu orijentaciju, bundle builder-e i trust vizuale.",
  },
  {
    industry: "Fintech",
    challenge: "Saželi smo KYC za mobilne korisnike na regulisanim tržištima.",
    outcome: "Implementirali smo skeniranje dokumenata, progress stanja i live support eskalaciju.",
  },
  {
    industry: "Enterprise platforme",
    challenge: "Ujedinili smo različite interne alate u koherentan workspace.",
    outcome: "Isporučili smo dizajn sistem sa API-driven UI kit-om i governance modelom.",
  },
  {
    industry: "Zdravlje i wellness",
    challenge: "Podstakli smo formiranje navika bez preopterećenja korisnika.",
    outcome: "Kreirali smo empatične podsticaje, daily streak mehanike i inkluzivne vizuale.",
  },
  {
    industry: "Obrazovne platforme",
    challenge: "Ujedinili smo sadržaj kurikuluma sa adaptivnim putanjama učenja.",
    outcome: "Isporučili smo dashboard-e svesne napretka i lesson template-e sa pristupačnošću na prvom mestu.",
  },
];

const workshopHighlights = [
  "Dvodnevni remote design sprint za validaciju north-star putanja.",
  "Nedeljni co-creation lab-ovi za copy, motion i odluke o komponentama.",
  "Live whiteboarding sa cross-functional timovima u FigJam-u i Miro-u.",
];

const testimonial = {
  quote:
    "\"Enigma nije samo predstavila novi interfejs - stavili su naš tim u dizajn proces. Radionice su svaku odluku učinile transparentnom i stakeholder-i su se osećali saslušano sve vreme.\"",
  author: "Leah Morton",
  role: "VP Product, Northwind Ventures",
};

const microEngagements = [
  {
    label: "Zakažite 30-minutne konsultacije za design sprint",
    description: "Dovedite product lead-a i zajedno ćemo razraditi jedno korisničko putovanje.",
    href: "/contact?intent=design-sprint",
  },
  {
    label: "Zatražite snapshot usability audita",
    description: "Analiziraćemo trenutni tok i vratiti heuristički scorecard.",
    href: "/contact?intent=usability-audit",
  },
  {
    label: "Preuzmite starter template za UI kit",
    description: "Pokrenite dizajn sistem sa tokenima i komponentnim scaffold-ima spremnim za upotrebu.",
    href: "/assets/downloads/uiux-accessibility-checklist.pdf",
  },
];

const UiUxDesign = () => {
  const [activeIndustry, setActiveIndustry] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndustry((prev) => (prev + 1) % industryInsights.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <PageHero {...detail} />
      <main className="site-gutter theme-section transition-theme text-theme-primary">
        <section className="site-container py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-theme-muted">
                <Heart className="h-3.5 w-3.5 text-rose-400" aria-hidden />
                Naša dizajn filozofija
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-theme-primary sm:text-4xl">
                Dizajn filozofija i pristup koji počinje od ljudi
              </h2>
              <div className="space-y-4 text-base text-theme-muted sm:text-lg">
                {designNarrative.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {processVisuals.map((visual) => (
                <div
                  key={visual.stage}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-theme/35 theme-card p-5 shadow-theme/30 transition-all duration-500 ease-out hover:-translate-y-2 translate-y-0"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${visual.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-30`}
                    aria-hidden
                  />
                  <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                    <span className="inline-flex w-fit items-center rounded-full border border-theme/30 bg-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-theme-muted">
                      {visual.badge}
                    </span>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-theme-primary">{visual.stage}</h3>
                      <p className="text-sm leading-relaxed text-theme-muted">{visual.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container relative pb-20">
          <div className="relative overflow-hidden rounded-[40px] border border-theme/40 theme-card px-6 py-12 shadow-theme/25 sm:px-12">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-theme-muted">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
                  Mapa korisničkog putovanja
                </span>
                <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">Koreografišemo celo UX putovanje</h2>
                <p className="text-base text-theme-muted">
                  Awareness -&gt; Consideration -&gt; Decision -&gt; Retention je više od funnel-a. Dizajniramo namerne touchpoint-e u svakoj fazi kako bi se korisnici osećali vođeno, podržano i sigurno, što vodi ka većim konverzijama i dugoročnoj lojalnosti.
                </p>
              </div>
            </header>

            <div className="relative mt-12 grid gap-6 sm:grid-cols-4">
              {journeyPhases.map((item) => (
                <div
                  key={item.phase}
                  className="group rounded-3xl border border-theme/35 theme-card p-6 shadow-theme/10 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-theme/60 translate-y-0"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-theme-muted">
                    <Timer className="h-4 w-4 text-cyan-400" aria-hidden />
                    {item.phase}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-theme-primary">{item.headline}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-theme-muted">
                    {item.touchpoints.map((touchpoint) => (
                      <li key={touchpoint} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400/80" />
                        {touchpoint}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {journeyCallouts.map((callout) => (
                <div
                  key={callout.label}
                  className={`pointer-events-none absolute hidden max-w-[220px] rounded-2xl border border-theme/40 theme-overlay p-4 text-xs text-theme-primary shadow-theme/30 sm:block ${callout.desktopPosition} ${callout.mobilePosition}`}
                >
                  <p className="font-semibold uppercase tracking-[0.2em] text-theme-primary/80">{callout.label}</p>
                  <p className="mt-2 text-[13px] text-theme-muted">{callout.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="flex flex-col gap-6 pb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-theme-muted">
              <Layers className="h-4 w-4 text-rose-400" aria-hidden />
              Galerija pre i posle
            </span>
            <h2 className="max-w-3xl text-3xl font-semibold text-theme-primary sm:text-4xl">
              Pogledajte razliku: product putovanja pre i posle našeg UI unapređenja
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {beforeAfterProjects.map((project) => (
              <div
                key={project.title}
                className="group relative flex h-full flex-col gap-6 overflow-hidden rounded-[32px] border border-theme/40 theme-card p-6 shadow-theme/20 transition-all duration-500 ease-out hover:-translate-y-2 translate-y-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold text-theme-primary">{project.title}</h3>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500">
                    {project.metric}
                  </span>
                </div>
                <div className="grid gap-4 rounded-3xl border border-theme/30 bg-muted/40 p-4 sm:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-theme/30 bg-card/70 p-4 shadow-theme/10 transition-all duration-500 ease-out group-hover:-translate-y-2 translate-y-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">Pre</p>
                    <p className="text-sm leading-relaxed text-theme-muted">{project.before}</p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-theme/30 bg-card p-4 shadow-theme/10 transition group-hover:translate-y-1 translate-y-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-primary">Posle</p>
                    <p className="text-sm leading-relaxed text-theme-primary/80">{project.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-theme/40 theme-card p-8 shadow-theme/20">
              <div className="flex flex-col gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-theme-muted">
                  <Accessibility className="h-4 w-4 text-cyan-400" aria-hidden />
                  Dizajn za sve
                </span>
                <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">Pristupačnost i inkluzivni dizajn</h2>
                <p className="text-base text-theme-muted">
                  Pristupačnost nije stvar pregovora. Inkluzivne prakse ugrađujemo kroz istraživanje, dizajn i razvoj kako bi svaki korisnik mogao potpuno da učestvuje, bez obzira na sposobnost, kontekst ili uređaj.
                </p>
              </div>
              <ul className="mt-6 grid gap-3 text-sm text-theme-muted sm:grid-cols-2">
                {accessibilityChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-theme/30 bg-card/70 p-3">
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cyan-400/80" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <CtaButton
                  href="/assets/downloads/uiux-accessibility-checklist.pdf"
                  variant="secondary"
                  size="lg"
                  target="_blank"
                  rel="noopener"
                >
                  Preuzmite checklist-u pristupačnosti
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </CtaButton>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-[32px] border border-theme/40 theme-card p-8 shadow-theme/20">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-theme-muted">
                  Vizuelni identitet u UX-u
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-theme-primary">Integracija brenda i vizuelnog identiteta</h3>
                <p className="mt-3 text-sm text-theme-muted">
                  Brand smernice prevodimo u fleksibilne UI biblioteke kako bi marketing, product i engineering govorili istim vizuelnim jezikom. Svaka komponenta i stanje proširuju brend, ne razvodnjavaju ga.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-theme/30 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">Sastojci brenda</p>
                  <div className="mt-3 space-y-2 text-sm text-theme-muted">
                    <p>- Logo lockup-i za svetlu/tamnu temu</p>
                    <p>- Tipografski parovi i skale tokena</p>
                    <p>- Reference za motion i ilustraciju</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-theme/30 bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-primary">Isporuka UI sistema</p>
                  <div className="mt-3 space-y-2 text-sm text-theme-primary/80">
                    <p>- Component kit sa tokenizovanim temama</p>
                    <p>- Specifikacije interakcija i developer dokumentacija</p>
                    <p>- QA checklist-e za glatku predaju</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="rounded-[32px] border border-theme/40 theme-card p-10 shadow-theme/20">
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-theme-muted">
                <Frame className="h-4 w-4 text-cyan-300" aria-hidden />
                Prototipovanje i testiranje
              </span>
              <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">Od ideje do validacije u četiri koraka</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {prototypeSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative flex flex-col gap-4 rounded-3xl border border-theme/30 bg-card/80 p-6 shadow-theme/10 transition-all duration-500 ease-out hover:-translate-y-2 translate-y-0"
                >
                  <div className="flex size-12 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-500">
                    <step.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-muted">
                      Korak {index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-theme-primary">{step.title}</h3>
                    <p className="mt-3 text-sm text-theme-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="grid gap-10 rounded-[32px] border border-theme/40 theme-card p-10 shadow-theme/20 md:grid-cols-[1fr,1.1fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-theme-muted">
                <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />
                UX metrike i uticaj
              </span>
              <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">Kako izgleda uspeh</h2>
              <p className="text-base text-theme-muted">
                Dizajn odluke povezujemo sa merljivim ishodima. Tokom svakog angažmana vezujemo metrike za poslovne ciljeve, pratimo ih iz nedelje u nedelju i delimo dashboard-e da znate gde se uticaj dešava.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {uxMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-theme/30 bg-card/85 p-6 text-center shadow-theme/10"
                >
                  <p className="text-3xl font-semibold text-theme-primary">{metric.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">{metric.label}</p>
                  <p className="mt-3 text-sm text-theme-muted">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="rounded-[32px] border border-theme/40 theme-card p-10 shadow-theme/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-theme-muted">
                  Fokus po industriji
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-theme-primary sm:text-4xl">
                  UI/UX prilagođen vašoj industriji
                </h2>
                <p className="mt-2 max-w-xl text-sm text-theme-muted">
                  Svaki sektor ima sopstvene signale poverenja i tačke trenja. Prikazujemo industrije koje opslužujemo da istražite realne scenarije, zatim kliknete karticu za detalje.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-theme bg-transparent text-theme-primary hover:bg-muted"
                  onClick={() =>
                    setActiveIndustry((prev) => (prev - 1 + industryInsights.length) % industryInsights.length)
                  }
                >
                  &lt;
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-theme bg-transparent text-theme-primary hover:bg-muted"
                  onClick={() => setActiveIndustry((prev) => (prev + 1) % industryInsights.length)}
                >
                  &gt;
                </Button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {industryInsights.map((item, index) => {
                const active = index === activeIndustry;
                return (
                  <button
                    key={item.industry}
                    type="button"
                    className={`group flex h-full flex-col justify-between rounded-3xl border p-6 text-left transition ${
                      active
                        ? "border-cyan-400/70 bg-card shadow-theme/25"
                        : "border-theme/30 bg-card/70 hover:border-cyan-400/50 hover:bg-card"
                    }`}
                    onClick={() => setActiveIndustry(index)}
                    aria-pressed={active}
                  >
                    <div className="space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">
                        {item.industry}
                      </p>
                      <p className="text-base font-semibold text-theme-primary">{item.challenge}</p>
                      <p className="text-sm text-theme-muted">{item.outcome}</p>
                    </div>
                    <div
                      className={`mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] ${
                        active ? "text-theme-primary" : "text-cyan-500"
                      }`}
                    >
                      Pogledaj uvid
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {industryInsights.map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === activeIndustry ? "bg-cyan-400" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="site-container pb-20">
          <div className="grid gap-8 rounded-[32px] border border-theme/40 theme-card p-10 shadow-theme/20 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-theme-muted">
                <Users className="h-4 w-4 text-rose-400" aria-hidden />
                Sarađujemo - vi ste deo tima
              </span>
              <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">Klijentske radionice i zajedničko kreiranje</h2>
              <p className="text-base text-theme-muted">
                Saradnja je ugrađena u naš ritam. Od discovery faze do lansiranja, naš dizajn tim vodi radionice koje spajaju product, marketing i engineering kako bi odluke bile zajedničke, ne samo predate.
              </p>
              <ul className="space-y-3 text-sm text-theme-muted">
                {workshopHighlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-rose-400/70" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-[32px] border border-theme/30 bg-card/80 p-8 shadow-theme/15">
              <div>
                <div className="rounded-3xl border border-theme/30 bg-card p-4 text-sm text-theme-muted shadow-theme/10">
                  <p>
                    <strong className="text-theme-primary">Snapshot radionice:</strong> FigJam board u realnom vremenu sa mapiranjem putovanja, voting dot-ovima i copywriting slojevima. Remote učesnici sarađuju asinhrono dok dokumentujemo odluke za predaju.
                  </p>
                </div>
              </div>
              <blockquote className="rounded-3xl border border-rose-400/40 bg-rose-400/10 p-6 text-sm text-theme-primary">
                <p>{testimonial.quote}</p>
                <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">
                  {testimonial.author} - {testimonial.role}
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="site-container pb-24">
          <div className="relative overflow-hidden rounded-[32px] border border-theme/40 theme-card p-10 shadow-theme/25">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.34em] text-theme-muted">
                  Sledeći koraci i mikroangažman
                </span>
                <h2 className="text-3xl font-semibold text-theme-primary sm:text-4xl">
                  Spremni da istražimo vaš sledeći dizajn potez?
                </h2>
                <p className="text-base text-theme-muted">
                  Izaberite način angažovanja. Bilo da želite zajednički sprint, audit ili starter kit, odgovorićemo u roku od 24 sata sa sledećim koracima.
                </p>
              </div>
              <div className="grid gap-4">
                {microEngagements.map((option) => (
                  <div key={option.label} className="rounded-3xl border border-theme/30 bg-card/80 p-5 shadow-theme/10">
                    <h3 className="text-base font-semibold text-theme-primary">{option.label}</h3>
                    <p className="mt-2 text-sm text-theme-muted">{option.description}</p>
                    <CtaButton href={option.href} size="lg" className="mt-4">
                      Hajde da počnemo
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </CtaButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default UiUxDesign;
