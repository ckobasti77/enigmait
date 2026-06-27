export type ScrollStorySlide = {
  eyebrow: string;
  frameGroup: 0 | 1 | 2;
  id: string;
  paragraphs: readonly string[];
  title: string;
};

export const scrollStorySlides = [
  {
    eyebrow: "SLAJD 01 / ENIGMA",
    frameGroup: 0,
    id: "slide-1",
    paragraphs: [
      "a naše je da vam otežamo — NOVČANIK.",
      "Ono što mi radimo, za vas i treba da ostane — ENIGMA.",
    ],
    title: "Vaše je da vodite svoj posao,",
  },
  {
    eyebrow: "SLAJD 02 / PROBLEM",
    frameGroup: 1,
    id: "slide-2",
    paragraphs: ["i ostave vas da sami shvatite šta dalje..."],
    title: "Dok vam drugi prodaju “websajt”",
  },
  {
    eyebrow: "SLAJD 02 / REŠENJE",
    frameGroup: 1,
    id: "slide-2-part-2",
    paragraphs: [
      "websajt, mobilnu aplikaciju, privatni sistem i reklame",
      "koje dovode klijente, mušterije ili kupce.",
    ],
    title: "Mi pravimo kompletan digitalni nastup:",
  },
  {
    eyebrow: "SLAJD 03 / IZVEDBA",
    frameGroup: 2,
    id: "slide-3",
    paragraphs: [
      "Naš tim korak po korak planira, crta, kodira i pokreće sve od nule.",
    ],
    title: "Ne bavimo se WordPress-om i šablonima.",
  },
  {
    eyebrow: "SLAJD 03 / ISHOD",
    frameGroup: 2,
    id: "slide-3-part-2",
    paragraphs: [
      "Trudimo se da vas što manje zamaramo našim delom posla (ukoliko to ne želite),",
      "i omogućavamo vam više slobodnog vremena, organizovaniji biznis i deblji novčanik.",
    ],
    title: "Vi vodite biznis. Mi vodimo digitalni deo.",
  },
] as const satisfies readonly ScrollStorySlide[];
