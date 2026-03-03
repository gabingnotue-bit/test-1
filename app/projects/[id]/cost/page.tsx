import { prisma } from "@/lib/prisma";
import CostForm from "@/components/CostForm";

export default async function ProjectCostPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return <p>Project not found</p>;

  const history = await prisma.costVersion.findMany({ where: { projectId: params.id }, orderBy: { version: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Costing - {project.title}</h1>
      <CostForm projectId={params.id} />
      <ul className="space-y-2">
        {history.map((c) => {
          const result = JSON.parse(c.resultsJson);
          return (
            <li key={c.id} className="bg-white border rounded p-3 text-sm">
              <div className="font-medium">Cost v{c.version}</div>
              <div>HT (probable): {result.probable.priceHT.toFixed(2)} €</div>
              <div>TTC (19%, rounded): {result.probable.priceTTCRounded} €</div>
              <div>min/prob/max total: {result.min.total.toFixed(2)} / {result.probable.total.toFixed(2)} / {result.max.total.toFixed(2)} €</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
