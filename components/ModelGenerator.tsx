"use client";

import { FormEvent, useState } from "react";

export default function ModelGenerator({ projectId }: { projectId: string }) {
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/projects/${projectId}/model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: form.get("notes"), isValidated: form.get("isValidated") === "on" }),
    });
    setMsg(res.ok ? "Model Version erstellt" : "Fehler");
    if (res.ok) location.reload();
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 border rounded space-y-2">
      <textarea name="notes" placeholder="Notes" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isValidated" className="w-auto" /> validated</label>
      <button type="submit">Model Stub generieren</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
