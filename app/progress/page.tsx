"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { percentageDelta } from "@/lib/aggregation";

const TonnageAreaChart = dynamic(() => import("@/components/charts/tonnage-chart").then((m) => m.TonnageAreaChart), { ssr: false });
const ContributionChart = dynamic(() => import("@/components/charts/tonnage-chart").then((m) => m.ContributionChart), { ssr: false });

const sample = [
  { date: "W1", total: 5400, upper: 3600, lower: 1800, chest: 1500, back: 1200, shoulders: 700, legs: 2000, overload: 1.0 },
  { date: "W2", total: 6200, upper: 3800, lower: 2400, chest: 1800, back: 1300, shoulders: 700, legs: 2400, overload: 1.08 },
  { date: "W3", total: 5800, upper: 3400, lower: 2400, chest: 1500, back: 1300, shoulders: 600, legs: 2400, overload: 1.04 },
  { date: "W4", total: 7000, upper: 4100, lower: 2900, chest: 1900, back: 1500, shoulders: 700, legs: 2900, overload: 1.18 }
];

const groups = ["Daily", "Weekly", "Monthly", "All time"] as const;

export default function ProgressPage() {
  const [group, setGroup] = useState<(typeof groups)[number]>("Weekly");

  const delta = useMemo(() => {
    const current = sample[sample.length - 1]?.total ?? 0;
    const previous = sample[sample.length - 2]?.total ?? 0;
    const value = percentageDelta(current, previous);
    const prefix = value >= 0 ? "+" : "−";
    return `${prefix}${Math.abs(value).toFixed(1)}% vs last ${group.toLowerCase()}`;
  }, [group]);

  const latest = sample[sample.length - 1];
  const totalParts = latest.chest + latest.back + latest.shoulders + latest.legs;

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Progress</h1>
      <div className="grid grid-cols-4 gap-2 text-xs">
        {groups.map((f) => (
          <button key={f} onClick={() => setGroup(f)} className={`rounded-lg border px-2 py-1 ${group === f ? "bg-slate-900 text-white" : "bg-white"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-brand-light p-3 text-sm font-semibold">{delta}</div>

      <TonnageAreaChart data={sample} keyName="total" label="Total tonnage" />
      <TonnageAreaChart data={sample} keyName="upper" label="Upper body tonnage" />
      <TonnageAreaChart data={sample} keyName="lower" label="Lower body tonnage" />
      <ContributionChart data={sample} />

      <div className="rounded-2xl bg-white p-3 text-sm">
        <p className="font-semibold">Body part contribution</p>
        <p>Chest — {Math.round((latest.chest / totalParts) * 100)}%</p>
        <p>Back — {Math.round((latest.back / totalParts) * 100)}%</p>
        <p>Shoulders — {Math.round((latest.shoulders / totalParts) * 100)}%</p>
        <p>Legs — {Math.round((latest.legs / totalParts) * 100)}%</p>
      </div>
    </main>
  );
}
