"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateCompanySettings, updateNotificationPrefs } from "@/server/actions/settings.actions";

export function SettingsForm({
  company,
  notificationPrefs,
  userId,
}: {
  company: Record<string, string>;
  notificationPrefs: Record<string, boolean>;
  userId: string;
}) {
  const [companyData, setCompanyData] = useState(company);
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [saving, setSaving] = useState(false);

  async function saveCompany() {
    setSaving(true);
    const result = await updateCompanySettings({
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone,
      address: companyData.address,
      taxId: companyData.taxId,
    });
    setSaving(false);
    result.success ? toast.success("Company settings saved") : toast.error(result.error);
  }

  async function savePrefs() {
    setSaving(true);
    const result = await updateNotificationPrefs(userId, prefs);
    setSaving(false);
    result.success ? toast.success("Notification preferences saved") : toast.error(result.error);
  }

  const prefLabels: Record<string, string> = {
    newClient: "New Client Added",
    newPayment: "New Payment Received",
    projectDeadline: "Project Deadline Approaching",
    invoiceOverdue: "Invoice Overdue",
    newCandidate: "New Candidate Added",
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Settings</CardTitle>
          <CardDescription>Basic company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["name", "email", "phone", "taxId"] as const).map((key) => (
              <div key={key} className="space-y-2">
                <Label>{key === "taxId" ? "Tax ID" : key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <Input
                  value={companyData[key] ?? ""}
                  onChange={(e) => setCompanyData({ ...companyData, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input value={companyData.address ?? ""} onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })} />
            </div>
          </div>
          <Button onClick={saveCompany} disabled={saving}>Save Company Settings</Button>
        </CardContent>
      </Card>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Configure in-app notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(prefLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                checked={prefs[key] ?? true}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          ))}
          <Button onClick={savePrefs} disabled={saving}>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
