import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: invite.email,
      role: invite.role,
      passwordHash,
      isActive: true,
    },
  });

  await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
