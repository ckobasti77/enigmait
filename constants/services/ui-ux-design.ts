import {
  Accessibility,
  Frame,
  MousePointerClick,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const uiUxDesign: ServicePageContent = {
  slug: "ui-ux-design",

  hero: {
    eyebrow: "Dizajn sistemi",
    title: "Interfejsi koji svuda deluju prirodno",
    lede: "UX zasnovan na istraživanju, doteran UI i dizajn sistemi koji se skaliraju sa proizvodom. Radimo zajedno sa stakeholder-ima i predajemo čiste tokene, biblioteke i dokumentaciju.",
    ctas: [
      { href: "/contact", label: "Zatražite dizajn radionicu" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "+30%", label: "Vreme na zadatku" },
    { value: "-25%", label: "Stopa grešaka" },
    { value: "+18", label: "NPS poeni" },
    { value: "AA", label: "Osnova pristupačnosti" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Dizajn koji pokriva ceo životni ciklus",
      lede: "Od prvog intervjua do governance modela — svaka faza proizvoda ima svoju dizajn disciplinu.",
    },
    items: [
      {
        title: "Discovery vođen uvidima",
        body: "Jobs-to-be-done intervjui, analiza podataka i radionice zajedničkog rada oblikuju svaku dizajn odluku.",
        icon: Users,
      },
      {
        title: "Dizajn sistemi spremni za razvoj",
        body: "Strukturisani tokeni, varijante komponenti i Figma biblioteke drže dizajnere i inženjere u istom ritmu.",
        icon: Frame,
      },
      {
        title: "Interaktivni prototipovi",
        body: "Animiramo u Figmi i Framer-u, slojevito dodajemo mikrointerakcije i pripremamo dev beleške.",
        icon: MousePointerClick,
      },
      {
        title: "Usability testiranje i iteracija",
        body: "Testiramo sa 5-7 korisnika, pregledamo heatmap-e i prioritizujemo dorade.",
        icon: Workflow,
      },
      {
        title: "Pristupačnost kao standard",
        body: "Tokovi spremni za WCAG 2.2 AA, testiranje kontrasta i validirane putanje tastaturom.",
        icon: Accessibility,
      },
      {
        title: "Mikrointerakcije i motion",
        body: "Prijatne tranzicije i taktilni feedback pojačavaju ključne akcije bez žrtvovanja upotrebljivosti.",
        icon: Sparkles,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Pet koraka od uvida do isporuke",
    },
    steps: [
      {
        title: "Istraživanje i mapa empatije",
        body: "Intervjui, analiza podataka i mapiranje ponašanja usklađuju interfejs sa namerom korisnika.",
        deliverable: "Izveštaj istraživanja i user journey mapa",
      },
      {
        title: "Skica i wireframe",
        body: "Mapiramo tokove zadataka, storyboard putanje i usklađujemo metrike uspeha.",
        deliverable: "Wireframe tokovi i storyboard",
      },
      {
        title: "High-fidelity dizajn",
        body: "Gradimo layout-e vođene komponentama u Figmi sa sistemskim tokenima.",
        deliverable: "UI kit sa sistemskim tokenima",
      },
      {
        title: "Interaktivni prototip",
        body: "Animiramo tokove, dokumentujemo motion stanja i pripremamo beleške za developere.",
        deliverable: "Klikabilni prototip sa motion stanjima",
      },
      {
        title: "Usability testiranje i dorade",
        body: "Testiramo sa stvarnim korisnicima, pregledamo heatmap-e i prioritizujemo iteracije.",
        deliverable: "Heuristički scorecard i prioritizovane dorade",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "Dizajn koji se dokazuje brojkama",
      lede: "Lep interfejs je sporedni efekat. Cilj je iskustvo koje se meri.",
    },
    items: [
      {
        title: "Dizajn oko ljudi, ne oko ekrana",
        body: "Svaki koncept počinje istraživanjem i mapiranjem ponašanja, pa interfejs prati nameru, emociju i kontekst korisnika.",
      },
      {
        title: "Merljivi redizajni",
        body: "45% manji drop-off na onboarding-u, 22% viša add-to-cart stopa, 60% brže završavanje zadataka — redizajn merimo brojkama, ne utiskom.",
      },
      {
        title: "Sistemi koje timovi zaista koriste",
        body: "Tipografija, ilustracije i obrasci interakcije ostaju kohezivni kroz platforme, pa timovi isporučuju konzistentno bez čuvara stila.",
      },
      {
        title: "Radionice, ne prezentacije",
        body: "Design sprintovi, co-creation lab-ovi i live whiteboarding drže stakeholder-e u procesu, a odluke čine transparentnim.",
      },
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Predaja bez nagađanja",
    },
    items: [
      "Izveštaji istraživanja i service blueprint-i.",
      "Figma biblioteke sa tokenima i varijantama komponenti.",
      "Anotirani tokovi i dokumentacija spremna za razvoj.",
      "WCAG 2.2 AA provere kontrasta, fokusa i semantike.",
      "Motion smernice sa reduced-motion stanjima.",
      "Governance model za rast dizajn sistema.",
    ],
    stack: [
      "Figma",
      "FigJam",
      "Framer",
      "Storybook",
      "Miro",
      "Maze",
      "Lottie",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
    {
      question: "Kako izgleda saradnja sa našim product timom?",
      answer:
        "Radimo u nedeljnim ritmovima sa zajedničkim Figma fajlovima, live radionicama i otvorenim decision log-om — vaš tim vidi svaku odluku dok nastaje.",
    },
    {
      question: "Da li radite i istraživanje korisnika?",
      answer:
        "Da. Intervjui, usability testovi sa 5-7 korisnika i analiza postojećih podataka standardni su deo discovery faze.",
    },
    {
      question: "Šta tačno dobijamo na kraju angažmana?",
      answer:
        "Figma biblioteku sa tokenima i komponentama, anotirane tokove, prototipove i dokumentaciju spremnu za razvoj — sve što je inženjerima potrebno da isporuče bez nagađanja.",
    },
    {
      question: "Da li dizajnirate uz postojeći brend?",
      answer:
        "Da. Proširujemo vaš vizuelni identitet u funkcionalan UI sistem, a gde brend ne postoji, radimo uz naš branding tim.",
    },
    {
      question: "Kako obezbeđujete pristupačnost?",
      answer:
        "Kontrast, fokus putanje, semantika i reduced-motion stanja proveravaju se prema WCAG 2.2 AA pre svake predaje.",
    },
    {
      question: "Možete li unaprediti postojeći proizvod bez potpunog redizajna?",
      answer:
        "Da. Usability audit sa heurističkim scorecard-om daje prioritizovanu listu dorada koje tim može isporučivati inkrementalno.",
    },
  ],

  finalCta: {
    title: "Dizajn koji se meri, ne samo dopada",
    body: "Zakažite radionicu — mapiraćemo jedno korisničko putovanje zajedno i pokazati gde iskustvo curi.",
    ctas: [
      { href: "/contact", label: "Zatražite dizajn radionicu" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "UI/UX dizajn — Enigma Digital",
    description:
      "Dizajn sistemi, istraživanje korisnika i prototipovi koji se mere: manji drop-off, veća konverzija i WCAG 2.2 AA pristupačnost.",
  },
};
