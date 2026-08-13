/**
 * The "Šta vas zanima?" pills on the contact form.
 *
 * Shared by the client form and the server action on purpose. The form renders
 * the labels, the action validates what arrives against these values and mails
 * the label back out - so an interest is one entry here rather than a string
 * duplicated on both sides of the wire, where the two could drift.
 *
 * `value` is what the checkbox submits: ASCII, stable, never shown. `label` is
 * the Serbian copy the pill reads; `lib/i18n.ts` carries the `[en, sr]` pair.
 */
export type ContactInterest = {
  value: string;
  label: string;
  /**
   * Held out of the language walk.
   *
   * Two of these labels are the same word in both languages, and both are
   * already English *keys* in `lib/i18n.ts` pointing somewhere else - "Website"
   * at the nav's "Web sajt", "Branding" at "Brending". `LanguageProvider`
   * translates any text node it recognises, including in Serbian, so left
   * alone the pills would read "Web sajt" and "Brending" the moment they
   * mounted. A pair cannot fix that (the English side is spoken for), so the
   * label opts out of the walk with `data-no-translate` and reads the same in
   * both locales - which is what it should say in both anyway.
   */
  noTranslate?: true;
};

export const CONTACT_INTERESTS: readonly ContactInterest[] = [
  { value: "general", label: "Opšte" },
  { value: "website", label: "Website", noTranslate: true },
  { value: "mobile-app", label: "Mobilna aplikacija" },
  { value: "design", label: "Dizajn" },
  { value: "branding", label: "Branding", noTranslate: true },
  { value: "seo-geo", label: "SEO i GEO" },
  { value: "social-media", label: "Društvene mreže" },
];

/** Lookup the server action uses to turn submitted values back into copy. */
export const CONTACT_INTEREST_LABELS: Record<string, string> =
  Object.fromEntries(
    CONTACT_INTERESTS.map(({ value, label }) => [value, label])
  );

/** The field name on the form, so the two sides cannot mistype it apart. */
export const CONTACT_INTERESTS_FIELD = "interests";
