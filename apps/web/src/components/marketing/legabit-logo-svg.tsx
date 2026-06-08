/** Marca tipográfica (respaldo si no hay `public/legabit-logo.png`). Usa Cormorant Garamond del layout. */
export function LegabitLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Legabit — Derecho y tecnología"
      viewBox="0 0 288 58"
      width={220}
      height={48}
      className={["block h-9 w-auto max-w-[min(100%,220px)] sm:h-10", className].filter(Boolean).join(" ")}
    >
      <text
        x="0"
        y="34"
        fill="#1B1B1B"
        className="font-display text-[26px] font-semibold tracking-tight sm:text-[28px]"
        style={{ fontFamily: "var(--font-legabit-display), Georgia, serif" }}
      >
        LEGABIT
      </text>
      <text
        x="0"
        y="52"
        fill="#C2A95D"
        className="font-display text-[8px] font-semibold uppercase tracking-[0.35em] sm:text-[9px]"
        style={{ fontFamily: "var(--font-legabit-display), Georgia, serif" }}
      >
        Derecho y tecnología
      </text>
    </svg>
  );
}
