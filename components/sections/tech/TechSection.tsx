"use client";

import React, { useRef, useState } from "react";
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
];

// Double the items array to ensure seamless infinite looping marquee
const marqueeItems = [...technologies, ...technologies];

export function TechSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, tech: TechItem) => {
    const itemElement = e.currentTarget;
    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    const itemRect = itemElement.getBoundingClientRect();
    const sectionRect = sectionElement.getBoundingClientRect();

    // Position tooltip horizontally centered above the logo
    const left = itemRect.left - sectionRect.left + itemRect.width / 2;
    const top = itemRect.top - sectionRect.top;

    setTooltipPos({ left, top });
    setHoveredTech(tech);
  };

  const handleMouseLeave = () => {
    setHoveredTech(null);
    // Keep tooltipPos to let the speech bubble fade out in-place without snapping
  };

  const isTooltipActive = hoveredTech !== null;
  const tooltipTransform = isTooltipActive
    ? "translate(-50%, -100%) translateY(-12px) scale(1)"
    : "translate(-50%, -100%) translateY(4px) scale(0.95)";

  return (
    <section 
      ref={sectionRef}
      className="relative z-30 flex h-[33vh] min-h-[250px] max-h-[340px] w-full flex-col justify-center border-y border-white/5 bg-[#02030A] overflow-visible select-none"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,109,255,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* Subtle Title Badge */}
      <div className="text-center z-10 mb-6 sm:mb-8">
        <span className="font-accent text-[9px] md:text-[10.5px] tracking-[0.25em] text-[#D7DCE5]/35 uppercase font-bold">
          TEHNOLOGIJE KOJE KORISTIMO
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
      <div
        className={`absolute z-50 w-52 sm:w-56 p-3.5 rounded-xl border border-white/10 bg-[#070B18]/95 backdrop-blur-md text-center pointer-events-none transition-all duration-300 ease-out ${
          isTooltipActive && tooltipPos
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        style={{
          left: tooltipPos ? `${tooltipPos.left}px` : "0px",
          top: tooltipPos ? `${tooltipPos.top}px` : "0px",
          transform: tooltipTransform,
          boxShadow: hoveredTech ? `0 16px 40px rgba(0,0,0,0.6), 0 0 30px ${hoveredTech.glowColor}` : undefined,
        }}
      >
        {hoveredTech && (
          <>
            <div className="font-accent text-[9px] tracking-wider text-[#D7DCE5]/40 uppercase mb-1.5 font-extrabold">
              {hoveredTech.name}
            </div>
            <p className="text-[11px] leading-relaxed text-[#F5F7FA]/85 font-sans">
              {hoveredTech.eli5}
            </p>
            
            {/* Speech Bubble Arrow */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 border-r border-b border-white/10 bg-[#070B18]"
            />
          </>
        )}
      </div>
    </section>
  );
}
