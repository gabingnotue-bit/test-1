"use client";

import { FormEvent, useState } from "react";

export default function InviteManager() {
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), role: form.get("role") }),
    });
    setMessage(res.ok ? "Invite erstellt" : "Fehler beim Erstellen");
    if (res.ok) location.reload();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-4 border rounded">
      <input name="email" placeholder="email" required />
      <select name="role" defaultValue="VIEWER">
        {["OWNER", "ADMIN", "DESIGNER", "TAILOR", "VIEWER"].map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button type="submit">Invite erstellen</button>
      {message ? <p className="text-sm col-span-full">{message}</p> : null}
    </form>
  );
}
