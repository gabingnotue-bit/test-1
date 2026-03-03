"use client";

import { FormEvent, useState } from "react";

export default function PatternGenerator({ projectId, validatedModels }: { projectId: string; validatedModels: { id: string; version: number }[] }) {
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/projects/${projectId}/pattern`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelVersionId: form.get("modelVersionId") }),
    });
    setMsg(res.ok ? "Pattern erstellt" : "Fehler (nur validiertes model) ");
    if (res.ok) location.reload();
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 border rounded space-y-2">
      <select name="modelVersionId" required>
        <option value="">Validated model wählen</option>
        {validatedModels.map((m) => <option key={m.id} value={m.id}>Model v{m.version}</option>)}
      </select>
      <button type="submit">Pattern PDF generieren</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
