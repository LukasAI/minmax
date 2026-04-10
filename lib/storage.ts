import { calculateWorkoutTonnage } from "@/lib/tonnage";
import { exerciseTemplates } from "@/lib/data";
import { StoredWorkoutDraft, StoredWorkoutHistory } from "@/lib/types";

const DRAFT_KEY = "minmax:drafts";
const HISTORY_KEY = "minmax:history";

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function readDraft(workoutTemplateId: string, logDate: string) {
  const drafts = safeRead<StoredWorkoutDraft[]>(DRAFT_KEY, []);
  return drafts.find((d) => d.workoutTemplateId === workoutTemplateId && d.logDate === logDate) ?? null;
}

export function upsertDraft(draft: StoredWorkoutDraft) {
  const drafts = safeRead<StoredWorkoutDraft[]>(DRAFT_KEY, []);
  const idx = drafts.findIndex((d) => d.workoutTemplateId === draft.workoutTemplateId && d.logDate === draft.logDate);
  if (idx >= 0) drafts[idx] = draft;
  else drafts.push(draft);
  safeWrite(DRAFT_KEY, drafts);
}

export function clearDraft(workoutTemplateId: string, logDate: string) {
  const drafts = safeRead<StoredWorkoutDraft[]>(DRAFT_KEY, []);
  safeWrite(
    DRAFT_KEY,
    drafts.filter((d) => !(d.workoutTemplateId === workoutTemplateId && d.logDate === logDate))
  );
}

export function readHistory() {
  return safeRead<StoredWorkoutHistory[]>(HISTORY_KEY, []);
}

export function appendCompletedLog(workoutTemplateId: string, logDate: string, entries: Record<string, { weight: string; reps: string }>) {
  const history = readHistory();
  const templateRows = exerciseTemplates.filter((e) => e.workoutTemplateId === workoutTemplateId);
  const normalized = templateRows.map((row) => {
    const weight = Number(entries[row.id]?.weight) || null;
    const reps = Number(entries[row.id]?.reps) || null;
    const skipped = !weight || !reps;
    return {
      exerciseTemplateId: row.id,
      weight,
      reps,
      skipped,
      tonnage: skipped ? 0 : weight * reps * row.defaultSetCount
    };
  });

  const totalTonnage = calculateWorkoutTonnage(
    normalized.map((n) => ({ exerciseTemplateId: n.exerciseTemplateId, weight: n.weight, reps: n.reps })),
    templateRows
  );

  history.push({
    id: crypto.randomUUID(),
    workoutTemplateId,
    logDate,
    isDraft: false,
    entries: normalized,
    totalTonnage
  });

  safeWrite(HISTORY_KEY, history);
}
