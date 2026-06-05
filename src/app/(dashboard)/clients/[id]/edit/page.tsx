import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/features/clients/components/client-form";
import { getClientById } from "@/server/actions/clients.actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id).catch(() => null);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Client" description={client.companyName} />
      <ClientForm
        clientId={id}
        defaultValues={{
          companyName: client.companyName,
          contactPerson: client.contactPerson ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          whatsapp: client.whatsapp ?? "",
          country: client.country ?? "",
          address: client.address ?? "",
          website: client.website ?? "",
          status: client.status,
        }}
      />
    </div>
  );
}
