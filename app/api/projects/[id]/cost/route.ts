import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canEditCore } from "@/lib/permissions";
import { computeCost } from "@/lib/costing";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canEditCore(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projectId = params.id;
  const body = await req.json();
  const latest = await prisma.costVersion.findFirst({ where: { projectId }, orderBy: { version: "desc" } });
  const version = (latest?.version || 0) + 1;

  const results = computeCost(body.inputs);
  const cost = await prisma.costVersion.create({
    data: {
      projectId,
      version,
      scenarioId: body.scenarioId || null,
      modelVersionId: body.modelVersionId || null,
      patternVersionId: body.patternVersionId || null,
      inputsJson: JSON.stringify(body.inputs),
      resultsJson: JSON.stringify(results),
      note: body.note || "",
    },
  });
  return NextResponse.json(cost);
}
