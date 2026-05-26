import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const microgramma = localFont({
  src: "../public/fonts/microgramma-d-extended-bold.otf",
  variable: "--font-microgramma",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enigma IT | Custom coded digital products",
  description:
    "Enigma IT kreira premium websajtove, web-shopove, digitalne sisteme i mobilne aplikacije za ozbiljne biznise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr-Latn"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${microgramma.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
