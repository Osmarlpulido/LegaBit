import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function HeaderAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return <GoogleSignInButton />;
  }

  return (
    <div className="flex items-center gap-3">
      {user.email ? (
        <span className="hidden text-sm text-muted-foreground sm:inline" title={user.email}>
          {user.email}
        </span>
      ) : null}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-legabit-petrol/40 hover:text-legabit-petrol"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
