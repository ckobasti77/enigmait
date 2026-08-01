import { brandGuidelines } from "@/constants/brand-guidelines";

export default function BrandGuidelines() {
  return (
    <div className="theme-section transition-theme text-theme-primary">
      <section className="site-gutter relative py-24">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-[420px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),rgba(168,85,247,0.14)_55%,rgba(15,23,42,0)_85%)] blur-[160px]" aria-hidden />
        <div className="site-container relative flex flex-col gap-12">
          <header className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.6em] text-cyan-300">
              Smernice brenda
            </span>
            <h1 className="font-aeonik text-4xl font-medium leading-tight md:text-5xl">
              Održavanje priče Enigma Digital brenda doslednom na svakoj tački kontakta
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-theme-muted">
              Ove smernice pomažu članovima tima, partnerima i saradnicima da komuniciraju Enigma Digital brend jasno i samouvereno. Koristite ih kao okvir kada u naše ime kreirate copy, vizuale ili iskustva.
            </p>
            <div className="rounded-3xl border border-theme theme-card px-5 py-4 text-sm text-theme-muted transition-theme">
              <span className="font-semibold text-theme-primary">Poslednje ažuriranje:</span> 7. oktobar 2025.
            </div>
          </header>

          <div className="grid gap-6">
            {brandGuidelines.map((pillar) => (
              <article
                key={pillar.title}
                className="group relative overflow-hidden rounded-3xl border border-theme theme-card p-6 transition-theme transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-theme"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(168,85,247,0.14))",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="relative space-y-3">
                  <h2 className="text-lg font-semibold text-theme-primary">{pillar.title}</h2>
                  <p className="text-sm leading-relaxed text-theme-muted">{pillar.body}</p>
                </div>
              </article>
            ))}
          </div>

          <footer className="site-gutter rounded-3xl border border-theme theme-card py-5 text-sm text-theme-muted transition-theme">
            <p>
              Trebaju vam asset-i, template-i ili brand review? Pišite na{" "}
              <a
                href="mailto:hello@enigma.digital"
                className="font-medium text-theme-primary transition-theme hover:text-cyan-300"
              >
                hello@enigma.digital
              </a>{" "}
              i podelićemo najnoviji toolkit ili pomoći u proveri konzistentnosti sadržaja.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}

