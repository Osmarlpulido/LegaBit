import Link from "next/link";

export const metadata = {
  title: "Error de autenticación — Legabit"
};

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-6 py-24">
      <h1 className="font-display text-3xl text-legabit-charcoal">No pudimos iniciar sesión</h1>
      <p className="text-muted-foreground">
        El enlace de acceso caducó o ya se usó. Vuelve a intentarlo con Google desde la página
        principal.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-legabit-charcoal px-4 py-2.5 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
