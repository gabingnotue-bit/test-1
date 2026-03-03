"use client";

import { FormEvent, useState } from "react";

export default function CostForm({ projectId }: { projectId: string }) {
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string, d = 0) => Number(f.get(k) || d);

    const inputs = {
      totalCutAreaCm2: num("totalCutAreaCm2", 8500),
      fabricPricePerM: num("fabricPricePerM", 24),
      fabricWidthCm: num("fabricWidthCm", 150),
      markerEfficiency: num("markerEfficiency", 82),
      wastePct: num("wastePct", 8),
      matchExtraPct: num("matchExtraPct", 3),
      notions: num("notions", 5),
      lining: num("lining", 0),
      fusible: num("fusible", 0),
      laborMinutes: num("laborMinutes", 140),
      laborCostPerMinute: num("laborCostPerMinute", 0.45),
      overheadMode: String(f.get("overheadMode") || "percent"),
      overheadValue: num("overheadValue", 15),
      packaging: num("packaging", 2),
      transport: num("transport", 4),
      marginMode: String(f.get("marginMode") || "percent"),
      marginValue: num("marginValue", 45),
    };

    const res = await fetch(`/api/projects/${projectId}/cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs, note: String(f.get("note") || "") }),
    });

    setMsg(res.ok ? "Kostenversion gespeichert" : "Fehler");
    if (res.ok) location.reload();
  }

  const fields = [
    "totalCutAreaCm2","fabricPricePerM","fabricWidthCm","markerEfficiency","wastePct","matchExtraPct","notions","lining","fusible",
    "laborMinutes","laborCostPerMinute","overheadValue","packaging","transport","marginValue"
  ];

  return (
    <form onSubmit={submit} className="bg-white border rounded p-4 grid md:grid-cols-2 gap-2">
      {fields.map((k) => <input key={k} name={k} placeholder={k} />)}
      <select name="overheadMode"><option value="percent">overhead percent</option><option value="fixed">overhead fixed</option></select>
      <select name="marginMode"><option value="percent">margin percent</option><option value="multiplier">margin multiplier</option><option value="fixed">margin fixed</option></select>
      <textarea name="note" placeholder="Notiz" className="md:col-span-2" />
      <button className="md:col-span-2" type="submit">Kosten berechnen & speichern</button>
      {msg ? <p className="md:col-span-2 text-sm">{msg}</p> : null}
    </form>
  );
}
