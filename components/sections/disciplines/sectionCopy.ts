import { DISCIPLINE_ORDER, disciplineHref, disciplines } from "@/constants/disciplines";

/**
 * The section's own copy - the three lines above the six panels.
 *
 * Here rather than in `constants/disciplines.ts`, which is the PER-DISCIPLINE contract:
 * these belong to the section, not to any one of the six. English source, with pairs in
 * `lib/i18n.ts` under `// Home disciplines`; the DOM walker translates the text node, so
 * these strings must stay byte-identical to the left-hand side of those pairs.
 *
 * No `"use client"`: this module is imported by both the client shell and the server
 * component that emits the JSON-LD, and a directive here would drag the graph into the
 * client bundle for no reason.
 */
export const SECTION_KICKER = "Pick a discipline";
export const SECTION_TITLE = "Six disciplines. One team.";
export const SECTION_LEDE =
  "Each one is a full squad - strategy, design and engineering in the same room. Start where you need it most.";

/**
 * The section's structured data.
 *
 * `ItemList` and not six loose `Service` nodes: the section IS an ordered list of six, the
 * order is `DISCIPLINE_ORDER`, and saying so gives the crawler the same shape a visitor
 * steps through. Built from the same contract the panels render from, so a seventh
 * discipline cannot appear on screen and be missing from the graph.
 *
 * Absolute URLs are deliberately absent - a relative `url` resolves against the page it is
 * embedded in, which is the one thing that stays correct across localhost, a preview
 * deployment and production. Hard-coding a host here is how JSON-LD ends up pointing at
 * staging from production.
 *
 * Serialised once, at module scope, with `<` escaped so no value in the graph can close the
 * script tag early.
 */
export const ITEM_LIST_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: SECTION_TITLE,
  description: SECTION_LEDE,
  numberOfItems: DISCIPLINE_ORDER.length,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: DISCIPLINE_ORDER.map((key, position) => {
    const discipline = disciplines[key];
    return {
      "@type": "ListItem",
      position: position + 1,
      name: discipline.title,
      description: discipline.lede,
      url: disciplineHref(key),
      item: {
        "@type": "Service",
        name: discipline.title,
        slogan: discipline.kicker,
        description: discipline.lede,
        url: disciplineHref(key),
        serviceType: discipline.title,
        provider: {
          "@type": "Organization",
          name: "Enigma Digital",
        },
      },
    };
  }),
}).replace(/</g, "\\u003c");
