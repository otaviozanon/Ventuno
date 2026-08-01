import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ventuno - Blackjack",
  description: "Multiplayer Blackjack em tempo real",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
