import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ModelGenerator from "@/components/ModelGenerator";

export default async function ProjectModelPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  const models = await prisma.modelVersion.findMany({ where: { projectId: params.id }, orderBy: { version: "desc" } });

  if (!project) return <p>Project not found</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Model Versions - {project.title}</h1>
      <ModelGenerator projectId={params.id} />
      <ul className="space-y-2">
        {models.map((m) => (
          <li key={m.id} className="bg-white border rounded p-3 text-sm">
            <div>v{m.version} {m.isValidated ? "✅ validated" : "❌ not validated"}</div>
            <div>{m.notes}</div>
            {m.renderAssetId ? <Link className="underline" href={`/api/files/${m.renderAssetId}`}>Download final model image (stub)</Link> : null}
          </li>
        ))}
      </ul>
      <Link href={`/projects/${params.id}/pattern`} className="underline">To pattern generation</Link>
    </div>
  );
}
