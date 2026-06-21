import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { Web3Provider } from "@/providers/web3-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-legabit-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Legabit — Derecho, tecnología y finanzas",
  description:
    "Ecosistema editorial y formativo con podcasts, newsletters, artículos, cursos y eventos sobre derecho, tecnología y finanzas."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
          <Web3Provider>{children}</Web3Provider>
        </body>
    </html>
  );
}
