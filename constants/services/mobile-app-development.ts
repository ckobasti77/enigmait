import {
  GaugeCircle,
  Server,
  SignalHigh,
  Smartphone,
  Target,
  Workflow,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const mobileAppDevelopment: ServicePageContent = {
  slug: "mobile-app-development",

  hero: {
    eyebrow: "Mobilni proizvod",
    title: "Native iskustva projektovana za zadržavanje korisnika",
    lede: "Od koncepta do App Store lansiranja, isporučujemo iOS i Android proizvode koji spajaju odličan UX sa produkcionim performansama, analitikom i release management-om.",
    ctas: [
      { href: "/contact", label: "Isplanirajte aplikaciju" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "8 ned.", label: "Lansiranje u prodavnicu" },
    { value: "60 fps", label: "Cilj performansi" },
    { value: "99.5%", label: "Sesije bez pada aplikacije" },
    { value: "4.8", label: "Prosečan rast ocene" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Od strategije do store rollout-a",
      lede: "Šest oblasti koje mobilni proizvod mora da pokrije da bi zadržao korisnike.",
    },
    items: [
      {
        title: "Product strategija i opseg",
        body: "Definisanje funkcija i usklađivanje roadmap-a kako bi svako izdanje pomeralo ključne KPI-jeve.",
        icon: Target,
      },
      {
        title: "Cross-platform razvoj",
        body: "React Native ili Flutter build-ovi sa deljenom logikom i native završnicom.",
        icon: Smartphone,
      },
      {
        title: "Native performanse i pristup uređaju",
        body: "Iskustva od 60 fps uz integracije kamere, lokacije i hardvera.",
        icon: GaugeCircle,
      },
      {
        title: "Backend API-ji i integracije",
        body: "Bezbedni servisi, sinhronizacija podataka i third-party integracije građene za skaliranje.",
        icon: Server,
      },
      {
        title: "QA i release management",
        body: "Automatizacija testova, device lab-ovi i predaja u prodavnice rešeni od početka do kraja.",
        icon: Workflow,
      },
      {
        title: "Analitika i lifecycle angažovanje",
        body: "Praćenje događaja, funnel-i i push strategije za rast retencije.",
        icon: SignalHigh,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Od brief-a do prodavnice u pet faza",
    },
    steps: [
      {
        title: "Discovery i validacija",
        body: "Usklađujemo ciljeve, validiramo tokove rada i definišemo roadmap funkcija.",
        deliverable: "Product brief i mapa funkcija",
      },
      {
        title: "UX i prototipovanje",
        body: "Dizajniramo mobile-first tokove sa interaktivnim prototipovima i feedback loop-ovima.",
        deliverable: "Klikabilni prototip i UI kit",
      },
      {
        title: "Inženjering i QA",
        body: "Gradimo, testiramo i iteriramo kroz device lab-ove i automatizovane regression testove.",
        deliverable: "Release candidate build-ovi i QA izveštaji",
      },
      {
        title: "Lansiranje u prodavnici",
        body: "Pripremamo listing-e, privacy disclosure-e i koordiniramo go-live plan.",
        deliverable: "Store listing-i i go-live checklist-a",
      },
      {
        title: "Rast i iteracija",
        body: "Pratimo retenciju, isporučujemo unapređenja i planiramo proširenje funkcija.",
        deliverable: "Roadmap retencije i analytics dashboard",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "Native osećaj, deljena brzina",
      lede: "Cross-platform temelji ubrzavaju isporuku — native UX standardi ostaju netaknuti.",
    },
    items: [
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
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Podrška koja ne staje posle lansiranja",
    },
    items: [
      "Ažuriranja kompatibilnosti OS-a i uređaja za svako izdanje.",
      "Crash monitoring, profilisanje performansi i hotfix odgovor.",
      "Feature flag-ovi, fazni rollout-i i podrška za A/B testiranje.",
      "Optimizacija store listing-a i upravljanje recenzijama.",
      "Pregledi analitike vezani za ciljeve aktivacije i retencije.",
      "Predaja u prodavnice i koordinacija rollout-a bez trenja.",
    ],
    stack: [
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "Expo",
      "Firebase",
      "Fastlane",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
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
      question: "Koliko brzo možemo da počnemo?",
      answer:
        "Discovery može početi u roku od nedelju dana, a MVP plan i roadmap isporučujemo ubrzo posle kickoff-a.",
    },
  ],

  finalCta: {
    title: "Od ideje do App Store-a bez zastoja",
    body: "Recite nam šta gradite — vraćamo plan izdanja i sastav tima u roku od 48 sati.",
    ctas: [
      { href: "/contact", label: "Isplanirajte aplikaciju" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "Izrada mobilnih aplikacija — Enigma Digital",
    description:
      "React Native, Flutter i native iOS/Android timovi. Iskustva od 60 fps, 99.5% sesija bez pada i predaja u prodavnice bez trenja.",
  },
};
