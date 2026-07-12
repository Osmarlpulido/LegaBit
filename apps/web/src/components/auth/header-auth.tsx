import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
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
      <SignOutButton />
    </div>
  );
}
