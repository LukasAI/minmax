"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  Legend
} from "recharts";

export function TonnageAreaChart({ data, keyName, label }: { data: Array<Record<string, string | number>>; keyName: string; label: string }) {
  return (
    <div className="h-64 w-full rounded-2xl bg-white p-3">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey={keyName} stroke="#0f766e" fill="#99f6e4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContributionChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <div className="h-72 w-full rounded-2xl bg-white p-3">
      <p className="mb-2 text-sm font-semibold">Body part contribution</p>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="chest" stackId="a" fill="#14b8a6" />
          <Bar dataKey="back" stackId="a" fill="#0891b2" />
          <Bar dataKey="shoulders" stackId="a" fill="#6366f1" />
          <Bar dataKey="legs" stackId="a" fill="#f59e0b" />
          <Line dataKey="overload" stroke="#111827" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
