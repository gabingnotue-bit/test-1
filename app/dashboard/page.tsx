import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getSessionUser();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p>Willkommen, {user?.email}</p>
      <div className="flex flex-wrap gap-3">
        <Link className="underline" href="/clients">Clients</Link>
        <Link className="underline" href="/admin/invites">Invites</Link>
      </div>
      <form action="/api/auth/logout" method="post">
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
