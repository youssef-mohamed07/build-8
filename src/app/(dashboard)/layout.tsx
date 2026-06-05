import { auth } from "@/lib/auth";
import { getDevSessionUser, isAuthSkipped } from "@/lib/skip-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";
import { getNotifications, getUnreadCount } from "@/server/actions/notifications.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const skipped = await isAuthSkipped();
  const user = session?.user ?? (skipped ? getDevSessionUser() : undefined);
  const [notifications, unreadCount, currency] = await Promise.all([
    getNotifications(10).catch(() => []),
    getUnreadCount().catch(() => 0),
    getPreferredCurrency(),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Build8"
          user={user}
          authSkipped={skipped}
          notifications={notifications}
          unreadCount={unreadCount}
          currency={currency}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
