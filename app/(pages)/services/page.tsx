'use client';

import PageHero from "@/app/_components/PageHero";
import { navLinks } from "@/constants/navLinks";

const servicesLink = navLinks.find((link) => link.text === "Usluge");
const serviceHighlights = (servicesLink?.dropdownLinks ?? []).map((service) => ({
  title: service.headline,
  body: service.subheadline,
  icon: service.icon,
}));

const Services = () => {
  return (
    <PageHero
      eyebrow="Šta pretvaramo u rezultat"
      title="Modularni skup usluga napravljen za isporuku rezultata"
      description="Izaberite jednu sposobnost ili sastavite kompletan product tim. Strategija, dizajn i tehnologija ostaju čvrsto usklađeni, pa svaki sprint donosi merljiv napredak ka ciljevima."
      metrics={[
        { value: "30+", label: "Isporučena lansiranja" },
        { value: "8 wks", label: "Prosečna isporuka" },
        { value: "98%", label: "Zadržavanje klijenata" },
      ]}
      ctas={[
        { href: "/contact", label: "Definišite svoj stack" },
        { href: "/projects", label: "Pogledajte u praksi", variant: "secondary" },
      ]}
      highlights={serviceHighlights}
      footnote="Treba vam nešto posebno? Kombinujemo timove oko vaše mape puta, zatim predajemo rešenje uz dokumentaciju i enablement."
      floatingServiceKey="default"
    />
  );
};

export default Services;

