import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canEditCore } from "@/lib/permissions";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !canEditCore(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      clientProfileId: body.clientProfileId,
      title: body.title,
      description: body.description || "",
      gender: body.gender,
      createdById: user.id,
    },
  });
  return NextResponse.json(project);
}
