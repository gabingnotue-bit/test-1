import "./globals.css";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-white border-b p-4 flex justify-between">
            <Link href="/dashboard" className="font-semibold">Y&I TailorLab</Link>
            {user ? <div className="text-sm">{user.email} ({user.role})</div> : null}
          </header>
          <main className="p-6 max-w-6xl mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
