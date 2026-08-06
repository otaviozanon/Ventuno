import type { Metadata } from "next";
import { Righteous, Russo_One } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-russo-one",
});

export const metadata: Metadata = {
  title: "Ventuno - Blackjack",
  description: "Multiplayer Blackjack em tempo real",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`antialiased ${righteous.variable} ${russoOne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
