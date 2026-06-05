import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { SkillsManager } from "@/features/people/components/skills-manager";
import { getPersonById, deletePerson } from "@/server/actions/people.actions";
import { getSkills } from "@/server/actions/skills.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const [person, allSkills] = await Promise.all([
    getPersonById(id).catch(() => null),
    getSkills().catch(() => []),
  ]);
  if (!person) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/people"
        backLabel="People"
        title={person.fullName}
        subtitle={person.position ?? undefined}
        badge={{ label: person.status.replace("_", " "), variant: person.status === "ACTIVE" ? "success" : "default" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild><Link href={`/people/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link></Button>
            {person.candidate && <Button variant="outline" size="sm" asChild><Link href={`/talent-pool/${person.candidate.id}`}>View Candidate</Link></Button>}
            <DeleteEntityButton entityName={person.fullName} deleteAction={deletePerson.bind(null, id)} redirectTo="/people" />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailField label="Email" value={person.email} />
              <DetailField label="Phone" value={person.phone} />
              <DetailField label="WhatsApp" value={person.whatsapp} />
              <DetailField label="Address" value={person.address} className="sm:col-span-2" />
            </DetailGrid>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Professional</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailField label="Experience" value={person.yearsExperience ? `${person.yearsExperience} years` : "—"} />
              <DetailField label="Joining Date" value={person.joiningDate ? formatDate(person.joiningDate) : "—"} />
              <DetailField label="Current Salary" value={person.currentSalary ? formatCurrency(Number(person.currentSalary), currency) : "—"} />
              <DetailField label="Expected Salary" value={person.expectedSalary ? formatCurrency(Number(person.expectedSalary), currency) : "—"} />
              <DetailField label="Portfolio" value={person.portfolioUrl ? <a href={person.portfolioUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">View</a> : "—"} />
              <DetailField label="LinkedIn" value={person.linkedinUrl ? <a href={person.linkedinUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">Profile</a> : "—"} />
              <DetailField label="GitHub" value={person.githubUrl ? <a href={person.githubUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">Profile</a> : "—"} />
            </DetailGrid>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
          <CardContent>
            <SkillsManager personId={id} personSkills={person.skills} allSkills={allSkills} />
          </CardContent>
        </Card>
        {person.user && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">System account: <span className="font-medium text-foreground">{person.user.email}</span> · {person.user.role.name}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
