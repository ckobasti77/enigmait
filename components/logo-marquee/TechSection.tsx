"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface TechItem {
  id: string;
  name: string;
  glowColor: string;
  eli5: string;
}

const technologies: TechItem[] = [
  {
    id: "nextjs",
    name: "NextJS",
    glowColor: "rgba(255, 255, 255, 0.08)",
    eli5: "Pametni pomoćnik koji nam pomaže da napravimo super brze sajtove koje Google obožava.",
  },
  {
    id: "convex-official",
    name: "Convex DB",
    glowColor: "rgba(255, 74, 0, 0.12)",
    eli5: "Super-brza digitalna fioka koja pamti sve podatke na sajtu u deliću sekunde.",
  },
  {
    id: "tailwindcss",
    name: "Tailwindcss",
    glowColor: "rgba(56, 189, 248, 0.12)",
    eli5: "Kutija sa gotovim bojicama i stilovima pomoću koje dizajniramo sajt brzinom svetlosti.",
  },
  {
    id: "gsap",
    name: "GSAP",
    glowColor: "rgba(136, 206, 2, 0.1)",
    eli5: "Magični štapić koji čini da se slike i tekst pomeraju glatko i izgledaju kao film.",
  },
  {
    id: "framermotion",
    name: "Framer Motion",
    glowColor: "rgba(240, 2, 179, 0.12)",
    eli5: "Nevidljivi motor koji pokreće nežne i prirodne animacije dok skroluješ sajt.",
  },
  {
    id: "react",
    name: "React",
    glowColor: "rgba(97, 218, 251, 0.12)",
    eli5: "Pametne Lego kockice od kojih gradimo sve delove sajta kako bi sve radilo savršeno.",
  },
  {
    id: "astro",
    name: "AstroJS",
    glowColor: "rgba(255, 93, 1, 0.12)",
    eli5: "Svemirska raketa koja pravi ultra-lagane sajtove tako što izbaci sav višak koji ih usporava.",
  },
  {
    id: "figma",
    name: "Figma",
    glowColor: "rgba(162, 89, 255, 0.12)",
    eli5: "Digitalna sveska u kojoj crtamo i dizajniramo tačan izgled tvog sajta pre nego što ga napravimo.",
  },

  // — Dizajn —
  {
    id: "photoshop",
    name: "Photoshop",
    glowColor: "rgba(49, 168, 255, 0.14)",
    eli5: "Čarobna radionica u kojoj retuširamo fotografije i činimo da svaka slika izgleda savršeno.",
  },
  {
    id: "illustrator",
    name: "Illustrator",
    glowColor: "rgba(255, 154, 0, 0.14)",
    eli5: "Alat kojim crtamo logotipe i ilustracije koje ostaju oštre koliko god ih uvećaš.",
  },
  {
    id: "xd",
    name: "Adobe XD",
    glowColor: "rgba(255, 38, 190, 0.12)",
    eli5: "Digitalna tabla na kojoj sklapamo kako aplikacija izgleda i kako se klikće kroz nju.",
  },
  {
    id: "blender",
    name: "Blender",
    glowColor: "rgba(234, 118, 0, 0.13)",
    eli5: "3D radionica u kojoj oblikujemo i oživljavamo predmete kao da su od gline.",
  },

  // — Video / Montaža —
  {
    id: "aftereffects",
    name: "After Effects",
    glowColor: "rgba(153, 153, 255, 0.14)",
    eli5: "Filmska kuhinja u kojoj dodajemo pokret, efekte i animacije da video oživi.",
  },
  {
    id: "premierepro",
    name: "Premiere Pro",
    glowColor: "rgba(170, 120, 255, 0.14)",
    eli5: "Montažni sto na kome sečemo i spajamo snimke u priču koja teče glatko.",
  },
  {
    id: "capcut",
    name: "CapCut",
    glowColor: "rgba(0, 231, 255, 0.12)",
    eli5: "Brzi alat kojim pravimo dinamične klipove za mreže, sa titlovima i muzikom.",
  },
  {
    id: "davinci",
    name: "DaVinci Resolve",
    glowColor: "rgba(157, 180, 204, 0.12)",
    eli5: "Majstor za boje koji svakom snimku daje bogat, filmski ton.",
  },

  // — Društvene mreže —
  {
    id: "instagram",
    name: "Instagram",
    glowColor: "rgba(225, 48, 108, 0.14)",
    eli5: "Izlog na kome tvoj brend blista kroz slike i priče koje ljudi vole da prate.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    glowColor: "rgba(254, 44, 85, 0.12)",
    eli5: "Igralište kratkih videa gde se najbrže postaje viralan i primećen.",
  },
  {
    id: "youtube",
    name: "YouTube",
    glowColor: "rgba(255, 0, 0, 0.12)",
    eli5: "Najveća bioskopska sala interneta gde tvoji videi žive i rastu godinama.",
  },
  {
    id: "facebook",
    name: "Facebook",
    glowColor: "rgba(24, 119, 242, 0.14)",
    eli5: "Gradski trg na kome brend priča sa zajednicom i pronalazi nove kupce.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    glowColor: "rgba(10, 102, 194, 0.14)",
    eli5: "Poslovni skup na kome se brend povezuje sa firmama i profesionalcima.",
  },

  // — SEO / Marketing / Analitika —
  {
    id: "google",
    name: "Google",
    glowColor: "rgba(66, 133, 244, 0.12)",
    eli5: "Najveća biblioteka sveta u kojoj se trudimo da tvoj sajt bude na prvoj strani.",
  },
  {
    id: "googleanalytics",
    name: "Google Analytics",
    glowColor: "rgba(249, 171, 0, 0.12)",
    eli5: "Detektiv koji nam tačno kaže ko posećuje sajt i šta na njemu radi.",
  },
  {
    id: "googleads",
    name: "Google Ads",
    glowColor: "rgba(251, 188, 5, 0.12)",
    eli5: "Zvučnik kojim tvoju ponudu čuju baš oni koji je traže na Google-u.",
  },
  {
    id: "searchconsole",
    name: "Search Console",
    glowColor: "rgba(120, 170, 255, 0.12)",
    eli5: "Kontrolna tabla koja pokazuje kako Google vidi i rangira tvoj sajt.",
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    glowColor: "rgba(255, 136, 0, 0.13)",
    eli5: "Špijunski durbin kojim proučavamo konkurenciju i nalazimo prave reči za pretragu.",
  },
  {
    id: "semrush",
    name: "Semrush",
    glowColor: "rgba(255, 100, 45, 0.12)",
    eli5: "Švajcarski nožić za marketing koji otkriva kako da nadmašiš konkurenciju.",
  },
  {
    id: "meta",
    name: "Meta",
    glowColor: "rgba(0, 129, 251, 0.12)",
    eli5: "Komandni centar reklama koji tvoju poruku šalje pravim ljudima na Instagramu i Facebook-u.",
  },

  // — Web / Dev —
  {
    id: "typescript",
    name: "TypeScript",
    glowColor: "rgba(49, 120, 198, 0.14)",
    eli5: "Strogi učitelj koda koji hvata greške pre nego što se pojave na sajtu.",
  },
  {
    id: "nodejs",
    name: "Node.js",
    glowColor: "rgba(83, 158, 67, 0.13)",
    eli5: "Neumorni motor u pozadini koji pokreće servere i logiku sajta.",
  },

  // — Mobilne —
  {
    id: "swift",
    name: "Swift",
    glowColor: "rgba(240, 81, 56, 0.13)",
    eli5: "Jezik kojim pravimo brze i uglačane aplikacije baš za iPhone.",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    glowColor: "rgba(167, 116, 255, 0.12)",
    eli5: "Jezik kojim gradimo moderne i stabilne aplikacije za Android telefone.",
  },
];

// Double the items array to ensure seamless infinite looping marquee
const marqueeItems = [...technologies, ...technologies];

export function TechSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredItemRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  // The marquee never stops, so the hovered logo keeps sliding out from under its tooltip.
  // Recompute the tooltip's position from the logo's LIVE rect (imperatively, off React's
  // render path) so the bubble rides along instead of pinning to where the logo entered.
  const positionTooltip = () => {
    const itemElement = hoveredItemRef.current;
    const sectionElement = sectionRef.current;
    const tooltipElement = tooltipRef.current;
    if (!itemElement || !sectionElement || !tooltipElement) return;

    const itemRect = itemElement.getBoundingClientRect();
    const sectionRect = sectionElement.getBoundingClientRect();
    // Horizontally centered above the logo, both measured against the (static) section.
    tooltipElement.style.left = `${itemRect.left - sectionRect.left + itemRect.width / 2}px`;
    tooltipElement.style.top = `${itemRect.top - sectionRect.top}px`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, tech: TechItem) => {
    hoveredItemRef.current = e.currentTarget;
    positionTooltip(); // place before it fades in, so it never flashes at a stale spot
    setHoveredTech(tech);

    if (rafRef.current === null) {
      const track = () => {
        positionTooltip();
        rafRef.current = requestAnimationFrame(track);
      };
      rafRef.current = requestAnimationFrame(track);
    }
  };

  const handleMouseLeave = () => {
    setHoveredTech(null);
    hoveredItemRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // The tooltip keeps its last left/top and fades out in place - no snap back.
  };

  // Stop the tracking loop if the section unmounts mid-hover.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isTooltipActive = hoveredTech !== null;
  const tooltipTransform = isTooltipActive
    ? "translate(-50%, -100%) translateY(-12px) scale(1)"
    : "translate(-50%, -100%) translateY(4px) scale(0.95)";

  return (
    <section 
      ref={sectionRef}
      className="relative z-30 flex h-[33vh] min-h-[250px] max-h-[340px] w-full flex-col justify-center bg-transparent overflow-visible select-none"
    >
      {/* Subtle Title Badge */}
      <div className="text-center z-10 mb-6 sm:mb-8">
        <span className="font-accent text-[9px] md:text-[10.5px] tracking-[0.25em] text-theme-muted opacity-60 uppercase font-bold">
          Tehnologije koje koristimo
        </span>
      </div>

      {/* Marquee Row Wrapper with horizontal scroll clipping and left/right fade masks */}
      <div className="relative w-full overflow-hidden py-4 z-20 [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
        {/* Infinite scrolling row */}
        <div className="flex w-max animate-marquee gap-12 md:gap-18 px-4 overflow-visible">
          {marqueeItems.map((tech, index) => {
            return (
              <div
                key={`${tech.id}-${index}`}
                onMouseEnter={(e) => handleMouseEnter(e, tech)}
                onMouseLeave={handleMouseLeave}
                className="group relative flex h-24 w-28 md:h-28 md:w-34 items-center justify-center transition-all duration-300 hover:scale-110 overflow-visible cursor-pointer"
                style={{ "--glow-color": tech.glowColor } as React.CSSProperties}
              >
                {/* Brand glow behind logo */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,var(--glow-color),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* SVG Logo loaded from public folder */}
                <Image
                  src={`/logo-marquee/${tech.id}.svg`}
                  alt={tech.name}
                  width={64}
                  height={64}
                  className="h-12 md:h-14 w-auto max-w-[80%] object-contain transition-all duration-300 opacity-50 group-hover:opacity-100"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section-level Tooltip Speech Bubble (can overlap boundary/Hero cleanly) */}
      {/* Only opacity/transform/box-shadow transition - left/top are updated every frame to
          track the logo and must NOT ease, or the bubble would lag a moving target. */}
      <div
        ref={tooltipRef}
        className={`absolute z-50 w-52 sm:w-56 p-3.5 rounded-xl border border-theme bg-[var(--popover)] backdrop-blur-md text-center pointer-events-none transition-[opacity,transform,box-shadow] duration-300 ease-out ${
          isTooltipActive ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{
          transform: tooltipTransform,
          boxShadow: hoveredTech ? `0 16px 40px var(--shadow-elevated), 0 0 30px ${hoveredTech.glowColor}` : undefined,
        }}
      >
        {hoveredTech && (
          <>
            <div className="font-accent text-[9px] tracking-wider text-theme-muted uppercase mb-1.5 font-extrabold">
              {hoveredTech.name}
            </div>
            <p className="text-[11px] leading-relaxed text-theme-primary font-sans">
              {hoveredTech.eli5}
            </p>

            {/* Speech Bubble Arrow */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 border-r border-b border-theme bg-[var(--popover)]"
            />
          </>
        )}
      </div>
    </section>
  );
}
