"use client";

import { FormEvent, useState } from "react";

export default function ClientCreateForm() {
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        notes: form.get("notes"),
        measurementsJson: form.get("measurementsJson"),
        preferencesJson: form.get("preferencesJson"),
        photosJson: "[]",
      }),
    });

    setMessage(res.ok ? "Client erstellt" : "Fehler");
    if (res.ok) location.reload();
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded p-4 space-y-2">
      <input name="name" placeholder="Name" required />
      <textarea name="notes" placeholder="Notizen" />
      <textarea name="measurementsJson" placeholder='{"chest": 100}' defaultValue="{}" />
      <textarea name="preferencesJson" placeholder='{"fit":"regular"}' defaultValue="{}" />
      <button type="submit">Client speichern</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
