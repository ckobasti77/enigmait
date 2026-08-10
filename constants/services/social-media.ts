import {
  MessageSquare,
  Megaphone,
  SignalHigh,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import type { ServicePageContent } from "./types";

export const socialMedia: ServicePageContent = {
  slug: "social-media",

  hero: {
    eyebrow: "Zajednica i sadržaj",
    title: "Neka svaka tačka kontakta zasluži pažnju",
    lede: "Strategija kampanja, materijali spremni za kreatore i analitički loop-ovi grade angažovane zajednice na platformama koje su vam važne.",
    ctas: [
      { href: "/contact", label: "Pokrenite kampanju" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  stats: [
    { value: "5x", label: "Rast angažovanja" },
    { value: "24h", label: "Rok za kreativu" },
    { value: "12", label: "Kampanje po kvartalu" },
    { value: "2x", label: "Rast pratilaca" },
  ],

  capabilities: {
    intro: {
      kicker: "Opseg ukratko",
      title: "Ceo engine, ne pojedinačne objave",
      lede: "Šest oblasti koje kanale drže žive, a zajednicu angažovanu.",
    },
    items: [
      {
        title: "Strategija kanala i ton",
        body: "Izbor platformi, smernice glasa i content stubovi građeni oko vaše publike.",
        icon: Target,
      },
      {
        title: "Produkcija sadržaja i motion",
        body: "Kratki video formati, carousel objave i kreativni materijali dizajnirani za svaku platformu.",
        icon: Sparkles,
      },
      {
        title: "Upravljanje zajednicom",
        body: "Engagement playbook-ovi, smernice moderacije i response workflow-i.",
        icon: MessageSquare,
      },
      {
        title: "Plaćena promocija i amplifikacija",
        body: "Planiranje kampanja, targeting i optimizacija za širenje dosega.",
        icon: Megaphone,
      },
      {
        title: "Creator partnerstva",
        body: "Influencer brief-ovi, outreach ka kreatorima i brand-safe saradnje.",
        icon: Users,
      },
      {
        title: "Izveštavanje i uvidi",
        body: "Dashboard-i, analiza trendova i praćenje eksperimenata koji vode strategiju.",
        icon: SignalHigh,
      },
    ],
  },

  process: {
    intro: {
      kicker: "Proces",
      title: "Ritam koji kanale drži živim",
    },
    steps: [
      {
        title: "Discovery i glas",
        body: "Auditujemo kanale, definišemo glas i usklađujemo ciljeve.",
        deliverable: "Voice guide i audit kanala",
      },
      {
        title: "Planiranje sadržaja",
        body: "Gradimo content kalendar vezan za lansiranja, događaje i KPI-jeve.",
        deliverable: "90-dnevni content kalendar",
      },
      {
        title: "Produkcija i zakazivanje",
        body: "Kreiramo asset-e, pišemo copy i zakazujemo objave kroz kanale.",
        deliverable: "Asset biblioteka i publishing plan",
      },
      {
        title: "Zajednica i plaćena promocija",
        body: "Angažujemo zajednicu i lansiramo ciljane paid kampanje.",
        deliverable: "Engagement playbook i paid testovi",
      },
      {
        title: "Izveštavanje i iteracija",
        body: "Pregledamo performanse, testiramo nove ideje i doterujemo kalendar.",
        deliverable: "Performance dashboard i test log",
      },
    ],
  },

  differentiators: {
    intro: {
      kicker: "Zašto mi",
      title: "Engine, ne improvizacija",
      lede: "Kanali koji rastu imaju sistem iza sebe: kalendar, kreativu i brojke u istom ritmu.",
    },
    items: [
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
    ],
  },

  deliverables: {
    intro: {
      kicker: "Šta dobijate",
      title: "Sistem koji vaš tim nasleđuje",
    },
    items: [
      "Nedeljno planiranje sadržaja i mapiranje trendova.",
      "Dnevni monitoring sa smernicama odgovora i escalation paths.",
      "Osvežavanje kreative i update-i evergreen biblioteke.",
      "Optimizacija paid budžeta i podešavanje targetinga.",
      "Mesečno izveštavanje sa growth eksperimentima i učenjima.",
      "Ponovljivi playbook-ovi koje vaš tim nasleđuje.",
    ],
    stack: [
      "TikTok",
      "Instagram",
      "LinkedIn",
      "YouTube",
      "Meta Ads",
      "CapCut",
      "Buffer",
    ],
  },

  faqIntro: {
    kicker: "Česta pitanja",
    title: "Ono što nas klijenti prvo pitaju",
  },
  faq: [
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
      question: "Kako merite uspeh?",
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
  ],

  finalCta: {
    title: "Pratioci su početak, zajednica je rezultat",
    body: "Pokrenite kampanju — audit kanala i prvi content kalendar stižu u prvoj nedelji.",
    ctas: [
      { href: "/contact", label: "Pokrenite kampanju" },
      { href: "/projects", label: "Pogledaj radove", variant: "secondary" },
    ],
  },

  seo: {
    title: "Društvene mreže i content — Enigma Digital",
    description:
      "Strategija kanala, produkcija sadržaja i community management. Kreativa za 24 sata i kampanje koje kumuliraju rezultate.",
  },
};
