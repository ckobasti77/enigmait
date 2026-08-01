import type { PageHeroProps } from "@/app/_components/PageHero";
import type { ServiceFloatingKey } from "@/constants/serviceFloatingObjects";
import {
  BadgeCheck,
  Code2,
  Frame,
  Gauge,
  Globe2,
  Megaphone,
  MessageSquare,
  Palette,
  Route,
  Search,
  ShieldCheck,
  SignalHigh,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Server,
} from 'lucide-react';

type ServiceDetail = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: NonNullable<PageHeroProps["metrics"]>;
  highlights: NonNullable<PageHeroProps["highlights"]>;
  ctas: NonNullable<PageHeroProps["ctas"]>;
  footnote?: string;
  floatingServiceKey: ServiceFloatingKey;
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "web-development": {
    floatingServiceKey: "web-development",
    eyebrow: "Inženjerska izvrsnost",
    title: "Web platforme projektovane za rast i otpornost",
    description:
      "Od marketing sajtova koji konvertuju do kompleksnih SaaS tokova rada, arhitektujemo održiva iskustva sa performansama, observability-jem i skalabilnošću od prvog sprinta.",
    metrics: [
      { value: "<2s", label: "Cilj za prvi prikaz" },
      { value: "99.9%", label: "SLO dostupnosti" },
      { value: "4 wks", label: "Rok za MVP lansiranje" },
    ],
    highlights: [
      {
        title: "Stack prilagođen vašoj mapi puta",
        body: "TypeScript-first arhitektura, biblioteke komponenti i CI/CD pipeline-i oblikovani prema znanju i ograničenjima vašeg tima. Dokumentujemo odluke, kodifikujemo obrasce i održavamo čiste handoff-e.",
        icon: Code2,
      },
      {
        title: "Performanse podešene od prvog dana",
        body: "Opsesivno pratimo Core Web Vitals, keširanje i otpornu infrastrukturu kako bi platforma delovala trenutno svakom posetiocu. Budžeti, alerti i provere regresija su deo svakog sprinta.",
        icon: Gauge,
      },
      {
        title: "Bezbedni i merljivi temelji",
        body: "Autentifikacija, logovanje i automatizovani QA zaštitni mehanizmi deo su razvoja kako biste skalirali sa poverenjem. Tracing, audit tragove i incident playbook-e uvodimo rano.",
        icon: Server,
      },
    ],
    ctas: [
      { href: "/contact", label: "Pokrenite izradu" },
      { href: "/projects", label: "Pogledajte inženjerske radove", variant: "secondary" },
    ],
    footnote: "Tehnologije koje biramo: Next.js, Remix, Astro, Playwright, GraphQL, Edge funkcije i platforme koje najbolje odgovaraju vašim ciljevima.",
  },
  "ui-ux-design": {
    floatingServiceKey: "ui-ux-design",
    eyebrow: "Dizajn sistemi",
    title: "Interfejsi koji svuda deluju prirodno",
    description:
      "UX zasnovan na istraživanju, doteran UI i dizajn sistemi koji se skaliraju sa proizvodom. Radimo zajedno sa stakeholder-ima i predajemo čiste tokene, biblioteke i dokumentaciju.",
    metrics: [
      { value: "10+", label: "Korisničke sesije" },
      { value: "3x", label: "Brzina prototipa" },
      { value: "AA", label: "Osnova pristupačnosti" },
    ],
    highlights: [
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
        title: "Izrada koja izdvaja vaš brend",
        body: "Mikrointerakcije, ton komunikacije i vizuelna završnica podižu iskustvo bez žrtvovanja upotrebljivosti.",
        icon: Sparkles,
      },
    ],
    ctas: [
      { href: "/contact", label: "Zatražite dizajn radionicu" },
      { href: "/projects", label: "Pogledajte dizajn transformacije", variant: "secondary" },
    ],
    footnote: "Isporuke obuhvataju izveštaje istraživanja, service blueprint-e, anotirane tokove i dokumentaciju spremnu za razvoj.",
  },
  "mobile-app-development": {
    floatingServiceKey: "mobile-app-development",
    eyebrow: "Mobilni proizvod",
    title: "Native iskustva projektovana za zadržavanje korisnika",
    description:
      "Od koncepta do App Store lansiranja, isporučujemo iOS i Android proizvode koji spajaju odličan UX sa produkcionim performansama, analitikom i release management-om.",
    metrics: [
      { value: "8 wks", label: "Lansiranje u prodavnicu" },
      { value: "60 fps", label: "Cilj performansi" },
      { value: "99.5%", label: "Sesije bez pada aplikacije" },
    ],
    highlights: [
      {
        title: "Cross-platform temelji",
        body: "React Native i Flutter rešenja sa deljenom logikom, native modulima gde je važno i CI-jem spremnim za vaš ritam izdanja.",
        icon: Smartphone,
      },
      {
        title: "Tokovi optimizovani za korisnike u pokretu",
        body: "Offline stanja, push strategije i funnel analitika podešeni su da zadrže angažovanje korisnika gde god se nalazili.",
        icon: Route,
      },
      {
        title: "Bezbednost i usklađenost ugrađeni od početka",
        body: "Sigurno skladištenje, autentifikacija i monitoring od prvog build-a kako biste prošli audite i review aplikacije bez trenja.",
        icon: ShieldCheck,
      },
    ],
    ctas: [
      { href: "/contact", label: "Isplanirajte aplikaciju" },
      { href: "/projects", label: "Pogledajte mobilna lansiranja", variant: "secondary" },
    ],
    footnote: "Pokrivamo release management, optimizaciju prodavnica, povezivanje analitike i rituale potrebne vašem internom timu za kontinuiranu isporuku.",
  },
  "seo-geo": {
    floatingServiceKey: "seo-geo",
    eyebrow: "Vidljivost",
    title: "Budite vidljivi tamo gde vas publika traži",
    description:
      "Tehnički SEO, geo širenje i arhitektura sadržaja koji kumulativno grade organski rast. Isporučujemo audite, roadmap-e i implementaciju sa vašim ili našim timom.",
    metrics: [
      { value: "30%", label: "Cilj rasta saobraćaja" },
      { value: "90d", label: "Ritam roadmap-a" },
      { value: "50+", label: "Optimizovane strane" },
    ],
    highlights: [
      {
        title: "Tehnički temelji",
        body: "Schema, brzina, crawl budžeti i internacionalizacija podešeni su da sajt gradi autoritet.",
        icon: Search,
      },
      {
        title: "Lokalno i geo širenje",
        body: "Lokacijske strane, prevodi i listing upravljanje brzo vas stavljaju pred regionalnu publiku.",
        icon: Globe2,
      },
      {
        title: "Transparentno izveštavanje",
        body: "Dashboard-i prate pozicije, share of voice i uticaj na prihod kako bi svaka optimizacija bila odgovorna.",
        icon: SignalHigh,
      },
    ],
    ctas: [
      { href: "/contact", label: "Zatražite SEO audit" },
      { href: "/projects", label: "Pogledajte priče o rastu", variant: "secondary" },
    ],
    footnote: "Uklapamo se sa vašim content i performance timovima, a eksperimente, uvide i playbook-e držimo u jednom zajedničkom prostoru.",
  },
  branding: {
    floatingServiceKey: "branding",
    eyebrow: "Identitet brenda",
    title: "Brendovi koji deluju usklađeno od piksela do ambalaže",
    description:
      "Pozicioniranje, glas i vizuelni sistemi koji se skaliraju sa proizvodom. Gradimo identitete koji funkcionišu na webu, mobilnim aplikacijama, prezentacijama i prodajnim materijalima.",
    metrics: [
      { value: "4 wks", label: "Brend sprint" },
      { value: "6+", label: "Paketi materijala" },
      { value: "100%", label: "Jasnoća smernica" },
    ],
    highlights: [
      {
        title: "Strateško pozicioniranje",
        body: "Publiku, konkurenciju i diferencijaciju pretvaramo u jasnu priču koju možete da posedujete.",
        icon: Target,
      },
      {
        title: "Fleksibilni vizuelni sistemi",
        body: "Logotipi, tipografija, boje i motion smernice prilagođavaju se svakoj tački kontakta.",
        icon: Palette,
      },
      {
        title: "Glas brenda i launch materijali",
        body: "Stubovi poruka, pitch deck-ovi i rollout playbook-ovi održavaju timove usklađenim posle lansiranja.",
        icon: BadgeCheck,
      },
    ],
    ctas: [
      { href: "/contact", label: "Pokrenite brend sprint" },
      { href: "/projects", label: "Pogledajte radove identiteta", variant: "secondary" },
    ],
    footnote: "Očekujte zajedničke radionice, moodboard-e i slojevite fajlove spremne za dizajnere, developere i marketing tim.",
  },
  "social-media": {
    floatingServiceKey: "social-media",
    eyebrow: "Zajednica i sadržaj",
    title: "Neka svaka tačka kontakta zasluži pažnju",
    description:
      "Strategija kampanja, materijali spremni za kreatore i analitički loop-ovi grade angažovane zajednice na platformama koje su vam važne.",
    metrics: [
      { value: "5x", label: "Rast angažovanja" },
      { value: "12", label: "Kampanje kvartalno" },
      { value: "24h", label: "Rok za kreativu" },
    ],
    highlights: [
      {
        title: "Kreativa prirodna za platformu",
        body: "Motion, copy i formati podešeni su za način na koji ljudi konzumiraju sadržaj na TikTok-u, Instagramu, LinkedIn-u i šire.",
        icon: Megaphone,
      },
      {
        title: "Razvoj publike",
        body: "Priručnici za zajednicu, partnerstva sa influenserima i plaćeni retargeting ciklusi kumulativno šire doseg.",
        icon: Users,
      },
      {
        title: "Optimizacija u realnom vremenu",
        body: "Dnevni dashboard-i sa eksperimentima, učenjima i sledećim potezima održavaju zamah.",
        icon: MessageSquare,
      },
    ],
    ctas: [
      { href: "/contact", label: "Pokrenite kampanju" },
      { href: "/projects", label: "Pogledajte uspehe na mrežama", variant: "secondary" },
    ],
    footnote: "Uključujemo se u vaš analitički stack, postavljamo smernice za moderaciju zajednice i predajemo ponovljive playbook-ove.",
  },
};








