"use client";

import { FormEvent, useState } from "react";

export default function ProjectCreateForm({ clientProfileId }: { clientProfileId: string }) {
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientProfileId,
        title: form.get("title"),
        description: form.get("description"),
        gender: form.get("gender"),
      }),
    });
    setMessage(res.ok ? "Projekt erstellt" : "Fehler");
    if (res.ok) location.reload();
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded p-4 space-y-2">
      <input name="title" placeholder="Projektname" required />
      <input name="description" placeholder="Beschreibung" />
      <select name="gender" defaultValue="MALE">
        <option value="MALE">MALE</option>
        <option value="FEMALE">FEMALE</option>
      </select>
      <button type="submit">Projekt anlegen</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
