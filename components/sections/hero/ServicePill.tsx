type ServiceIcon = "website" | "shop" | "systems" | "mobile";

type ServicePillProps = {
  href: string;
  icon: ServiceIcon;
  label: string;
};

function ServiceIconSvg({ icon }: { icon: ServiceIcon }) {
  const gradientId = `service-pill-gradient-${icon}`;

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 drop-shadow-[0_0_12px_rgba(75,50,255,0.58)] sm:h-5 sm:w-5"
      fill="none"
      viewBox="0 0 28 28"
    >
      <defs>
        <linearGradient id={gradientId} x1="3" x2="25" y1="3" y2="25">
          <stop stopColor="#00B7FF" />
          <stop offset="0.35" stopColor="#006DFF" />
          <stop offset="0.68" stopColor="#4B32FF" />
          <stop offset="1" stopColor="#8B35FF" />
        </linearGradient>
      </defs>
      {icon === "website" ? (
        <>
          <circle cx="14" cy="14" r="10.2" stroke={`url(#${gradientId})`} strokeWidth="2" />
          <path d="M4.2 14h19.6M14 3.9c3 3.4 4.4 6.7 4.4 10.1S17 20.7 14 24.1M14 3.9C11 7.3 9.6 10.6 9.6 14S11 20.7 14 24.1" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeWidth="1.75" />
        </>
      ) : null}
      {icon === "shop" ? (
        <>
          <path d="M4.4 5.8h2.4l2.25 11.3h11.8l2.25-8.05H8.35" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="11.1" cy="22.2" r="1.6" fill={`url(#${gradientId})`} />
          <circle cx="20.3" cy="22.2" r="1.6" fill={`url(#${gradientId})`} />
        </>
      ) : null}
      {icon === "systems" ? (
        <>
          <ellipse cx="14" cy="7.4" rx="7.7" ry="3.2" stroke={`url(#${gradientId})`} strokeWidth="2" />
          <path d="M6.3 7.4v6.4c0 1.75 3.45 3.2 7.7 3.2s7.7-1.45 7.7-3.2V7.4" stroke={`url(#${gradientId})`} strokeWidth="2" />
          <path d="M6.3 13.8v6.4c0 1.75 3.45 3.2 7.7 3.2s7.7-1.45 7.7-3.2v-6.4" stroke={`url(#${gradientId})`} strokeWidth="2" />
        </>
      ) : null}
      {icon === "mobile" ? (
        <>
          <rect x="8.5" y="3.7" width="11" height="20.6" rx="2.25" stroke={`url(#${gradientId})`} strokeWidth="2" />
          <path d="M12.2 20.8h3.6" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeWidth="1.8" />
        </>
      ) : null}
    </svg>
  );
}

export function ServicePill({ href, icon, label }: ServicePillProps) {
  return (
    <a
      aria-label={`Usluga: ${label}`}
      className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition duration-300 hover:border-white/20 hover:bg-white/[0.045] sm:min-h-11 sm:rounded-xl sm:px-3.5"
      href={href}
    >
      <ServiceIconSvg icon={icon} />
      <span className="font-sans text-[0.58rem] font-semibold leading-tight tracking-[0.03em] sm:text-[0.68rem]">
        {label}
      </span>
    </a>
  );
}
