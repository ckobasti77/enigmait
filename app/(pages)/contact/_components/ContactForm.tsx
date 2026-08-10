"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

import { submitContact } from "../actions";

type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

const FIELD =
  "w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:border-cyan-400 focus:outline-none";

/**
 * The one client island on the contact page. The action contract
 * (name/email/company/message/responseStyle, {status,message} state) is the
 * server's - nothing here may drift from `../actions.ts`.
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
    <div className="relative overflow-hidden rounded-3xl border border-theme theme-card p-6 sm:p-7">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-80"
      />
      <div className="space-y-5">
        <div className="space-y-2 text-left">
          <h2 className="text-xl font-semibold text-theme-primary">
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
            <label className="space-y-2 text-sm">
              <span className="text-theme-primary">Ime</span>
              <input
                type="text"
                name="name"
                required
                placeholder="Ada Lovelace"
                className={FIELD}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-theme-primary">Poslovna e-pošta</span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className={FIELD}
              />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-theme-primary">Kompanija</span>
            <input
              type="text"
              name="company"
              placeholder="Kompanija ili kolektiv"
              className={FIELD}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-theme-primary">
              Čime treba zajedno da se pozabavimo?
            </span>
            <textarea
              rows={4}
              name="message"
              required
              placeholder="Podelite proizvodne ciljeve, tehnološki okvir, rokove ili bilo šta što nam pomaže da se pripremimo."
              className={FIELD}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="space-y-2 text-sm">
              <span className="text-theme-primary">Željeni format odgovora</span>
              <select name="responseStyle" className={FIELD}>
                <option>Sažetak e-poštom</option>
                <option>Deck sa opcijama</option>
                <option>Asinhroni Loom</option>
                <option>Radna sesija uživo</option>
              </select>
            </label>
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
