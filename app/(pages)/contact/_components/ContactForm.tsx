"use client";

import { Fragment, useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

import {
  CONTACT_INTERESTS,
  CONTACT_INTERESTS_FIELD,
} from "@/constants/contactInterests";
import { submitContact } from "../actions";

type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

/**
 * Every text field carries `placeholder=" "` rather than a hint.
 *
 * The label IS the placeholder here - it rests on the input's first line and
 * rises when the field is focused or holds a value - and the "holds a value"
 * half is `:placeholder-shown` in `globals.css`. A field with no placeholder
 * attribute never matches that pseudo-class, so its label would never come
 * back down. The space is what keeps the pseudo-class live while staying
 * invisible; the accessible name is the real `<label>`, which is why this is a
 * floating label and not a fake placeholder.
 */
const FLOAT_PLACEHOLDER = " ";

/**
 * The one client island on the contact page. The action contract
 * (name/email/company/message/responseStyle/interests, {status,message} state)
 * is the server's - nothing here may drift from `../actions.ts`.
 */
export default function ContactForm() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <div className="contact-glass overflow-hidden p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-80"
      />
      <div className="space-y-5">
        <div className="space-y-2 text-left">
          {/* Chrome, not a headline - a form's own title at 20px in the
              extended display face reads as a mistake, and Microgramma renders
              this word's mid-word `č` as a full-height `Č` at this size (the
              same glyph fault `ServiceFaqCta` documents). */}
          <h2
            data-display-font="off"
            className="font-aeonik text-xl font-semibold text-theme-primary"
          >
            Započnite skicu projekta
          </h2>
          <p className="text-sm leading-relaxed text-theme-muted">
            Podelite što više konteksta. North-star metrika, blokade, rokovi
            ili postojeće istraživanje pomoći će nam da odgovorimo prilagođenim
            planom.
          </p>
        </div>
        <form ref={formRef} className="space-y-4" action={formAction}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="float-field">
              <input
                id="contact-name"
                type="text"
                name="name"
                required
                placeholder={FLOAT_PLACEHOLDER}
                className="float-field-input"
              />
              <label htmlFor="contact-name" className="float-field-label">
                Ime
              </label>
            </div>
            <div className="float-field">
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                placeholder={FLOAT_PLACEHOLDER}
                className="float-field-input"
              />
              <label htmlFor="contact-email" className="float-field-label">
                Poslovna e-pošta
              </label>
            </div>
          </div>
          <div className="float-field">
            <input
              id="contact-company"
              type="text"
              name="company"
              placeholder={FLOAT_PLACEHOLDER}
              className="float-field-input"
            />
            <label htmlFor="contact-company" className="float-field-label">
              Kompanija
            </label>
          </div>
          <div className="float-field">
            <textarea
              id="contact-message"
              rows={4}
              name="message"
              required
              placeholder={FLOAT_PLACEHOLDER}
              className="float-field-input"
            />
            <label htmlFor="contact-message" className="float-field-label">
              Čime treba zajedno da se pozabavimo?
            </label>
          </div>

          <fieldset className="interest-fieldset space-y-3">
            <legend className="interest-legend">Šta vas zanima?</legend>
            <div className="flex flex-wrap gap-2">
              {CONTACT_INTERESTS.map(({ value, label, noTranslate }) => {
                const id = `contact-interest-${value}`;

                return (
                  /* No wrapper: the hidden input is the label's previous
                     sibling, which is what `+ .interest-pill` reads. */
                  <Fragment key={value}>
                    <input
                      id={id}
                      type="checkbox"
                      name={CONTACT_INTERESTS_FIELD}
                      value={value}
                      className="interest-pill-input"
                    />
                    <label
                      htmlFor={id}
                      className="interest-pill"
                      data-no-translate={noTranslate ? "true" : undefined}
                    >
                      {label}
                    </label>
                  </Fragment>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="float-field">
              <select
                id="contact-response-style"
                name="responseStyle"
                className="float-field-input"
              >
                <option>Sažetak e-poštom</option>
                <option>Deck sa opcijama</option>
                <option>Asinhroni Loom</option>
                <option>Radna sesija uživo</option>
              </select>
              {/* A select always holds a value, so its label has nowhere to
                  rest - it is pinned to the raised position. */}
              <label
                htmlFor="contact-response-style"
                className="float-field-label float-field-label--pinned"
              >
                Željeni format odgovora
              </label>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-theme hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Šalje se..." : "Pošalji skicu"}
              <Send className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
          {state.status === "success" && (
            <p className="text-sm text-emerald-300" aria-live="polite">
              {state.message}
            </p>
          )}
          {state.status === "error" && (
            <p className="text-sm text-rose-300" aria-live="polite">
              {state.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
