"use client";

import Image from "next/image";
import clsx from "clsx";

import ShowcaseVideo from "@/components/ui/showcase-video";
import { MOCKUP_CLUSTER } from "@/constants/mockupClusterConfig";
import { PROJECT_MOCKUPS, type ProjectMockup } from "@/constants/projectMockups";
import type { ProjectMedia } from "@/constants/projects";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Korica projekta: četiri uređaja istog sajta, u jednoj kompoziciji.
 *
 * Ramovi su **izgrađeni u CSS-u** (`globals.css`, blok `.mockup-*`) — nijedna
 * gotova slika mockapa, jer ram mora da se preboji zajedno sa temom i da ostane
 * oštar na svakoj širini. Ono što se vidi kroz njih je sadržaj klijentskog
 * sajta: monitor, tablet i mobilni nose statične snimke iz
 * `constants/projectMockups.ts` (svaki uslikan na svom viewport-u, pa se čita
 * pravi responsive raspored tog sajta), a **laptop pušta postojeći scroll
 * snimak** `ShowcaseVideo`. Jedan video po kartici, ne četiri: klaster treba da
 * pokaže da sajt radi svuda, a da se kreće mora samo jedan ekran.
 *
 * Raspored je cik-cak — monitor levo, laptop desno, tablet levo, mobilni desno
 * — i svaki sledeći uređaj prelazi centralnu vertikalu i upada prethodnom u
 * kolonu, pa se čita kao jedna kompozicija a ne kao četiri boksa. `z-index`
 * raste tim redom, tako da manji uređaj uvek stoji ispred većeg.
 *
 * **Težina je uslov, ne posledica.** Slike ne postoje u SSR markup-u: montiraju
 * se tek kad klaster uđe u kadar (`useInViewOnce` — jednom montirano ostaje), a
 * `ShowcaseVideo` zadržava svoju logiku (`load` + idle + prvi skrol + kadar) i
 * pauzira van kadra. Otvaranje `/projects` tako košta tri slike izdvojenog
 * projekta, čija je korica iznad preloma, i nijednu drugu — skok na dno
 * stranice ne učita redove koje je preskočio.
 *
 * Klaster je dekoracija: `aria-hidden` na omotaču u stranici, `data-reveal="off"`
 * ovde (monogram u ekranu je go `<span>`, a to je tačno ono što site-wide text
 * reveal inače pokupi kao samostalnu liniju).
 */
export function ProjectMockupCluster({
  projectId,
  media,
  monogram,
  priority = false,
  className,
}: {
  /** Ključ u `PROJECT_MOCKUPS`. Nedostaje li — ekrani ostaju prazni ramovi. */
  projectId: string;
  /** Scroll snimak za laptop. Bez njega laptop pada na statičnu sliku. */
  media: ProjectMedia | null;
  /** Vodeni žig u ekranu monitora dok slika ne stigne (i ako je nema). */
  monogram: string;
  /**
   * Monitor izdvojenog projekta se ne čeka na kadar.
   *
   * Korica izdvojenog projekta počinje na ~520px na 1440×900, dakle IZNAD
   * preloma: ta slika je LCP element stranice, a lenjo učitan LCP je najgori
   * mogući raspored — element se boji tek posle observera i merenje ide sa
   * njim. Lenjo ostaje ono što je stvarno ispod preloma. Cena je jedan
   * `preload` i na telefonu, gde monitor ne postoji: `sizes` tamo bira najmanju
   * varijantu (~8 KB), što je jeftinije od grananja koje bi zavisilo od
   * `matchMedia` pre prvog paint-a.
   */
  priority?: boolean;
  className?: string;
}) {
  // Kartica koja je jednom bila u kadru zadržava svoje slike: `useInViewOnce`,
  // ne `useIntersectionActive`, jer bi skidanje slike na izlazak iz kadra
  // značilo nov fetch pri svakom prolasku gore-dole.
  const { ref, seen: armed } = useInViewOnce<HTMLDivElement>({
    rootMargin: MOCKUP_CLUSTER.rootMargin,
  });
  const simplified = useMediaQuery(MOCKUP_CLUSTER.simplifiedQuery);

  const mockup: ProjectMockup | undefined = PROJECT_MOCKUPS[projectId];
  /** Monitor i tablet na telefonu ne postoje — ni u DOM-u kao slika. */
  const wide = armed && !simplified;

  return (
    <div
      ref={ref}
      data-reveal="off"
      className={clsx("mockup-cluster", className)}
    >
      <div className="mockup-stage">
        <div className="mockup-device mockup-monitor">
          <div className="mockup-monitor-panel">
            <div className="mockup-screen mockup-screen-monitor">
              <span className="mockup-watermark font-accent">{monogram}</span>
              {(priority || wide) && mockup ? (
                <Image
                  src={mockup.desktop}
                  alt=""
                  fill
                  sizes={MOCKUP_CLUSTER.imageSizes.desktop}
                  priority={priority}
                  loading={priority ? undefined : "lazy"}
                  className="mockup-shot"
                />
              ) : null}
            </div>
          </div>
          <span className="mockup-monitor-neck" />
          <span className="mockup-monitor-base" />
        </div>

        <div className="mockup-device mockup-laptop">
          <div className="mockup-laptop-lid">
            <div className="mockup-screen mockup-screen-laptop">
              {media ? (
                <ShowcaseVideo media={media} className="absolute inset-0" />
              ) : armed && mockup ? (
                <Image
                  src={mockup.laptop}
                  alt=""
                  fill
                  sizes={MOCKUP_CLUSTER.imageSizes.laptop}
                  loading="lazy"
                  className="mockup-shot"
                />
              ) : null}
            </div>
          </div>
          <span className="mockup-laptop-base" />
        </div>

        <div className="mockup-device mockup-tablet">
          <div className="mockup-tablet-body">
            <div className="mockup-screen mockup-screen-tablet">
              {wide && mockup ? (
                <Image
                  src={mockup.tablet}
                  alt=""
                  fill
                  sizes={MOCKUP_CLUSTER.imageSizes.tablet}
                  loading="lazy"
                  className="mockup-shot"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mockup-device mockup-mobile">
          <div className="mockup-mobile-body">
            <div className="mockup-screen mockup-screen-mobile">
              {armed && mockup ? (
                <Image
                  src={mockup.mobile}
                  alt=""
                  fill
                  sizes={MOCKUP_CLUSTER.imageSizes.mobile}
                  loading="lazy"
                  className="mockup-shot"
                />
              ) : null}
            </div>
            <span className="mockup-mobile-island" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectMockupCluster;
