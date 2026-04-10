"use client";

const parts = ["chest", "shoulders", "biceps", "triceps", "forearms", "abs", "quads", "hamstrings", "glutes", "calves", "lats", "upper back"];

export function BodyMap({ onSelect }: { onSelect: (part: string) => void }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="mb-3 text-xs text-slate-500">Training development index (tonnage + consistency), not literal muscle size.</p>
      <svg viewBox="0 0 320 460" className="w-full">
        {parts.map((part, idx) => (
          <g key={part} onClick={() => onSelect(part)} className="cursor-pointer">
            <rect x={20 + (idx % 3) * 96} y={20 + Math.floor(idx / 3) * 62} width="84" height="52" rx="12" fill="#ccfbf1" stroke="#0f766e" />
            <text x={62 + (idx % 3) * 96} y={50 + Math.floor(idx / 3) * 62} textAnchor="middle" fontSize="11">{part}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
