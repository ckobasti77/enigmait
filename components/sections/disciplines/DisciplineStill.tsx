"use client";

import Image from "next/image";
import clsx from "clsx";

import { DISCIPLINE_ORDER, disciplines } from "@/constants/disciplines";

/**
 * The section without WebGL.
 *
 * Same box, same aspect ratio, same stepper driving it - only the renderer is gone and a
 * still render of the model stands in its place. So this is not a degraded section, it is
 * the section with a flat picture: the arrows, the dots, the keyboard and the copy all
 * still work, which is the acceptance criterion ("sekcija radi i pokazuje still"), not
 * merely "something is visible".
 *
 * ALL SIX ARE MOUNTED, ONE IS OPAQUE. Cross-fading between six `<Image>`s that are already
 * decoded is the only way a step is instant here; swapping one `src` would show the box
 * empty for as long as the next file takes to arrive, and this fallback exists precisely
 * for clients that have no headroom to spare. `loading="lazy"` on the five keeps that
 * honest - the browser fetches them around the first one rather than in front of it, and
 * six stills at <=60 KB is less than one of the GLBs this client will never download.
 *
 * The inactive five are `aria-hidden` rather than removed, for the same reason the copy
 * panels stay in the DOM: what is hidden here is a picture, and the alternative text that
 * matters is on the one that is showing.
 */
export default function DisciplineStill({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <div className={clsx("discipline-still", className)}>
      {DISCIPLINE_ORDER.map((key, position) => {
        const discipline = disciplines[key];
        const active = position === index;

        return (
          <Image
            key={key}
            src={discipline.stillPath}
            alt={`${discipline.title} shown as a 3D device`}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            priority={position === 0}
            loading={position === 0 ? undefined : "lazy"}
            aria-hidden={!active}
            className={clsx(
              "discipline-still-frame",
              active ? "opacity-100" : "opacity-0"
            )}
          />
        );
      })}
    </div>
  );
}
