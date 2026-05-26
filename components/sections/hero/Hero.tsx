import Image from "next/image";

import { serviceLinks } from "@/constants/services";

import { CTAButton } from "./CTAButton";
import { HeroBackgroundVideo } from "./HeroBackgroundVideo";
import { HeroNavbar } from "./HeroNavbar";
import { ServicePill } from "./ServicePill";

export function Hero() {
  return (
    <section className="relative isolate flex h-svh w-full max-w-full overflow-hidden bg-[#02030A] px-4 text-[#F5F7FA] sm:px-7 lg:px-10 xl:px-12">
      <HeroBackgroundVideo className="absolute inset-0 z-0 h-full w-full object-cover" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1690px] flex-col">
        <HeroNavbar />

        <div className="flex min-h-0 flex-1 items-center pb-3 pt-16 sm:pt-18 lg:pb-5 xl:pt-20">
          <div className="relative z-20 w-full max-w-[860px] xl:pl-14 2xl:pl-16">
            <div className="hero-reveal hero-reveal-delay-1 flex w-full">
              <Image
                alt="Enigma IT"
                className="h-auto w-[170px] sm:w-[220px] md:w-[245px]"
                height={111}
                priority
                src="/logos/logo-text.png"
                width={794}
              />
            </div>

            <h1 className="hero-reveal hero-reveal-delay-2 mt-6 font-accent text-[clamp(2rem,8.8vw,3.5rem)] font-black leading-[1.04] text-[#F5F7FA] drop-shadow-[0_6px_18px_rgba(255,255,255,0.12)] sm:mt-7 md:text-[clamp(2.7rem,6vw,4.05rem)] xl:text-[clamp(3rem,3.25vw,4.2rem)]">
              <span className="block xl:whitespace-nowrap">Gradimo digitalne </span>
              <span className="block xl:whitespace-nowrap">proizvode koji </span>
              <span className="block xl:whitespace-nowrap">
                pokreću <span className="enigma-gradient-text">rast.</span>
              </span>
            </h1>

            <p className="hero-reveal hero-reveal-delay-3 mt-5 max-w-[650px] text-[0.95rem] leading-7 text-white/66 sm:text-[1.08rem] md:text-[1.15rem] md:leading-8">
              Enigma IT kreira vrhunske websajtove, web-shopove, digitalne
              sisteme i mobilne aplikacije koji pojednostavljuju procese,
              jačaju brendove i donose merljiv rast.
            </p>

            <div className="hero-reveal hero-reveal-delay-4 mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <CTAButton href="#kontakt">Zakažite konsultacije</CTAButton>
              <CTAButton href="#portfolio" variant="secondary">
                Pogledajte naš rad
              </CTAButton>
            </div>

            <div className="hero-reveal hero-reveal-delay-5 mt-7 grid max-w-[880px] grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:mt-9 xl:flex-nowrap">
              {serviceLinks.map((service) => (
                <ServicePill
                  href={service.href}
                  icon={service.icon}
                  key={service.label}
                  label={service.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
