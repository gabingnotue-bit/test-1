import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canEditCore } from "@/lib/permissions";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await prisma.clientProfile.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !canEditCore(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const client = await prisma.clientProfile.create({
    data: {
      name: body.name,
      notes: body.notes || "",
      measurementsJson: body.measurementsJson || "{}",
      preferencesJson: body.preferencesJson || "{}",
      photosJson: body.photosJson || "[]",
      createdById: user.id,
    },
  });
  return NextResponse.json(client);
}
