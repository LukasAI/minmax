"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LastTimeModal } from "@/components/workout/last-time-modal";
import { WorkoutTable } from "@/components/workout/workout-table";
import { exerciseTemplates, workoutTemplates } from "@/lib/data";
import { clearDraft, getTodayString, readDraft, readHistory, appendCompletedLog } from "@/lib/storage";

export default function WorkoutPage() {
  const params = useParams<{ id: string }>();
  const today = getTodayString();
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const workout = workoutTemplates.find((w) => w.id === params.id);

  const lastLog = useMemo(
    () =>
      readHistory()
        .filter((h) => h.workoutTemplateId === params.id && !h.isDraft && h.logDate < today)
        .sort((a, b) => (a.logDate < b.logDate ? 1 : -1))[0],
    [params.id, today, historyVersion]
  );

  const items = useMemo(
    () =>
      exerciseTemplates
        .filter((x) => x.workoutTemplateId === params.id)
        .map((x) => {
          const found = lastLog?.entries.find((e) => e.exerciseTemplateId === x.id);
          const text = found && found.weight && found.reps ? `${found.weight} kg × ${found.reps}` : "Skipped";
          return { exerciseName: x.exerciseName, text };
        }),
    [lastLog, params.id]
  );

  const summary = useMemo(
    () => ({
      logDate: lastLog?.logDate ?? null,
      totalTonnage: lastLog?.totalTonnage ?? 0,
      totalCount: items.length,
      completedCount: items.filter((i) => i.text !== "Skipped").length
    }),
    [items, lastLog]
  );


  if (!workout) return <main className="p-4">Workout not found.</main>;

  const handleStart = () => {
    setStarted(true);
    const onceKey = `minmax:last-time-opened:${workout.id}:${today}`;
    const hasOpened = localStorage.getItem(onceKey) === "1";
    if (!hasOpened) {
      setOpen(true);
      localStorage.setItem(onceKey, "1");
    }
  };

  const handleFinish = () => {
    const draft = readDraft(workout.id, today);
    if (!draft) return;
    appendCompletedLog(workout.id, today, draft.entries);
    clearDraft(workout.id, today);
    setHistoryVersion((v) => v + 1);
  };

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workout.name}</h1>
        <Link href="/" className="text-sm text-slate-500">Home</Link>
      </div>

      {!started ? (
        <Button size="lg" className="w-full" onClick={handleStart}>
          Log
        </Button>
      ) : (
        <WorkoutTable workoutTemplateId={workout.id} />
      )}

      <LastTimeModal open={open} onOpenChange={setOpen} items={items} summary={summary} />

      <footer className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-xl gap-2 border-t bg-white p-3">
        <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>Last time</Button>
        <Link href="/progress" className="flex-1"><Button variant="ghost" className="w-full">Progress</Button></Link>
        <Button className="flex-1" onClick={handleFinish}>Finish Workout</Button>
      </footer>
    </main>
  );
}
