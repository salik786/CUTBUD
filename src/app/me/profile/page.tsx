import { BottomNav } from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">Profile</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {user ? (
          <p className="text-sm text-muted">
            Signed in via {user.oauthProvider}. Account settings ship in a later phase.
          </p>
        ) : (
          <p className="text-sm text-muted">
            You&apos;re not signed in yet — save a cut card to create an account.
          </p>
        )}
      </main>
      <BottomNav active="profile" />
    </div>
  );
}
