import {
  BadgeCheck,
  GaugeCircle,
  LayoutDashboard,
  MapPin,
  Search,
  SignalHigh,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const seoGeo: ServicePageContent = {
  slug: "seo-geo",

  hero: {
    eyebrow: "Vidljivost",
    title: "Budite vidljivi tamo gde vas publika traži",
    lede: "Tehnički SEO, geo širenje i arhitektura sadržaja koji kumulativno grade organski rast. Isporučujemo audite, roadmap-e i implementaciju sa vašim ili našim timom.",
    ctas: [
      { href: "/contact", label: "Zatražite SEO audit" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "30%", label: "Cilj rasta saobraćaja" },
    { value: "90d", label: "Ritam roadmap-a" },
    { value: "50+", label: "Optimizovane strane" },
    { value: "12", label: "Podržana tržišta" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Vidljivost je inženjerski problem",
      lede: "Šest oblasti u kojima se organski rast gradi — i zadržava.",
    },
    items: [
      {
        title: "Tehnički SEO audit",
        body: "Crawl analiza, zdravlje indeksa i schema provere otkrivaju skrivene praznine.",
        icon: Search,
      },
      {
        title: "Performanse sajta i crawlability",
        body: "Core Web Vitals i arhitektura sajta podešeni za brzinu i jasnoću.",
        icon: GaugeCircle,
      },
      {
        title: "Arhitektura sadržaja i intent",
        body: "Topic cluster-i, interno linkovanje i page template-i građeni za konverziju.",
        icon: LayoutDashboard,
      },
      {
        title: "Lokalno i geo širenje",
        body: "Lokacijske strane, listing-i i hreflang podešavanja za nova tržišta.",
        icon: MapPin,
      },
      {
        title: "Autoritet i link strategija",
        body: "Digital PR i planiranje backlink-ova usklađeni sa ciljevima rasta.",
        icon: BadgeCheck,
      },
      {
        title: "Izveštavanje i eksperimentisanje",
        body: "Dashboard-i, rank tracking i test loop-ovi koji dokazuju uticaj.",
        icon: SignalHigh,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Kvartalni ritam, nedeljna transparentnost",
    },
    steps: [
      {
        title: "Audit i bazno merenje",
        body: "Pregledamo crawl podatke, pozicije i tehničko zdravlje da definišemo prioritete.",
        deliverable: "Tehnički audit i crawl izveštaj",
      },
      {
        title: "Strategija i roadmap",
        body: "Usklađujemo prilike ključnih reči sa content planovima i product ciljevima.",
        deliverable: "90-dnevni SEO roadmap",
      },
      {
        title: "Implementacija i popravke",
        body: "Isporučujemo tehnička unapređenja i optimizujemo prioritetne landing strane.",
        deliverable: "Backlog popravki i implementation checklist-a",
      },
      {
        title: "Sadržaj i geo širenje",
        body: "Objavljujemo nove strane, lokalne listing-e i prevedena iskustva.",
        deliverable: "Optimizovane strane i geo template-i",
      },
      {
        title: "Izveštavanje i iteracija",
        body: "Merimo uticaj, pokrećemo eksperimente i ažuriramo roadmap.",
        deliverable: "Dashboard-i performansi i log eksperimenata",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "SEO koji inženjeri shvataju ozbiljno",
      lede: "Dve publike, jedna arhitektura: crawleri i AI pretrage.",
    },
    items: [
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
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Kontinuitet koji rast čini kumulativnim",
    },
    items: [
      "Mesečno praćenje pozicija i izveštavanje o vidljivosti.",
      "Ciklusi osvežavanja sadržaja i ažuriranja internog linkovanja.",
      "Tehničke health provere za indeksiranje i Core Web Vitals.",
      "Update-i lokalnih listing-a i smernice za odgovore na recenzije.",
      "Praćenje algorithm update-a i planovi brzog odgovora.",
      "Struktuirani podaci i schema markup za AI pretrage.",
    ],
    stack: [
      "Search Console",
      "Ahrefs",
      "Screaming Frog",
      "GA4",
      "Looker Studio",
      "Schema.org",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
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
      question: "Kako merite uspeh?",
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
  ],

  finalCta: {
    title: "Rast koji se kumulira iz meseca u mesec",
    body: "Zatražite audit — vraćamo tehnički izveštaj i 90-dnevni roadmap sa jasnim prioritetima.",
    ctas: [
      { href: "/contact", label: "Zatražite SEO audit" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "SEO i GEO optimizacija — Enigma Digital",
    description:
      "Tehnički SEO za crawlere i strukturirani odgovori za AI pretrage. Auditi, 90-dnevni roadmap i implementacija sa merljivim rastom.",
  },
};
