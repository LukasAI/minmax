import { exerciseTemplates } from "@/lib/data";
import { calculateExerciseTonnage } from "@/lib/tonnage";
import { StoredWorkoutHistory } from "@/lib/types";

export function daysAgoLabel(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export function formatLastValue(weight: number | null, reps: number | null, logDate?: string) {
  if (!weight || !reps) return "No data yet";
  return `${weight} kg × ${reps}${logDate ? ` (${daysAgoLabel(logDate)})` : ""}`;
}

export function computeBestExerciseTonnage(workoutTemplateId: string, exerciseTemplateId: string, logs: StoredWorkoutHistory[]) {
  const row = exerciseTemplates.find((e) => e.id === exerciseTemplateId && e.workoutTemplateId === workoutTemplateId);
  if (!row) return null;

  const values = logs
    .filter((l) => !l.isDraft && l.workoutTemplateId === workoutTemplateId)
    .flatMap((l) => l.entries.filter((e) => e.exerciseTemplateId === exerciseTemplateId))
    .map((entry) => calculateExerciseTonnage(entry.weight, entry.reps, row.defaultSetCount))
    .filter((x) => x > 0);

  if (!values.length) return null;
  return Math.max(...values);
}

export function getPreviousCompletedLog(workoutTemplateId: string, today: string, logs: StoredWorkoutHistory[]) {
  return logs
    .filter((l) => l.workoutTemplateId === workoutTemplateId && !l.isDraft && l.logDate < today)
    .sort((a, b) => (a.logDate < b.logDate ? 1 : -1))[0];
}
