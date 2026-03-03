import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectCreateForm from "@/components/ProjectCreateForm";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.clientProfile.findUnique({ where: { id: params.id }, include: { projects: true } });
  if (!client) return <p>Client not found</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{client.name}</h1>
      <p className="text-sm">Measurements JSON: {client.measurementsJson}</p>
      <p className="text-sm">Preferences JSON: {client.preferencesJson}</p>
      <ProjectCreateForm clientProfileId={client.id} />
      <h2 className="text-xl">Projekte</h2>
      <ul className="space-y-2">
        {client.projects.map((p) => (
          <li key={p.id} className="bg-white p-3 border rounded space-x-2">
            <span>{p.title} ({p.gender})</span>
            <Link href={`/projects/${p.id}/model`} className="underline">Model</Link>
            <Link href={`/projects/${p.id}/pattern`} className="underline">Pattern</Link>
            <Link href={`/projects/${p.id}/cost`} className="underline">Cost</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
