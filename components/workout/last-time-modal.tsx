"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { daysAgoLabel } from "@/lib/history";
import { Button } from "@/components/ui/button";

interface LastTimeItem {
  exerciseName: string;
  text: string;
}

interface LastTimeSummary {
  logDate: string | null;
  totalTonnage: number;
  completedCount: number;
  totalCount: number;
}

export function LastTimeModal({
  open,
  onOpenChange,
  items,
  summary
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: LastTimeItem[];
  summary: LastTimeSummary;
}) {
  const lastPerformed = summary.logDate ? `${summary.logDate} (${daysAgoLabel(summary.logDate)})` : "No last time data yet";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5">
          <Dialog.Title className="text-lg font-bold">Last time</Dialog.Title>
          <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p>Last performed: <span className="font-semibold text-slate-900">{lastPerformed}</span></p>
            <p>Workout tonnage: <span className="font-semibold text-slate-900">{summary.totalTonnage.toLocaleString()} kg</span></p>
            <p>Exercises completed: <span className="font-semibold text-slate-900">{summary.completedCount}/{summary.totalCount}</span></p>
          </div>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <li key={item.exerciseName} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{item.exerciseName}</span>
                <span className="font-semibold">{item.text}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full" onClick={() => onOpenChange(false)}>
            Start logging
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
