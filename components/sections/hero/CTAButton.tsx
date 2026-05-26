type CTAButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id="cta-arrow-gradient" x1="5" x2="18" y1="6.6" y2="17.4">
          <stop stopColor="#00B7FF" />
          <stop offset="0.35" stopColor="#006DFF" />
          <stop offset="0.68" stopColor="#4B32FF" />
          <stop offset="1" stopColor="#8B35FF" />
        </linearGradient>
      </defs>
      <path
        d="M5 12h13m-5.4-5.4L18 12l-5.4 5.4"
        stroke="url(#cta-arrow-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.03]"
    >
      <svg className="h-5 w-5 drop-shadow-[0_0_14px_rgba(0,183,255,0.75)]" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="play-gradient" x1="3" x2="21" y1="3" y2="21">
            <stop stopColor="#00B7FF" />
            <stop offset="0.35" stopColor="#006DFF" />
            <stop offset="0.68" stopColor="#4B32FF" />
            <stop offset="1" stopColor="#8B35FF" />
          </linearGradient>
        </defs>
        <path
          d="M7.2 5.5c0-1.28 1.42-2.05 2.5-1.36l9.62 6.16c1.01.65 1.01 2.13 0 2.78L9.7 19.24c-1.08.69-2.5-.08-2.5-1.36V5.5Z"
          fill="url(#play-gradient)"
        />
      </svg>
    </span>
  );
}

export function CTAButton({
  children,
  href,
  variant = "primary",
}: CTAButtonProps) {
  if (variant === "secondary") {
    return (
      <a
        className="group inline-flex min-h-10 w-full -skew-x-12 items-center justify-center rounded-[0.9rem] border border-white/20 bg-white/[0.025] px-5 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition duration-300 hover:border-white/35 hover:bg-white/[0.055] sm:w-auto sm:min-w-[235px] md:min-h-12 md:text-[0.95rem]"
        href={href}
      >
        <span className="inline-flex skew-x-12 items-center justify-center gap-3">
          <PlayIcon />
          <span>{children}</span>
        </span>
      </a>
    );
  }

  return (
    <a
      className="cta-pulse group inline-flex min-h-10 w-full -skew-x-12 items-center justify-center rounded-[0.9rem] bg-[linear-gradient(135deg,#00B7FF_0%,#006DFF_35%,#4B32FF_68%,#8B35FF_100%)] px-5 text-sm font-semibold text-white transition duration-300 hover:scale-[1.015] hover:brightness-110 sm:w-auto sm:min-w-[250px] md:min-h-12 md:text-[0.95rem]"
      href={href}
    >
      <span className="inline-flex skew-x-12 items-center justify-center gap-3">
        <span>{children}</span>
        <ArrowIcon />
      </span>
    </a>
  );
}
