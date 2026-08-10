import {
  BadgeCheck,
  Layers,
  MessageSquare,
  Palette,
  Target,
  Users,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const branding: ServicePageContent = {
  slug: "branding",

  hero: {
    eyebrow: "Identitet brenda",
    title: "Brendovi koji deluju usklađeno od piksela do ambalaže",
    lede: "Pozicioniranje, glas i vizuelni sistemi koji se skaliraju sa proizvodom. Gradimo identitete koji funkcionišu na webu, mobilnim aplikacijama, prezentacijama i prodajnim materijalima.",
    ctas: [
      { href: "/contact", label: "Pokrenite brend sprint" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "4 ned.", label: "Brend sprint" },
    { value: "20+", label: "Isporučeni launch asset-i" },
    { value: "95%", label: "Usklađenost stakeholder-a" },
    { value: "3x", label: "Rast prepoznatljivosti" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Identitet kao sistem, ne kao fajl",
      lede: "Šest oblasti koje brend čine upotrebljivim za svaki tim, na svakoj površini.",
    },
    items: [
      {
        title: "Strategija brenda i pozicioniranje",
        body: "Konkurentski uvidi i jasnoća publike oštre vaš narativ.",
        icon: Target,
      },
      {
        title: "Sistemi vizuelnog identiteta",
        body: "Paketi logotipa, tipografija i sistemi boja koji se skaliraju kroz touchpoint-e.",
        icon: Palette,
      },
      {
        title: "Messaging i verbalni identitet",
        body: "Glas, ton i stubovi poruka koji svaki tim drže usklađenim.",
        icon: MessageSquare,
      },
      {
        title: "Brand arhitektura i naming",
        body: "Jasno imenovanje proizvoda i hijerarhija koja podržava buduća lansiranja.",
        icon: Layers,
      },
      {
        title: "Launch asset-i i enablement",
        body: "Sales deck-ovi, social kit-ovi i template-i za usklađene rollout-e.",
        icon: BadgeCheck,
      },
      {
        title: "Employer brend i kultura",
        body: "Interni narativi i recruiting asset-i koji privlače prave talente.",
        icon: Users,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Pet faza do sistema koji traje",
    },
    steps: [
      {
        title: "Discovery i uvidi",
        body: "Auditujemo trenutni brend, istražujemo konkurente i usklađujemo ciljeve.",
        deliverable: "Brand audit i sažetak istraživanja",
      },
      {
        title: "Pozicioniranje i narativ",
        body: "Definišemo vašu priču, glas i diferencirane stubove poruka.",
        deliverable: "Positioning statement i stubovi poruka",
      },
      {
        title: "Dizajn sistema identiteta",
        body: "Kreiramo pakete logotipa, tipografiju, boje i motion pravce.",
        deliverable: "Paket logotipa i vizuelne smernice",
      },
      {
        title: "Produkcija asset-a i lansiranje",
        body: "Gradimo kolaterale i template-e potrebne timovima za brz rollout.",
        deliverable: "Launch kit i biblioteka template-a",
      },
      {
        title: "Governance i enablement",
        body: "Dokumentujemo upotrebu, obučavamo timove i pripremamo buduća proširenja.",
        deliverable: "Knjiga standarda brenda i obuka timova",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "Brend koji radi posao",
      lede: "Identitet nije poster. Mora da izdrži pitch deck, onboarding i bilbord — istog dana.",
    },
    items: [
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
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Sve što je timu potrebno za rollout",
    },
    items: [
      "Kvartalne provere zdravlja brenda i perception scan-ovi.",
      "Osvežavanje template-a za nove kampanje i lansiranja.",
      "Auditi konzistentnosti brenda kroz web, proizvod i prodajne materijale.",
      "Podrška za naming i arhitekturu novih ponuda.",
      "Upravljanje asset bibliotekom za dizajnere i marketare.",
      "Tokenizovane Figma biblioteke spremne za export.",
    ],
    stack: [
      "Figma",
      "Illustrator",
      "After Effects",
      "Notion",
      "Frontify",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
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
  ],

  finalCta: {
    title: "Identitet koji tim zaista može da koristi",
    body: "Pokrenite sprint — za četiri nedelje imate sistem, smernice i launch kit.",
    ctas: [
      { href: "/contact", label: "Pokrenite brend sprint" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "Brending i vizuelni identitet — Enigma Digital",
    description:
      "Pozicioniranje, vizuelni sistemi i glas brenda koji rade na webu, u aplikaciji i na prezentaciji. Brend sprint od četiri nedelje.",
  },
};
