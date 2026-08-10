import {
  Code2,
  GaugeCircle,
  LayoutDashboard,
  Network,
  Shield,
  Workflow,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const webDevelopment: ServicePageContent = {
  slug: "web-development",

  hero: {
    eyebrow: "Inženjerska izvrsnost",
    title: "Web platforme projektovane za rast i otpornost",
    lede: "Od marketing sajtova koji konvertuju do kompleksnih SaaS tokova rada, arhitektujemo održiva iskustva sa performansama, observability-jem i skalabilnošću od prvog sprinta.",
    ctas: [
      { href: "/contact", label: "Pokrenite izradu" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "<2s", label: "Cilj za prvi prikaz" },
    { value: "99.9%", label: "SLO dostupnosti" },
    { value: "4 ned.", label: "Rok za MVP lansiranje" },
    { value: "+40%", label: "Prosečan rast konverzije" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Platforme, ne stranice",
      lede: "Od composable CMS temelja do edge compute-a: šest oblasti u kojima platforma mora da bude besprekorna.",
    },
    items: [
      {
        title: "Sajtovi i marketing platforme",
        body: "Composable CMS temelji koji growth timovima omogućavaju objavljivanje bez trenja.",
        icon: LayoutDashboard,
      },
      {
        title: "SaaS proizvod i arhitektura",
        body: "TypeScript-first platforme koje ostaju održive dok se korisnička putovanja šire.",
        icon: Code2,
      },
      {
        title: "Edge i serverless funkcije",
        body: "Brzo deploy-ujte i pametno skalirajte latency-sensitive compute tamo gde je važan.",
        icon: Network,
      },
      {
        title: "Performanse i observability",
        body: "Vitals, tracing i alerti su povezani tako da problemi isplivaju pre nego što ih korisnici primete.",
        icon: GaugeCircle,
      },
      {
        title: "Automatizacija i CI/CD alati",
        body: "Pipeline-i, QA zaštitni mehanizmi i DX unapređenja skraćuju svaki release ciklus.",
        icon: Workflow,
      },
      {
        title: "Bezbedne integracije podataka",
        body: "Ojačani API-ji, zero-trust autentifikacija i privacy-first analitika odmah iz kutije.",
        icon: Shield,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Pet faza, nedeljni ritam",
      lede: "Uvek znate gde smo, šta je isporučeno i šta sledi.",
    },
    steps: [
      {
        title: "Discovery i roadmap",
        body: "Auditujemo trenutni stack, mapiramo KPI-jeve i usklađujemo merljive ishode.",
        deliverable: "Arhitektonski brief i prioritizovani backlog",
      },
      {
        title: "Dizajn i prototipovanje",
        body: "Postavljamo UX tokove, sistematizujemo UI i validiramo putanje sa product owner-ima.",
        deliverable: "Komponentni kit i validiran prototip",
      },
      {
        title: "Inženjering i izrada",
        body: "Funkcije stižu u nedeljnim inkrementima uz CI/CD i QA zaštitne mehanizme.",
        deliverable: "Production-ready inkrementi i release notes",
      },
      {
        title: "Lansiranje i iteracija",
        body: "Koordiniramo release-e, instrumentujemo analitiku i aktiviramo automatizaciju.",
        deliverable: "Go-live checklist-a i tracking dashboard-i",
      },
      {
        title: "Monitoring i skaliranje",
        body: "Pratimo vitals, podešavamo infrastrukturu i isporučujemo unapređenja na osnovu podataka.",
        deliverable: "Mesečni pregled performansi",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "Razlika se vidi u drugoj godini",
      lede: "Sve izgleda dobro na demo-u. Nas zanima kako se platforma ponaša kada poraste.",
    },
    items: [
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
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Isporuka koja ne prestaje lansiranjem",
    },
    items: [
      "Mesečni pregled performansi i Core Web Vitals-a sa action item-ima.",
      "Održavanje observability dashboard-a, sintetičkih testova i alert routinga.",
      "Kontinuirani backlog grooming usklađen sa GTM eksperimentima i OKR-ovima.",
      "Profilisanje Edge funkcija i preporuke za optimizaciju troškova.",
      "Bezbednosne zakrpe, nadogradnje zavisnosti i automatizovani QA zaštitni mehanizmi.",
      "Dokumentacija i onboarding za vaš interni tim.",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "GraphQL",
      "PostgreSQL",
      "Playwright",
      "Vercel",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
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
  ],

  finalCta: {
    title: "Spremni za platformu koja drži korak?",
    body: "Recite nam šta gradite — vraćamo se sa planom, timom i rokom u roku od 48 sati.",
    ctas: [
      { href: "/contact", label: "Pokrenite izradu" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "Izrada web sajtova i platformi — Enigma Digital",
    description:
      "Next.js i TypeScript platforme sa performansama, observability-jem i skalabilnošću od prvog sprinta. Od marketing sajta do SaaS proizvoda.",
  },
};
