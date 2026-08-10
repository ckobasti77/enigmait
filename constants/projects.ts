/**
 * The six real client sites shown on `/projects`.
 *
 * Every line of copy in here is written from what the site itself says -
 * `showcase/captures/<id>/content.txt` (title, meta description and the
 * extracted body text) plus the `notes` field of the matching entry in
 * `showcase/showcase.config.json`. Nothing else. There are deliberately **no
 * metrics**: we have no analytics access to any of these sites, so a percentage
 * here would be a number nobody can check. What we can prove is the scope of
 * work and the live URL, so that is what the card carries.
 *
 * Every user-facing Serbian string in this file needs an `[en, sr]` pair in
 * `lib/i18n.ts` - the language walker translates whole text nodes, so a missing
 * pair leaves that one line in Serbian while the rest of the page turns.
 * Company names, `scope` entries that are proper nouns and the hostnames are
 * the exception; they read the same in both languages.
 */

export type ProjectCategory = "web" | "mobile" | "system" | "marketing";

/**
 * The five files `scripts/encode-showcase.mjs` writes per project. Mirrors that
 * script's output contract exactly - if the encode step ever renames a file,
 * this type is the single place the site has to follow.
 */
export type ProjectMedia = {
  mp4: string;
  webm: string;
  mp4Sm: string;
  webmSm: string;
  poster: string;
};

export type Project = {
  /** Same id as in `showcase/showcase.config.json`, and the media folder name. */
  id: string;
  name: string;
  url: string;
  category: ProjectCategory;
  /** Line of business, one or two words - goes in the pill. */
  tag: string;
  /** Two-letter fallback for the designed cover when `media` is null. */
  monogram: string;
  title: string;
  /** At most two sentences: what the site is and what it does for the business. */
  summary: string;
  /** What the job covered. Technology belongs here, not in `summary`. */
  scope: string[];
  media: ProjectMedia | null;
};

const showcaseMedia = (id: string): ProjectMedia => ({
  mp4: `/showcase/${id}/card.mp4`,
  webm: `/showcase/${id}/card.webm`,
  mp4Sm: `/showcase/${id}/card-sm.mp4`,
  webmSm: `/showcase/${id}/card-sm.webm`,
  poster: `/showcase/${id}/poster.webp`,
});

export const projects: Project[] = [
  {
    id: "lady-gaga-studio",
    name: "Studio Lady Gaga",
    url: "https://ladygagastudio.rs/",
    category: "web",
    tag: "Lepota i nega",
    monogram: "LG",
    title: "Studio Lady Gaga — salon i prodavnica na jednom mestu",
    summary:
      "Frizerski salon iz Šapca sa tretmanima nege, koloracijama i sopstvenom prodajom preparata. Sajt vodi od opisa tretmana do upita za termin, a u istom toku drži i prodavnicu sa stanjem zaliha.",
    scope: ["Web sajt", "Web-shop", "Galerija pre i posle", "Upit za termin"],
    media: showcaseMedia("lady-gaga-studio"),
  },
  {
    id: "ablux-travel",
    name: "ABLux Travel",
    url: "https://abluxtravel.com",
    category: "web",
    tag: "Turizam",
    monogram: "AB",
    title: "ABLux Travel — putovanja i verski turizam",
    summary:
      "Turistička agencija čija ponuda ide od hodočašća i letovanja do iznajmljivanja autobusa sa vozačem. Sajt sve to drži na jednom mestu, na srpskom i engleskom, sa upitom koji stiže direktno agenciji.",
    scope: [
      "Web sajt",
      "Katalog aranžmana",
      "Srpski i engleski",
      "Forma za upit",
    ],
    media: showcaseMedia("ablux-travel"),
  },
  {
    id: "gbmt",
    name: "Global Beo Mobil Trend",
    url: "https://gbmt.rs/",
    category: "web",
    tag: "Video nadzor i iskopi",
    monogram: "GB",
    title: "Global Beo Mobil Trend — video nadzor i iskopni radovi",
    summary:
      "Firma koja ugrađuje i održava sisteme video nadzora, a uz to izvodi iskopne radove sopstvenom mehanizacijom. Sajt razdvaja te dve delatnosti u dve jasne celine, pa posetilac odmah zna na koju je stranu došao.",
    scope: ["Web sajt", "Stranica po delatnosti", "Kontakt stranica"],
    media: showcaseMedia("gbmt"),
  },
  {
    id: "the-original-way",
    name: "The Original Way",
    url: "https://the-original-way.vercel.app/",
    category: "web",
    tag: "Moda",
    monogram: "OW",
    title: "The Original Way — kurirana evropska garderoba",
    summary:
      "Prodavnica evropske odeće i obuće sa namerno malim asortimanom, gde svaki komad ima razlog da bude tu. Katalog, korpa i naplata rade u jednom toku, na srpskom i engleskom.",
    scope: [
      "Web-shop",
      "Katalog i korpa",
      "Srpski i engleski",
      "Svetla i tamna tema",
    ],
    media: showcaseMedia("the-original-way"),
  },
  {
    id: "fides-gradnja",
    name: "Fides Gradnja",
    url: "https://fidesgradnja.vercel.app/",
    category: "web",
    tag: "Građevinarstvo",
    monogram: "FG",
    title: "Fides Gradnja — građevinarstvo i nekretnine",
    summary:
      "Građevinska firma koja gradi objekte i kroz sopstvene investicije izlazi na tržište nekretnina. Sajt spaja predstavljanje kompanije, galeriju izvedenih radova i aktuelnu ponudu prostora.",
    scope: [
      "Web sajt",
      "Galerija radova",
      "Ponuda nekretnina",
      "Kontakt stranica",
    ],
    media: showcaseMedia("fides-gradnja"),
  },
  {
    id: "digist",
    name: "Digist",
    url: "https://digist.vercel.app/",
    category: "web",
    tag: "Digitalni marketing",
    monogram: "DG",
    title: "Digist — agencija za digitalni marketing",
    summary:
      "Agencija koja vodi društvene mreže i oglašavanje za hotele, restorane i kafiće. Sajt je na engleskom i u tamnoj temi, a vodi kroz usluge, tim i način rada do kontakta.",
    scope: [
      "Web sajt",
      "Predstavljanje usluga",
      "Sadržaj na engleskom",
      "Kontakt forma",
    ],
    media: showcaseMedia("digist"),
  },
];
