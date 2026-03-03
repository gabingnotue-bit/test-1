import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canEditCore } from "@/lib/permissions";
import { analyzeSketch, generateRender } from "@/lib/stubs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canEditCore(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projectId = params.id;
  const latest = await prisma.modelVersion.findFirst({ where: { projectId }, orderBy: { version: "desc" } });
  const version = (latest?.version || 0) + 1;

  const spec = await analyzeSketch();
  const render = await generateRender(projectId, version);
  const asset = await prisma.asset.create({
    data: {
      type: "RENDER",
      filePath: render.filePath,
      mimeType: render.mimeType,
      originalName: render.originalName,
      projectId,
    },
  });

  const body = await req.json().catch(() => ({}));
  const model = await prisma.modelVersion.create({
    data: {
      projectId,
      version,
      notes: body.notes || "",
      specJson: JSON.stringify(spec),
      renderAssetId: asset.id,
      isValidated: Boolean(body.isValidated),
    },
  });

  return NextResponse.json(model);
}
