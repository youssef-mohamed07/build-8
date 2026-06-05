import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getCompanySettings, getNotificationPrefs } from "@/server/actions/settings.actions";
import { requireAuth } from "@/lib/rbac/check-permission";
import { resolveUserId } from "@/lib/resolve-user-id";

export default async function SettingsPage() {
  const user = await requireAuth();
  const userId = await resolveUserId(user.id);
  const [company, notificationPrefs] = await Promise.all([
    getCompanySettings().catch(() => ({ name: "Build8", email: "", phone: "", address: "", taxId: "" })),
    getNotificationPrefs(userId).catch(() => ({})),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage company and system settings" />
      <SettingsForm company={company as Record<string, string>} notificationPrefs={notificationPrefs as Record<string, boolean>} userId={userId} />
    </div>
  );
}
