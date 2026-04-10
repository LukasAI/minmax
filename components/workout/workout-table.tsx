"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { exerciseTemplates } from "@/lib/data";
import { computeBestExerciseTonnage, formatLastValue } from "@/lib/history";
import { getTodayString, readDraft, readHistory, upsertDraft } from "@/lib/storage";
import { calculateExerciseTonnage } from "@/lib/tonnage";
import type { AutosaveState, StoredWorkoutHistory } from "@/lib/types";

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function WorkoutTable({ workoutTemplateId }: { workoutTemplateId: string }) {
  const rows = useMemo(
    () => exerciseTemplates.filter((e) => e.workoutTemplateId === workoutTemplateId).sort((a, b) => a.displayOrder - b.displayOrder),
    [workoutTemplateId]
  );

  const [data, setData] = useState<Record<string, { weight: string; reps: string }>>({});
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("Saved");
  const [history, setHistory] = useState<StoredWorkoutHistory[]>([]);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const today = getTodayString();
    const draft = readDraft(workoutTemplateId, today);
    if (draft?.entries) setData(draft.entries);
    setHistory(readHistory());
  }, [workoutTemplateId]);

  const previousByExercise = useMemo(() => {
    const map: Record<string, { weight: number | null; reps: number | null; date: string } | null> = {};
    for (const row of rows) {
      const found = history
        .filter((h) => h.workoutTemplateId === workoutTemplateId && !h.isDraft)
        .sort((a, b) => (a.logDate < b.logDate ? 1 : -1))
        .flatMap((h) => h.entries.map((e) => ({ e, date: h.logDate })))
        .find((x) => x.e.exerciseTemplateId === row.id && x.e.weight && x.e.reps);
      map[row.id] = found ? { weight: found.e.weight, reps: found.e.reps, date: found.date } : null;
    }
    return map;
  }, [history, rows, workoutTemplateId]);

  const total = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const entry = data[row.id];
        return sum + calculateExerciseTonnage(Number(entry?.weight) || null, Number(entry?.reps) || null, row.defaultSetCount);
      }, 0),
    [data, rows]
  );

  const autosave = (nextData: Record<string, { weight: string; reps: string }>) => {
    setAutosaveState("Saving...");
    upsertDraft({
      workoutTemplateId,
      logDate: getTodayString(),
      entries: nextData,
      updatedAt: new Date().toISOString()
    });

    if (isOffline()) {
      setAutosaveState("Offline Draft");
      return;
    }

    setAutosaveState("Syncing...");
    startTransition(async () => {
      await fetch("/api/workout-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: Object.entries(nextData).map(([exerciseTemplateId, value]) => ({
            exerciseTemplateId,
            weight: Number(value.weight) || null,
            reps: Number(value.reps) || null
          }))
        })
      });
      setAutosaveState("Saved");
    });
  };

  const handleChange = (exerciseId: string, key: "weight" | "reps", value: string) => {
    setData((prev) => {
      const next = { ...prev, [exerciseId]: { ...prev[exerciseId], [key]: value } };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => autosave(next), 400);
      return next;
    });
  };

  const focusNext = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const fields = Array.from(document.querySelectorAll<HTMLInputElement>("input[data-cell]"));
    const index = fields.findIndex((x) => x === event.currentTarget);
    if (index >= 0 && fields[index + 1]) fields[index + 1].focus();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-500">Autosave: {isPending ? "Syncing..." : autosaveState}</div>
      <div className="space-y-3">
        {rows.map((row) => {
          const previous = previousByExercise[row.id];
          const best = computeBestExerciseTonnage(workoutTemplateId, row.id, history);
          return (
            <div key={row.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="sticky top-0 bg-white">
                <p className="font-semibold">{row.exerciseName}</p>
                <p className="text-xs text-slate-400">Last: {previous ? formatLastValue(previous.weight, previous.reps, previous.date) : "No data yet"}</p>
                <p className="text-xs text-slate-400">Best tonnage: {best ? `${best.toLocaleString()} kg` : "No data yet"}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  data-cell
                  inputMode="decimal"
                  type="number"
                  placeholder="Weight (kg)"
                  className="h-14 w-full rounded-xl border border-slate-200 px-3 text-lg"
                  value={data[row.id]?.weight ?? ""}
                  onKeyDown={focusNext}
                  onChange={(e) => handleChange(row.id, "weight", e.target.value)}
                />
                <input
                  data-cell
                  inputMode="numeric"
                  type="number"
                  placeholder="Reps"
                  className="h-14 w-full rounded-xl border border-slate-200 px-3 text-lg"
                  value={data[row.id]?.reps ?? ""}
                  onKeyDown={focusNext}
                  onChange={(e) => handleChange(row.id, "reps", e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl bg-brand-light p-3 text-sm font-semibold">Workout tonnage: {total.toLocaleString()} kg</div>
    </div>
  );
}
