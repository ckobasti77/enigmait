# AGENTS.md

## Project Identity

This project is the official website for **Enigma IT**, a premium IT / software / web development agency.

Enigma IT builds:

- custom websites
- web-shops
- digital systems
- mobile applications
- business-focused software solutions

The brand should feel:

- premium
- elegant
- futuristic
- clean
- confident
- technical
- trustworthy
- conversion-focused
- built for serious clients

The website must not feel:

- cheap
- generic
- childish
- gaming-oriented
- overloaded
- like a basic SaaS template
- like a WordPress template
- like random AI-generated neon sci-fi

The agency’s main positioning:

```txt
Custom coded digital products for serious businesses.
No generic templates. No WordPress-like look. Premium engineering and business-focused design.
Main Visual Direction

The Enigma IT website should use a dark premium futuristic style.

Core visual direction:

deep black / deep navy backgrounds
silver-white typography
electric blue / cyan / violet / purple gradients
soft glow
subtle glass panels
refined borders
minimal but impressive visuals
strong negative space
clean component hierarchy
premium dark tech atmosphere

The design should feel high-end, not loud.

Use futuristic effects carefully. Glow, gradients and particles are allowed, but they must be restrained and elegant.

Brand Colors
Primary Background Colors

Use these for the main dark theme:

Deep Black: #02030A
Dark Navy: #030712
Deep Blue Black: #050816
Panel Navy: #070B18
Soft Border Dark: rgba(255, 255, 255, 0.08)
Main Text Colors
Main White / Silver: #F5F7FA
Soft Silver: #D7DCE5
Muted Text: rgba(255, 255, 255, 0.65)
Very Muted Text: rgba(255, 255, 255, 0.45)
Main Brand Gradient

This is the official Enigma IT gradient and should be used for important accents, CTA buttons, glow effects, icon accents, active states and highlighted words.

#00B7FF → #006DFF → #6B37FF → #8B35FF

Recommended CSS:

background: linear-gradient(
  135deg,
  #00B7FF 0%,
  #006DFF 46%,
  #6B37FF 60%,
  #8B35FF 100%
);

For text gradient:

background: linear-gradient(
  135deg,
  #00B7FF 0%,
  #006DFF 46%,
  #6B37FF 60%,
  #8B35FF 100%
);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
Glow Colors

Use glow softly. Do not overdo it.

Blue Glow: rgba(0, 183, 255, 0.35)
Deep Blue Glow: rgba(0, 109, 255, 0.35)
Violet Glow: rgba(75, 50, 255, 0.35)
Purple Glow: rgba(139, 53, 255, 0.35)

Recommended glow:

box-shadow:
  0 0 24px rgba(0, 183, 255, 0.22),
  0 0 64px rgba(75, 50, 255, 0.18);
Typography
Primary Display Font

Use local font:

public/fonts/microgramma-d-extended-bold.otf

Font name in code:

Microgramma

Use it for:

main hero titles
premium section headlines
selected large visual statements
strong futuristic labels where appropriate

Do not use it for long paragraphs.

Accent Font

Use:

Orbitron

Use Orbitron for:

badges
small labels
service pills
technical tags
futuristic UI labels
small nav accents if appropriate

Prefer installing/loading it through next/font/google.

Recommended weights:

600
700
800
900

Do not use Orbitron for all body text.

Body Font

Use a readable modern sans-serif font.

Preferred options:

Inter
Space Grotesk
Sora
Manrope

Recommended default:

Inter or Space Grotesk

Use body font for:

paragraphs
navigation
button text
normal section content
cards
forms
FAQ
footer
Typography Rules
Headlines should feel premium and technical.
Paragraphs must remain very readable.
Avoid too many different fonts.
Use Microgramma only where it creates impact.
Use Orbitron only for accents.
Use body font for most UI text.
Do not let futuristic fonts damage readability.
Assets

Current public assets:

public/images/hero-background.avif
public/logos/logo-emblem.png
public/fonts/microgramma-d-extended-bold.otf

Usage:

hero-background.avif is used as an atmospheric hero background.
logo-emblem.png is used as the navbar logo.
microgramma-d-extended-bold.otf is used as the local display font.

Rules:

Do not replace these files without instruction.
Do not use the full hero as one static image.
Background images can support atmosphere, but layout, text, buttons and CTAs must be real HTML.
Use next/image for logos and important images where appropriate.
Keep asset paths stable and predictable.
Recommended Project Structure

Use a clean, scalable Next.js structure.

Preferred structure:

src/
  app/
    layout.tsx
    page.tsx
    globals.css

  components/
    layout/
      SiteHeader.tsx
      SiteFooter.tsx

    sections/
      hero/
        Hero.tsx
        HeroNavbar.tsx
        GrowthVisual.tsx
        ServicePill.tsx
        CTAButton.tsx
        index.ts

      services/
        ServicesSection.tsx

      process/
        ProcessSection.tsx

      portfolio/
        PortfolioSection.tsx

      contact/
        ContactSection.tsx

    ui/
      Button.tsx
      Container.tsx
      Section.tsx
      Badge.tsx

  constants/
    navigation.ts
    services.ts
    site.ts

  lib/
    utils.ts

  styles/
    animations.css

If the project does not use src/, adapt to the existing structure, but keep the same logic.

Do not create random folders.

Do not scatter hero code across unrelated files.

For this project, section components should usually live in:

components/sections/

Shared reusable UI should live in:

components/ui/

Site-level components should live in:

components/layout/

Static data should live in:

constants/

Utility functions should live in:

lib/
Component Rules

Components should be:

clean
readable
reusable where useful
not over-engineered
typed with TypeScript
styled with Tailwind CSS
responsive by default

Preferred component style:

type ComponentProps = {
  className?: string;
};

export function ComponentName({ className }: ComponentProps) {
  return (
    <section className={className}>
      ...
    </section>
  );
}

Use cn() utility if available.

If cn() does not exist and is useful, create it in:

src/lib/utils.ts

Common cn() implementation:

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

Only add clsx and tailwind-merge if they are already installed or if the project clearly benefits from them. Do not add unnecessary dependencies.

Tailwind CSS Rules

Use Tailwind CSS for layout and styling.

Rules:

prefer Tailwind utilities over custom CSS
use custom CSS only for fonts, keyframes, complex SVG animation or global tokens
do not pollute global styles
avoid giant unreadable class strings when component extraction would be cleaner
keep responsive classes intentional
use semantic spacing and consistent radius/shadow systems

Preferred visual values:

Large radius: rounded-2xl / rounded-3xl
Panels: bg-white/[0.03] or bg-white/[0.04]
Borders: border-white/10
Muted text: text-white/60 or text-white/65
Main text: text-white or text-[#F5F7FA]
Animation Rules

Animations should be:

subtle
premium
slow enough to feel expensive
not distracting
not causing layout shift
not breaking performance

Preferred animation methods:

CSS animations
SVG stroke animations
Framer Motion only if already installed or explicitly requested

Do not install Framer Motion just for simple animations.

Good animation examples:

glowing arrow path draws from bottom to top
CTA glow gently pulses
particles fade softly
bars rise subtly
background glow slowly moves
cards fade in gently

Bad animation examples:

fast neon flashing
gaming-style effects
excessive particle storms
random floating dashboard cards everywhere
harsh motion that distracts from the CTA
Hero Section Direction

The hero section is the main conversion section.

It should include:

top navbar
Enigma IT emblem
navigation links
CTA button
badge
large headline
supporting paragraph
primary and secondary CTA
service pills
right-side growth visual
dark futuristic atmosphere

Hero navbar links:

Usluge
Proces
Portfolio
Kontakt

Navbar Redesign Direction

Desktop navbar:

left side keeps the current Enigma IT logo/emblem
center navigation keeps the primary links
Usluge must open a clean dropdown
the Usluge dropdown must show the same four hero service categories:

WEBSAJTOVI
WEB-SHOPOVI
DIGITALNI SISTEMI
MOBILNE APLIKACIJE

right side shows compact social/contact actions:

TikTok
Instagram
Facebook
Email
Phone

Social/contact actions should be icon-first, refined, accessible and visually consistent with the dark glass navbar. Use inline SVG or the existing icon system if available. Do not add a heavy icon dependency only for these icons.

Mobile navbar:

show logo on the left
show a clean burger button on the right
open a dark premium mobile menu panel
include navigation links, the four service links, and social/contact actions
menu interactions must be keyboard accessible
avoid overcrowding the mobile header

Route placeholders:

Create App Router route files for future pages and service subpages when navigation is introduced, but keep them as non-functional placeholders until real page content is requested. Placeholder routes may intentionally return notFound() so the files exist without launching unfinished pages.

Main CTA:

Zakažite konsultacije

Secondary CTA:

Pogledajte naš rad

Hero badge/logo:

Use `public/logos/logo-text.png` in place of the text badge.

Hero title:

Gradimo digitalne
proizvode koji
pokreću rast.

The word rast. must use the official brand gradient:

#00B7FF → #006DFF → #6B37FF → #8B35FF

Hero paragraph:

Enigma IT kreira vrhunske websajtove, web-shopove, digitalne sisteme i mobilne aplikacije koji pojednostavljuju procese, jačaju brendove i donose merljiv rast.

Service pills:

WEBSAJTOVI
WEB-SHOPOVI
DIGITALNI SISTEMI
MOBILNE APLIKACIJE
Growth Visual Direction

The hero right-side visual should represent business growth and premium digital engineering.

It should contain:

upward glowing arc
arrow head
bar chart
circular holographic base
subtle network lines
particles
blue/cyan/violet/purple gradient glow

The growth visual should not be a generic dashboard.

Best implementation:

inline SVG React component
CSS/SVG animation
responsive SVG viewBox
gradient strokes
soft filters
masks if useful
animated stroke-dasharray / stroke-dashoffset
animated bars
subtle opacity pulses

The visual should look like a premium tech growth symbol, not a finance app screenshot.

Process Section Direction

The process section ("Naš proces") showcases the 5 steps of the development lifecycle:
- Badge: NAŠ PROCES ✦
- Title: "Od ideje do gotovog rešenja." where the word "rešenja." is in the brand gradient.
- Description: "Pratimo jasan i proveren proces koji obezbeđuje kvalitet, transparentnost i rezultate koji prave stvarnu razliku za vaš biznis."
- Steps:
  1. 01 - IDEJA & ANALIZA: lightbulb icon, cyan/blue theme.
  2. 02 - PLANIRANJE & DIZAJN: pencil icon, blue/violet theme.
  3. 03 - RAZVOJ & IMPLEMENTACIJA: code icon, violet theme.
  4. 04 - TESTIRANJE & OPTIMIZACIJA: rocket icon, purple theme.
  5. 05 - LAUNCH & PODRŠKA: check icon, purple/pink theme.
- Card styling: glass-like transparency with border-white/[0.06], rounded-2xl, and hover-triggered vertical float (+ hover glow intensity).
- Layout:
  - Desktop: 5 horizontal cards connected by an absolute dotted line with pulsing diamond markers.
  - Mobile: Vertical stacked layout connected by a vertical dotted line down the center.
- Footer: A wide glassmorphic CTA/info panel featuring a glowing star emblem, support text, and a stylized vector wave grid on the right side.

Responsive Rules

Desktop:

navbar at the top inside a rounded dark glass panel
logo left
nav links centered
CTA right
hero text left
growth visual right
service pills near lower left / below CTA area
strong 2-column composition

Tablet:

reduce title size
keep visual smaller
preserve hierarchy
avoid overcrowding

Mobile:

simplify navbar
stack content vertically
headline must remain readable
CTAs can stack or wrap
service pills wrap
growth visual can move below content or become a subtle background element
do not let the visual overpower the text
avoid ugly text breaks
Content Tone

Copy should feel:

clear
premium
direct
business-focused
confident
Serbian language, Latin script
no unnecessary buzzwords
no exaggerated empty promises

Good tone:

Gradimo digitalne proizvode koji pokreću rast.

Bad tone:

Mi smo revolucionarna AI budućnost digitalnog univerzuma.

Avoid cringe marketing.

Avoid vague claims.

Prefer clear business value.

Accessibility

Follow basic accessibility:

semantic HTML
readable contrast
buttons and links must be keyboard accessible
images should have meaningful alt text or empty alt if decorative
do not use text inside images when real HTML is possible
avoid tiny text
avoid motion that is too aggressive

If animations are complex, respect reduced motion:

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    scroll-behavior: auto;
  }
}

Use this carefully and do not globally break necessary UI behavior.

Performance Rules

Keep the website fast.

Rules:

avoid heavy dependencies
avoid unnecessary client components
use server components by default where possible
use "use client" only when needed
optimize images
avoid huge JS for visual-only effects
prefer CSS/SVG animations instead of heavy animation libraries
do not load too many fonts/weights
avoid layout shift

For the hero:

use image background carefully
keep SVG optimized
do not use canvas/WebGL unless explicitly requested
do not use three.js for this hero unless explicitly requested
Next.js Rules

Before making changes, inspect:

App Router or Pages Router
Tailwind setup
TypeScript setup
existing component structure
existing global CSS
existing font setup
existing path aliases

Do not assume.

Use App Router conventions if the project uses App Router.

Use Pages Router conventions only if the project already uses Pages Router.

Do not mix patterns unnecessarily.

Validation Rules

After implementation, run available commands:

npm run lint
npm run typecheck
npm run build

If a command does not exist, say that it does not exist.

Fix implementation errors.

Do not ignore TypeScript, lint or build errors caused by the implementation.

Final Response Requirements

After completing a task, summarize:

files changed
components created or updated
fonts loaded
assets used
important implementation details
validation commands run
any remaining manual steps

Do not over-explain.
