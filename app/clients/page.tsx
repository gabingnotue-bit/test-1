import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ClientCreateForm from "@/components/ClientCreateForm";

export default async function ClientsPage() {
  const clients = await prisma.clientProfile.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <ClientCreateForm />
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id} className="bg-white border rounded p-3">
            <Link href={`/clients/${c.id}`} className="underline">{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
