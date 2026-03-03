import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canManageInvites } from "@/lib/permissions";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !canManageInvites(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(invites);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !canManageInvites(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role } = await req.json();
  const token = crypto.randomBytes(24).toString("hex");
  const invite = await prisma.invite.create({
    data: {
      token,
      email,
      role,
      createdById: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  return NextResponse.json(invite);
}
