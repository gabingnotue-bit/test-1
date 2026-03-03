import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PatternGenerator from "@/components/PatternGenerator";

export default async function ProjectPatternPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return <p>Project not found</p>;

  const models = await prisma.modelVersion.findMany({ where: { projectId: params.id, isValidated: true }, orderBy: { version: "desc" } });
  const patterns = await prisma.patternVersion.findMany({ where: { projectId: params.id }, orderBy: { version: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pattern Versions - {project.title}</h1>
      <PatternGenerator projectId={params.id} validatedModels={models.map((m) => ({ id: m.id, version: m.version }))} />
      <ul className="space-y-2">
        {patterns.map((p) => (
          <li key={p.id} className="bg-white border rounded p-3 text-sm">
            <div>Pattern v{p.version} (from model {p.modelVersionId})</div>
            <Link href={`/api/files/${p.pdfAssetId}`} className="underline">Download pattern PDF</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
