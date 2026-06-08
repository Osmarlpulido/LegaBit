export function LegabitWordmark({ className }: { className?: string }) {
  return (
    <span className={["font-display font-semibold tracking-tight text-foreground", className].filter(Boolean).join(" ")}>
      LEGABIT
    </span>
  );
}
