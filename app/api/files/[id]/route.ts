import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asset = await prisma.asset.findUnique({ where: { id: params.id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await fs.readFile(asset.filePath);
  return new NextResponse(data, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": `attachment; filename=\"${asset.originalName}\"`,
    },
  });
}
