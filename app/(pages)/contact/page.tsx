'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CalendarClock, Mail, MessageCircle, PhoneCall, Send, ArrowRight } from 'lucide-react';
import { submitContact } from './actions';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const iconStrokeWidth = 1.8;

const contactOptions = [
  {
    icon: Mail,
    title: 'Pišite partnerima',
    description: 'hello@enigmadigital.studio - pošaljite prezentaciju, Loom snimak ili kratak opis gde vam treba zamah.',
    action: 'Otvori e-poštu',
  },
  {
    icon: CalendarClock,
    title: 'Zakažite strateški poziv',
    description: 'Izaberite termin od 30 minuta da prođemo ciljeve, ograničenja i metrike važne vašem executive timu.',
    action: 'Pogledaj kalendar',
  },
  {
    icon: MessageCircle,
    title: 'Asinhrona glasovna poruka',
    description: 'Više vam odgovara asinhrono? Pošaljite glasovnu poruku ili transkript, a mi ćemo odgovoriti u formatu koji koristite interno.',
    action: 'Pošalji poruku',
  },
];

const officeLocations = [
  {
    city: 'Manchester',
    timezone: 'GMT(+0)',
    address: '48 Lever Street, Northern Quarter',
  },
  {
    city: 'Dubai',
    timezone: 'GST(+4)',
    address: 'DIFC Innovation Hub, Gate Avenue',
  },
  {
    city: 'Barcelona',
    timezone: 'CET(+1)',
    address: 'Carrer de Pamplona, 88',
  },
];

type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const initialState: ContactFormState = {
  status: 'idle',
  message: '',
};

export default function ContactUs() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <div className="theme-section transition-theme text-theme-primary">
      <section className="site-gutter relative overflow-hidden py-20 md:py-24">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-[420px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),rgba(168,85,247,0.12)_45%,rgba(15,23,42,0)_80%)] blur-[140px]"
          aria-hidden
        />
        <div className="site-container relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-4 py-2 text-xs uppercase tracking-[0.4em] text-cyan-400/90">
              Gradimo zajedno
            </span>
            <h1 className="font-aeonik text-4xl font-medium leading-tight text-theme-primary md:text-5xl">
              Pošaljite brief. Mi dovodimo tim.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-theme-muted">
              Recite nam koji ishod vam treba u naredna dva kvartala. Sastavićemo pravi tim stratega, dizajnera i inženjera, zatim ostati uz vas dok playbook ne zaživi u vašem timu.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-theme theme-card px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-theme-primary md:text-3xl">&lt;12h</p>
                <span className="mt-2 block text-xs uppercase tracking-[0.3em] text-theme-muted">Prosečan odgovor</span>
              </div>
              <div className="rounded-2xl border border-theme theme-card px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-theme-primary md:text-3xl">24/5</p>
                <span className="mt-2 block text-xs uppercase tracking-[0.3em] text-theme-muted">Pokrivenost</span>
              </div>
              <div className="rounded-2xl border border-theme theme-card px-4 py-4 text-center">
                <p className="text-2xl font-semibold text-theme-primary md:text-3xl">5</p>
                <span className="mt-2 block text-xs uppercase tracking-[0.3em] text-theme-muted">Vremenske zone</span>
              </div>
            </div>
            <div className="space-y-3">
              {contactOptions.map((option) => (
                <div
                  key={option.title}
                  className="group flex flex-col gap-4 rounded-3xl border border-theme theme-card p-5 transition-theme transition-all duration-300 ease-out hover:-translate-y-1 hover:border-theme-strong hover:shadow-theme sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-theme theme-card text-cyan-400 ring-1 ring-cyan-400/15">
                      <option.icon className="h-5 w-5" aria-hidden strokeWidth={iconStrokeWidth} />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-theme-primary">{option.title}</h3>
                      <p className="text-sm leading-relaxed text-theme-muted">{option.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-theme-strong px-4 py-2 text-sm font-medium text-theme-primary transition-theme hover:bg-muted"
                  >
                    {option.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-theme theme-card p-6 shadow-theme sm:p-7">
            <div className="space-y-5">
              <div className="space-y-2 text-left">
                <h2 className="text-xl font-semibold text-theme-primary">Započnite skicu projekta</h2>
                <p className="text-sm text-theme-muted">
                  Podelite što više konteksta. North-star metrika, blokade, rokovi ili postojeće istraživanje pomoći će nam da odgovorimo prilagođenim planom.
                </p>
              </div>
              <form ref={formRef} className="space-y-4" action={formAction}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Ime</span>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ada Lovelace"
                      className="w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:border-cyan-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Poslovna e-pošta</span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:border-cyan-400 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-200">Kompanija</span>
                  <input
                    type="text"
                    name="company"
                    placeholder="Kompanija ili kolektiv"
                    className="w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-200">Čime treba zajedno da se pozabavimo?</span>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    placeholder="Podelite proizvodne ciljeve, tehnološki okvir, rokove ili bilo šta što nam pomaže da se pripremimo."
                    className="w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-200">Željeni format odgovora</span>
                    <select
                      name="responseStyle"
                      className="w-full rounded-xl border border-theme theme-card px-4 py-3 text-sm text-theme-primary focus:border-cyan-400 focus:outline-none"
                    >
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
                    {isPending ? 'Šalje se...' : 'Pošalji skicu'}
                    <Send className="h-4 w-4" strokeWidth={iconStrokeWidth} />
                  </button>
                </div>
                {state.status === 'success' && (
                  <p className="text-sm text-emerald-300" aria-live="polite">
                    {state.message}
                  </p>
                )}
                {state.status === 'error' && (
                  <p className="text-sm text-rose-300" aria-live="polite">
                    {state.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter bg-slate-900/35 py-20 md:py-24">
        <div className="site-container flex flex-col gap-8">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-cyan-400/85">Gde radimo</span>
            <h2 className="text-3xl font-medium text-theme-primary md:text-4xl">Globalno prisustvo, isti radni ritam</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-theme-muted">
              Distribuirani smo po dizajnu. Preklapamo se kroz EMEA i podržavamo severnoamerička jutra asinhronim ritualima, snimljenim stand-up-ovima i deljenim dashboard-ima.
            </p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-4">
              {officeLocations.map((office) => (
                <div
                  key={office.city}
                  className="flex flex-col gap-3 rounded-3xl border border-theme theme-card p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{office.city}</h3>
                    <p className="text-sm text-theme-muted">{office.address}</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">{office.timezone}</div>
                </div>
              ))}
            </div>
            <div className="relative flex h-72 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-theme theme-card p-6 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at top, rgba(56,189,248,0.22), rgba(15,23,42,0) 70%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <span className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.6)]" aria-hidden />
              <span className="absolute right-[22%] top-[40%] h-2 w-2 rounded-full bg-cyan-400/80 shadow-[0_0_18px_rgba(56,189,248,0.5)]" aria-hidden />
              <span className="absolute left-[48%] bottom-[28%] h-2 w-2 rounded-full bg-cyan-400/70 shadow-[0_0_18px_rgba(56,189,248,0.45)]" aria-hidden />
              <div className="relative space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-400/85">Mapa pokrivenosti</p>
                <p className="text-sm text-theme-muted">EMEA core sati sa prozorima preklapanja za Severnu Ameriku.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter py-20">
        <div className="site-container flex flex-col items-center gap-6 rounded-3xl border border-theme theme-card px-8 py-10 text-center">
          <h2 className="text-3xl font-medium text-theme-primary md:text-4xl">Spremni smo kada ste i vi</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-theme-muted">
            Podelite fazu finansiranja, KPI-jeve ili izazove i prilagodićemo agendu prve radionice. Ako nismo najbolji partner, uputićemo vas na nekoga iz naše mreže ko jeste.
          </p>
          <LiquidButton>
            Započnite razgovor <ArrowRight className="h-4 w-4" strokeWidth={iconStrokeWidth} />
          </LiquidButton>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-theme-muted">
            <PhoneCall className="h-4 w-4 text-cyan-400" strokeWidth={iconStrokeWidth} /> Uvodni telefonski razgovori dostupni su na zahtev
          </div>
        </div>
      </section>
    </div>
  );
}

