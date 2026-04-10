"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { workoutTemplates } from "@/lib/data";
import { getTodayString, readDraft, readHistory } from "@/lib/storage";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const today = getTodayString();

  useEffect(() => {
    const onFocus = () => setRefreshKey((v) => v + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const history = useMemo(() => readHistory(), [refreshKey]);

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Min Max Log</h1>
      <p className="text-sm text-slate-500">Pick your workout and log fast.</p>
      {workoutTemplates.map((w) => {
        const last = history
          .filter((h) => h.workoutTemplateId === w.id && !h.isDraft)
          .sort((a, b) => (a.logDate < b.logDate ? 1 : -1))[0];
        const hasDraft = Boolean(readDraft(w.id, today));

        return (
          <Link key={w.id} href={`/workout/${w.id}`} className="block rounded-2xl bg-white p-4 shadow-sm active:scale-[0.99]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{w.name}</h2>
              <span className="rounded px-2 py-1 text-xs text-emerald-700 bg-emerald-50">{hasDraft ? "Draft today" : "No draft"}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Last logged: {last?.logDate ?? "—"}</p>
          </Link>
        );
      })}
    </main>
  );
}
