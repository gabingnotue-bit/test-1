import { getSessionUser } from "@/lib/auth";
import { canManageInvites } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import InviteManager from "@/components/InviteManager";

export default async function InvitesPage() {
  const user = await getSessionUser();
  if (!user || !canManageInvites(user.role)) return <p>Forbidden</p>;

  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Invites</h1>
      <InviteManager />
      <ul className="space-y-2">
        {invites.map((i) => (
          <li key={i.id} className="bg-white border rounded p-3 text-sm">
            <div>{i.email} - {i.role} {i.usedAt ? "(used)" : "(open)"}</div>
            <div className="break-all">{baseUrl}/accept-invite?token={i.token}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
