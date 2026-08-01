import {
  Brush,
  Megaphone,
  Monitor,
  Search,
  Smartphone,
  WandSparkles,
} from "lucide-react";

export const navLinks = [
  {
    id: 1,
    to: "/",
    text: "Početna",
  },
  {
    id: 2,
    to: "/services",
    text: "Usluge",
    dropdownLinks: [
      {
        id: 1,
        to: "web-development",
        headline: "Izrada web sajtova",
        subheadline: "Razvijaj. Dominiraj. Skaliraj.",
        icon: Monitor,
      },
      {
        id: 2,
        to: "ui-ux-design",
        headline: "UI | UX dizajn",
        subheadline: "Intuitivna iskustva, lepi interfejsi.",
        icon: Brush,
      },
      {
        id: 3,
        to: "mobile-app-development",
        headline: "Izrada mobilnih aplikacija",
        subheadline: "Od ideje do App Store-a.",
        icon: Smartphone,
      },
      {
        id: 4,
        to: "seo-geo",
        headline: "SEO i GEO",
        subheadline: "Budite pri vrhu na Google-u i u AI pretragama.",
        icon: Search,
      },
      {
        id: 5,
        to: "branding",
        headline: "Brending",
        subheadline: "Odmah prepoznatljivo. Lako pamtljivo.",
        icon: WandSparkles,
      },
      {
        id: 6,
        to: "social-media",
        headline: "Društvene mreže",
        subheadline: "Pretvaramo pratioce u obožavaoce.",
        icon: Megaphone,
      },
    ],
  },
  {
    id: 3,
    to: "/projects",
    text: 'Projekti'
  },
  {
    id: 5,
    to: "/contact",
    text: 'Kontakt',
    cta: true,
  },
];
