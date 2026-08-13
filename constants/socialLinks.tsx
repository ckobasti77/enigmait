import { Mail, Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/**
 * One source for every social/kontakt link on the site. No "use client":
 * the server Footer and the client SocialDropdown both import from here.
 */
export type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  external?: boolean;
  /** Footer chip hover text; falls back to `label`. */
  tooltip?: string;
  /** Footer chip accessible name; falls back to `label`. */
  ariaLabel?: string;
};

export const InstagramIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

export const TikTokIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M14 5v9.2a4.3 4.3 0 1 1-3.8-4.27"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M14 5c.55 2.75 2.2 4.35 5 4.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

export const FacebookIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M14.4 8.2H16V5.5h-2.15c-2.25 0-3.45 1.35-3.45 3.55v1.55H8v2.8h2.4V19h3v-5.6h2.25l.35-2.8h-2.6V9.35c0-.75.32-1.15 1-1.15Z"
      fill="currentColor"
    />
  </svg>
);

export const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/enigmadigital.studio",
    icon: InstagramIcon,
    external: true,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@enigmadigital.studio",
    icon: TikTokIcon,
    external: true,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/enigmadigital.studio",
    icon: FacebookIcon,
    external: true,
  },
  {
    label: "Email",
    href: "mailto:office@enigmait.rs",
    icon: Mail,
    tooltip: "office@enigmait.rs",
    ariaLabel: "Pošalji e-poštu na office@enigmait.rs",
  },
  {
    label: "Telefon",
    href: "tel:+442045771943",
    icon: Phone,
    tooltip: "+44 20 4577 1943",
    ariaLabel: "Pozovi +44 20 4577 1943",
  },
];
