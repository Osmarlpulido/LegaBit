import fs from "fs";
import path from "path";

import Image from "next/image";

import { LegabitLogoSvg } from "@/components/marketing/legabit-logo-svg";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/** Rutas posibles con `turbo` / npm desde la raíz del monorepo o desde `apps/web`. */
function hasRasterLogoFile(): boolean {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "public", "legabit-logo.png"),
    path.join(cwd, "apps", "web", "public", "legabit-logo.png")
  ];
  return candidates.some((p) => {
    try {
      return fs.existsSync(p) && fs.statSync(p).size > 0;
    } catch {
      return false;
    }
  });
}

export function LegabitLogo({ className }: { className?: string }) {
  if (hasRasterLogoFile()) {
    return (
      <Image
        src="/legabit-logo.png"
        alt="Legabit — Derecho y tecnología"
        width={220}
        height={62}
        priority
        className={cx("h-9 w-auto max-w-[min(100%,220px)] sm:h-10", className)}
      />
    );
  }

  return <LegabitLogoSvg className={className} />;
}
