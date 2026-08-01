'use client';

import { ArrowRight, PlayCircle, Rocket, Users, Sparkles } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const caseStudies = [
  {
    tag: 'SaaS',
    title: 'Helios Labs – analytics platform relaunch',
    outcome: '58% rast trial-to-paid konverzije kroz modularni onboarding i dashboard-e metrika rasta.',
  },
  {
    tag: 'Travel',
    title: 'Orbit Airlines – global booking overhaul',
    outcome: '6 tržišta lansirano za 120 dana uz real-time vidljivost operacija i automatizaciju oporavka usluge.',
  },
  {
    tag: 'Fintech',
    title: 'Northwind Bank – digital onboarding playbook',
    outcome: 'Aktivacija naloga skraćena na 5 minuta, CSAT porastao na 92%, opterećenje podrške smanjeno 38%.',
  },
  {
    tag: 'Retail',
    title: 'Mercury Collective – omnichannel membership',
    outcome: '+34% ponovljenih kupovina kroz loyalty tokove, mobile wallet pass i CRM sinhronizaciju.',
  },
];

const capabilities = [
  {
    title: 'Discovery sprintovi',
    description: 'Intervjui sa korisnicima, analiza funnel podataka i service blueprinting otkrivaju eksperimente visokog uticaja.',
    icon: Users,
  },
  {
    title: 'Prototip scena',
    description: 'Klikabilna putovanja, motion studije i engineering spike-ovi validiraju product priče pre roadmap-a.',
    icon: Sparkles,
  },
  {
    title: 'Operacije lansiranja',
    description: 'Orkestracija izdanja, povezivanje analitike i QA automatizacija vode od bete do skaliranja bez trenja.',
    icon: Rocket,
  },
];

const testimonials = [
  {
    quote:
      'Enigma je spojila proizvod, dizajn i inženjering u isti radni ritam. Isporučili su ono o čemu je naš interni tim mesecima raspravljao - bez haosa.',
    person: 'Amelia Rhodes',
    role: 'Chief Product Officer, Helios Labs',
  },
  {
    quote:
      'Njihov embedded model je delovao kao da smo angažovali tim koji već poznaje naš stack. Od migracije do merenja, proces je tekao prirodno.',
    person: 'Jonas Richter',
    role: 'VP Engineering, Orbit Airlines',
  },
];

export default function Projects() {
  return (
    <div className="theme-section transition-theme text-theme-primary">
      <section className="site-gutter relative overflow-hidden py-24">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-[420px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),rgba(168,85,247,0.1)_45%,rgba(15,23,42,0)_80%)] blur-[140px]"
          aria-hidden
        />
        <div className="site-container relative flex flex-col gap-12 lg:flex-row">
          <div className="space-y-6 lg:w-3/5">
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-4 py-2 text-xs uppercase tracking-[0.4em] text-cyan-300">
              Dokazana isporuka
            </span>
            <h1 className="font-aeonik text-4xl font-medium leading-tight text-theme-primary md:text-5xl">
              Product priče projektovane za merljive ishode
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300/85">
              Specijalizovani smo za lansiranja gde su ulozi visoki: nova tržišta, monetizacijski zaokreti ili potpune promene iskustva. Svaki projekat spaja brzo eksperimentisanje i odgovornu isporuku.
            </p>
            <div className="flex flex-wrap gap-3">
              <LiquidButton>
                Zatražite kompletan deck <ArrowRight className="h-4 w-4" />
              </LiquidButton>
              <LiquidButton variant="secondary">
                Pogledajte case study <PlayCircle className="h-5 w-5" />
              </LiquidButton>
            </div>
          </div>
          <div className="flex-1 space-y-5">
            <div className="flex h-[220px] items-center justify-center rounded-3xl border border-dashed border-theme theme-card-muted text-xs uppercase tracking-[0.45em] text-theme-muted">
              Mesto za case study reel
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {capabilities.map((capability) => (
                <div key={capability.title} className="rounded-3xl border border-theme theme-card p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-theme theme-card text-cyan-200">
                    <capability.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-theme-primary">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/80">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter py-24">
        <div className="site-container flex flex-col gap-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.4em] text-cyan-200/75">Odabrani case fajlovi</span>
              <h2 className="text-3xl font-medium text-theme-primary md:text-4xl">
                Svaki angažman isporučuje merljivo pre i posle
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-300/80">
              Istražite uzorak product priča koje možemo javno da podelimo. Svaka kartica vodi ka kratkom pregledu bez lozinke. Kompletna biblioteka case study-ja dostupna je na zahtev.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {caseStudies.map((study) => (
              <article key={study.title} className="group relative overflow-hidden rounded-3xl border border-theme theme-card transition-theme card-lift transform-gpu translate-y-0 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(168,85,247,0.16))',
                  mixBlendMode: 'screen',
                }} />
                <div className="relative space-y-4">
                  <span className="inline-flex items-center rounded-full border border-theme px-3 py-1 text-[10px] uppercase tracking-[0.45em] text-cyan-300">
                    {study.tag}
                  </span>
                  <h3 className="text-lg font-semibold text-theme-primary">{study.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300/85">{study.outcome}</p>
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-theme theme-card-muted text-[11px] uppercase tracking-[0.4em] text-theme-muted">
                    Mesto za vizual
                  </div>
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
                    Otvori sažetak <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter bg-slate-900/35 py-24">
        <div className="site-container flex flex-col gap-12">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-cyan-200/75">Utisci klijenata</span>
            <h2 className="text-3xl font-medium text-theme-primary md:text-4xl">Partneri sa druge strane lansiranja</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.person} className="relative overflow-hidden rounded-3xl border border-theme theme-card p-6 text-left">
                <div className="space-y-4">
                  <p className="text-base italic leading-relaxed text-slate-200/85">“{testimonial.quote}”</p>
                  <footer className="space-y-1 text-sm">
                    <div className="font-semibold text-theme-primary">{testimonial.person}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400/80">{testimonial.role}</div>
                  </footer>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="site-gutter py-24">
        <div className="site-container flex flex-col gap-10 rounded-3xl border border-theme theme-card px-8 py-10 text-center shadow-theme">
          <h2 className="text-3xl font-medium text-theme-primary md:text-4xl">Planirate lansiranje visokog uloga?</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300/80">
            Pokažite nam brief, prezentaciju ili KPI koji treba pomeriti. Mapiraćemo tim, rokove i dokaze iz sličnih lansiranja kako biste mogli da donesete informisanu odluku.
          </p>
          <LiquidButton className="mx-auto">
            Zakažite uvodni razgovor <ArrowRight className="h-4 w-4" />
          </LiquidButton>
        </div>
      </section>
    </div>
  );
}













