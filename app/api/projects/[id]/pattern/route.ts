import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canEditCore } from "@/lib/permissions";
import { generatePatternPDF } from "@/lib/stubs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canEditCore(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projectId = params.id;
  const body = await req.json();
  const modelVersionId = body.modelVersionId as string;
  const modelVersion = await prisma.modelVersion.findUnique({ where: { id: modelVersionId } });

  if (!modelVersion || !modelVersion.isValidated) {
    return NextResponse.json({ error: "Model must be validated first" }, { status: 400 });
  }

  const latest = await prisma.patternVersion.findFirst({ where: { projectId }, orderBy: { version: "desc" } });
  const version = (latest?.version || 0) + 1;

  const pdf = await generatePatternPDF(projectId, version);
  const asset = await prisma.asset.create({
    data: {
      type: "PATTERN_PDF",
      filePath: pdf.filePath,
      mimeType: pdf.mimeType,
      originalName: pdf.originalName,
      projectId,
    },
  });

  const pattern = await prisma.patternVersion.create({
    data: {
      projectId,
      version,
      modelVersionId,
      pdfAssetId: asset.id,
      metaJson: JSON.stringify({ total_cut_area_cm2: pdf.total_cut_area_cm2 }),
    },
  });

  return NextResponse.json(pattern);
}
