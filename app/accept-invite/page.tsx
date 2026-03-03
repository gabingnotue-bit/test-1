"use client";

import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.get("password") }),
    });
    if (!res.ok) {
      setMessage("Einladung ungültig oder abgelaufen");
      return;
    }
    setMessage("Konto erstellt. Bitte einloggen.");
    router.push("/login");
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded border space-y-3">
      <h1 className="text-2xl font-semibold">Einladung annehmen</h1>
      <p className="text-sm break-all">Token: {token || "(fehlt)"}</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="password" type="password" placeholder="Passwort setzen" required />
        <button type="submit">Konto erstellen</button>
      </form>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
