import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Web3Provider } from "@/providers/web3-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legabit — Derecho, tecnología y finanzas",
  description:
    "Ecosistema editorial y formativo con podcasts, newsletters, artículos, cursos y eventos sobre derecho, tecnología y finanzas."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
